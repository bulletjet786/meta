package binary

import (
	"bufio"
	"bytes"
	"encoding/binary"
	"errors"
	"io"
	"reflect"
	"strings"
)

// Unmarshal parses the binary VDF-encoded data and stores the result
// in the value pointed to by v.
func Unmarshal(data []byte, v interface{}) error {
	dec := NewDecoder(bytes.NewReader(data))
	return dec.Decode(v)
}

// Decoder reads and decodes binary VDF values from an input stream.
type Decoder struct {
	r *bufio.Reader
}

// NewDecoder returns a new decoder that reads from r.
func NewDecoder(r io.Reader) *Decoder {
	return &Decoder{r: bufio.NewReader(r)}
}

// Decode reads the next binary VDF-encoded value from its
// input and stores it in the value pointed to by v.
func (dec *Decoder) Decode(v interface{}) error {
	rv := reflect.ValueOf(v)
	if rv.Kind() != reflect.Ptr || rv.IsNil() {
		return errors.New("binary.vdf: Decode(non-pointer " + reflect.TypeOf(v).String() + ")")
	}

	err := dec.unmarshal(rv.Elem())
	if err == io.EOF {
		return nil
	}
	return err
}

func (dec *Decoder) unmarshal(rv reflect.Value) error {
	for {
		typeByte, err := dec.r.ReadByte()
		if err != nil {
			if err == io.EOF {
				return nil // Valid end of file
			}
			return err
		}

		if typeByte == 0x0B { // End of object
			return nil
		}

		key, err := dec.readString()
		if err != nil {
			return err
		}

		if rv.Kind() == reflect.Struct {
			field, ok := findFieldByTag(rv, key)
			if !ok {
				if err := dec.skipValue(typeByte); err != nil {
					return err
				}
				continue
			}
			if err := dec.unmarshalValue(field, typeByte); err != nil {
				return err
			}
		} else if rv.Kind() == reflect.Map {
			if rv.IsNil() {
				rv.Set(reflect.MakeMap(rv.Type()))
			}
			mapValue := reflect.New(rv.Type().Elem()).Elem()
			if err := dec.unmarshalValue(mapValue, typeByte); err != nil {
				return err
			}
			rv.SetMapIndex(reflect.ValueOf(key), mapValue)
		}
	}
}

func (dec *Decoder) unmarshalValue(rv reflect.Value, typeByte byte) error {
	switch typeByte {
	case 0x00: // AppInfo
		return dec.unmarshal(rv)
	case 0x01: // String
		val, err := dec.readString()
		if err != nil {
			return err
		}
		rv.SetString(val)
	case 0x02: // Int32
		var val int32
		if err := binary.Read(dec.r, binary.LittleEndian, &val); err != nil {
			return err
		}
		rv.SetInt(int64(val))
	case 0x07: // Uint64
		var val uint64
		if err := binary.Read(dec.r, binary.LittleEndian, &val); err != nil {
			return err
		}
		rv.SetUint(val)
	default:
		return dec.skipValue(typeByte)
	}
	return nil
}

func (dec *Decoder) readString() (string, error) {
	str, err := dec.r.ReadString(0x00)
	if err != nil {
		return "", err
	}
	return str[:len(str)-1], nil
}

func (dec *Decoder) skipValue(typeByte byte) error {
	switch typeByte {
	case 0x00: // AppInfo
		for {
			b, err := dec.r.ReadByte()
			if err != nil {
				return err
			}
			if b == 0x0B {
				break
			}
			dec.r.UnreadByte()
			if err := dec.skipValue(b); err != nil {
				return err
			}
		}
	case 0x01: // String
		_, err := dec.readString()
		return err
	case 0x02: // Int32
		_, err := dec.r.Discard(4)
		return err
	case 0x07: // Uint64
		_, err := dec.r.Discard(8)
		return err
	default:
		return errors.New("unknown type to skip: " + string(typeByte))
	}
	return nil
}

func findFieldByTag(rv reflect.Value, tag string) (reflect.Value, bool) {
	if rv.Kind() != reflect.Struct {
		return reflect.Value{}, false
	}
	for i := 0; i < rv.NumField(); i++ {
		field := rv.Type().Field(i)
		if strings.EqualFold(field.Tag.Get("vdf"), tag) {
			return rv.Field(i), true
		}
	}
	return reflect.Value{}, false
}
