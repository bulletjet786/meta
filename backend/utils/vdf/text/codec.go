package text

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"reflect"
	"sort"
	"strconv"
	"strings"
	"text/scanner"

	"github.com/mitchellh/mapstructure"
)

// --- Deserialization (Unmarshal) ---

// Unmarshal parses VDF-encoded data and populates the value pointed to by v.
// v must be a non-nil pointer to a struct that has exactly one exported field
// with a `vdf` tag.
func Unmarshal(data []byte, v interface{}) error {
	dec := NewDecoder(bytes.NewReader(data))
	return dec.Decode(v)
}

// UnmarshalMap parses VDF-encoded data into a map[string]interface{}.
func UnmarshalMap(data []byte) (string, map[string]interface{}, error) {
	dec := NewDecoder(bytes.NewReader(data))
	return dec.DecodeMap()
}

// Decoder reads and decodes VDF values from an input stream.
type Decoder struct {
	s *scanner.Scanner
}

// NewDecoder returns a new decoder that reads from r.
func NewDecoder(r io.Reader) *Decoder {
	s := &scanner.Scanner{}
	s.Init(r)
	// Set the scanner mode to recognize C-style backslash escapes.
	s.Mode = scanner.ScanIdents | scanner.ScanFloats | scanner.ScanChars | scanner.ScanStrings | scanner.ScanRawStrings | scanner.ScanComments
	s.IsIdentRune = func(ch rune, i int) bool {
		return ch != '{' && ch != '}' && ch != '"' && !isWhitespace(ch)
	}
	s.Whitespace = 1<<'\t' | 1<<'\n' | 1<<'\r' | 1<<' '
	return &Decoder{s: s}
}

// Decode reads the next VDF-encoded value from its input and stores it in the value pointed to by v.
func (dec *Decoder) Decode(v interface{}) error {
	rv := reflect.ValueOf(v)
	if rv.Kind() != reflect.Ptr || rv.IsNil() || rv.Elem().Kind() != reflect.Struct {
		return errors.New("vdf: v must be a non-nil pointer to a struct")
	}

	topKey, m, err := dec.DecodeMap()
	if err != nil {
		return err
	}

	if topKey == "" && m == nil {
		return nil // Handle empty input
	}

	wrappedMap := map[string]interface{}{topKey: m}

	config := &mapstructure.DecoderConfig{
		Result:           v,
		TagName:          "vdf",
		WeaklyTypedInput: true, // Allows string-to-int/float conversion
	}
	decoder, err := mapstructure.NewDecoder(config)
	if err != nil {
		return fmt.Errorf("vdf: failed to create mapstructure decoder: %w", err)
	}

	return decoder.Decode(wrappedMap)
}

// DecodeMap reads the next VDF-encoded value from its input and returns it as a map.
func (dec *Decoder) DecodeMap() (string, map[string]interface{}, error) {
	tok := dec.s.Scan()
	if tok == scanner.EOF {
		return "", nil, nil // An empty file is valid
	}
	if tok != scanner.String {
		return "", nil, fmt.Errorf("vdf: expected a string key at the beginning, got %s", dec.s.TokenText())
	}
	topLevelKey := unquote(dec.s.TokenText())

	if tok := dec.s.Scan(); tok != '{' {
		return "", nil, fmt.Errorf("vdf: expected '{' after top level key %q, got %s", topLevelKey, dec.s.TokenText())
	}

	m, err := dec.unmarshalMap()
	if err != nil {
		return "", nil, err
	}

	return topLevelKey, m, nil
}

func (dec *Decoder) unmarshalMap() (map[string]interface{}, error) {
	m := make(map[string]interface{})
	for {
		tok := dec.s.Scan()
		switch tok {
		case '}':
			return m, nil // End of object
		case scanner.EOF:
			return nil, errors.New("vdf: unexpected end of file, object not closed")
		case scanner.String:
			key := unquote(dec.s.TokenText())
			nextToken := dec.s.Scan()
			if nextToken == '{' {
				nestedMap, err := dec.unmarshalMap()
				if err != nil {
					return nil, err
				}
				m[key] = nestedMap
			} else if nextToken == scanner.String {
				value := unquote(dec.s.TokenText())
				m[key] = value
			} else {
				return nil, fmt.Errorf("vdf: expected '{' or string value after key %q, got %s", key, dec.s.TokenText())
			}
		default:
			return nil, fmt.Errorf("vdf: expected string key or '}', got %s", dec.s.TokenText())
		}
	}
}

// --- Serialization (Marshal) ---

// Marshal returns the VDF encoding of v.
func Marshal(v interface{}) ([]byte, error) {
	var buf bytes.Buffer
	enc := NewEncoder(&buf)
	enc.SetIndent("", "\t")
	if err := enc.Encode(v); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// MarshalMap returns the VDF encoding of a map.
func MarshalMap(topKey string, v map[string]interface{}) ([]byte, error) {
	var buf bytes.Buffer
	enc := NewEncoder(&buf)
	enc.SetIndent("", "\t")
	if err := enc.EncodeMap(topKey, v); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// Encoder writes VDF values to an output stream.
type Encoder struct {
	w              io.Writer
	prefix, indent string
}

// NewEncoder returns a new encoder that writes to w.
func NewEncoder(w io.Writer) *Encoder {
	return &Encoder{w: w}
}

// SetIndent configures the encoder for pretty-printing.
func (enc *Encoder) SetIndent(prefix, indent string) {
	enc.prefix = prefix
	enc.indent = indent
}

// Encode writes the VDF encoding of v to the stream.
func (enc *Encoder) Encode(v interface{}) error {
	var m map[string]interface{}
	config := &mapstructure.DecoderConfig{
		Result:  &m,
		TagName: "vdf",
	}
	decoder, err := mapstructure.NewDecoder(config)
	if err != nil {
		return fmt.Errorf("vdf: failed to create mapstructure decoder: %w", err)
	}
	if err := decoder.Decode(v); err != nil {
		return fmt.Errorf("vdf: failed to convert struct to map: %w", err)
	}

	if len(m) != 1 {
		return errors.New("vdf: struct must have exactly one field with a 'vdf' tag")
	}

	for key, value := range m {
		// The top-level value from the struct must be a map to be valid VDF.
		data, ok := value.(map[string]interface{})
		if !ok {
			return fmt.Errorf("vdf: top-level field %q must be a struct or map, but got %T", key, value)
		}
		return enc.EncodeMap(key, data)
	}

	return nil // Should not be reached
}

// EncodeMap writes the VDF encoding of a map to the stream.
func (enc *Encoder) EncodeMap(topKey string, v map[string]interface{}) error {
	if _, err := fmt.Fprintf(enc.w, "%s%s\n%s{\n", enc.prefix, strconv.Quote(topKey), enc.prefix); err != nil {
		return err
	}

	if err := enc.encodeMapIface(v, 1); err != nil {
		return err
	}

	if _, err := fmt.Fprintf(enc.w, "%s}\n", enc.prefix); err != nil {
		return err
	}
	return nil
}

func (enc *Encoder) encodeMapIface(m map[string]interface{}, depth int) error {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	tabs := strings.Repeat(enc.indent, depth)

	for _, key := range keys {
		value := m[key]

		// Check if the value is a map
		rv := reflect.ValueOf(value)
		if rv.Kind() == reflect.Map {
			// Convert map to map[string]interface{} for consistent handling
			newMap := make(map[string]interface{})
			iter := rv.MapRange()
			for iter.Next() {
				newMap[fmt.Sprint(iter.Key().Interface())] = iter.Value().Interface()
			}

			// Write nested map header
			if _, err := fmt.Fprintf(enc.w, "%s%s\n%s{\n", tabs, strconv.Quote(key), tabs); err != nil {
				return err
			}
			// Recurse
			if err := enc.encodeMapIface(newMap, depth+1); err != nil {
				return err
			}
			// Write nested map footer
			if _, err := fmt.Fprintf(enc.w, "%s}\n", tabs); err != nil {
				return err
			}
		} else {
			// Write simple key-value pair
			valStr := fmt.Sprint(value)
			if _, err := fmt.Fprintf(enc.w, "%s%s\t\t%s\n", tabs, strconv.Quote(key), strconv.Quote(valStr)); err != nil {
				return err
			}
		}
	}
	return nil
}

// --- Helper Functions ---

// unquote safely removes quotes from a string, handling potential errors.
func unquote(s string) string {
	if len(s) < 2 || s[0] != '"' || s[len(s)-1] != '"' {
		// Not a quoted string, return as is.
		return s
	}
	// Attempt to unquote the string.
	// The primary goal is to handle standard escape sequences.
	// If it fails, it might be a string with unescaped quotes or other special characters.
	// In such cases, returning the substring without the outer quotes is a reasonable fallback.
	unescaped, err := strconv.Unquote(s)
	if err != nil {
		// Fallback for strings that `strconv.Unquote` cannot handle:
		// simply remove the outer quotes.
		return s[1 : len(s)-1]
	}
	return unescaped
}

// isWhitespace checks if a rune is a whitespace character.
func isWhitespace(ch rune) bool {
	return ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r'
}
