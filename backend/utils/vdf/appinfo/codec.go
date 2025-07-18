package appinfo

import (
	"bufio"
	"bytes"
	"crypto/sha1"
	"encoding/binary"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"reflect"
	"sort"
	"time"

	"meta/backend/utils/vdf/text"
)

const (
	version41 uint64 = 0x107564429
	version40 uint64 = 0x107564428
)

// AppInfo mirrors the structure of an App Chunk.
type AppInfo struct {
	AppID        uint32                 `json:"appid"`
	InfoState    uint32                 `json:"state"`
	LastUpdated  time.Time              `json:"last_update"`
	Token        uint64                 `json:"access_token"`
	ChangeNumber uint32                 `json:"change_number"`
	Extended     map[string]interface{} `json:"extended"`

	size       uint32   // Internal field, calculated on encode
	hash       [20]byte // Internal field, calculated on encode
	binaryHash [20]byte // Internal field, calculated on encode
}

type token byte

const (
	tokenNodeStart token = 0x00
	tokenString    token = 0x01
	tokenInt32     token = 0x02
	tokenNodeEnd   token = 0x08
)

// Marshal encodes a slice of AppInfo into a byte slice in VDF version 41 format.
func Marshal(v []AppInfo) ([]byte, error) {
	var buf bytes.Buffer
	encoder := NewEncoder(&buf)
	if err := encoder.Encode(v); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// Unmarshal decodes a byte slice into a slice of AppInfo.
// It also returns the detected VDF version.
func Unmarshal(data []byte) ([]AppInfo, uint64, error) {
	d, err := NewDecoder(data)
	if err != nil {
		return nil, 0, err
	}
	apps, err := d.Decode()
	if err != nil {
		return nil, d.version, err
	}
	return apps, d.version, nil
}

// --- DECODER ---

// Decoder for VDF appinfo format.
type Decoder struct {
	r            *bytes.Reader
	log          *log.Logger
	version      uint64
	stringTable  []string
	stringOffset int64
}

// NewDecoder creates a new VDF decoder from a byte slice.
func NewDecoder(data []byte) (*Decoder, error) {
	d := &Decoder{r: bytes.NewReader(data)}

	if d.r.Len() < 8 {
		return nil, fmt.Errorf("file too short to contain version header")
	}
	if err := binary.Read(d.r, binary.LittleEndian, &d.version); err != nil {
		return nil, err
	}

	if d.version != version41 && d.version != version40 {
		return nil, fmt.Errorf("incompatible VDF version: 0x%x", d.version)
	}
	return d, nil
}

// Decode reads and parses all AppInfo chunks from the VDF data.
func (d *Decoder) Decode() ([]AppInfo, error) {
	if d.version == version41 {
		if err := d.readStringTable(); err != nil {
			return nil, err
		}
	}

	appPtrs, err := d.readAllApps()
	if err != nil {
		return nil, err
	}

	apps := make([]AppInfo, len(appPtrs))
	for i, ptr := range appPtrs {
		apps[i] = *ptr
	}

	return apps, nil
}

func (d *Decoder) readStringTable() error {
	if err := binary.Read(d.r, binary.LittleEndian, &d.stringOffset); err != nil {
		return fmt.Errorf("failed to read string table offset: %w", err)
	}

	currentPos, _ := d.r.Seek(0, io.SeekCurrent)
	if _, err := d.r.Seek(d.stringOffset, io.SeekStart); err != nil {
		return fmt.Errorf("failed to seek to string table: %w", err)
	}

	var stringCount uint32
	if err := binary.Read(d.r, binary.LittleEndian, &stringCount); err != nil {
		return fmt.Errorf("failed to read string count: %w", err)
	}

	d.stringTable = make([]string, stringCount)
	tempBuf := bufio.NewReader(d.r)
	for i := 0; i < int(stringCount); i++ {
		str, err := tempBuf.ReadString(0x00)
		if err != nil {
			return fmt.Errorf("failed to read string %d from table: %w", i, err)
		}
		d.stringTable[i] = str[:len(str)-1]
	}

	if _, err := d.r.Seek(currentPos, io.SeekStart); err != nil {
		return fmt.Errorf("failed to seek back: %w", err)
	}
	if d.log != nil {
		d.log.Printf("Read %d strings from table. Returned to position %d.", stringCount, currentPos)
	}
	return nil
}

func (d *Decoder) stopReading() bool {
	pos, _ := d.r.Seek(0, io.SeekCurrent)
	if d.version == version40 {
		return pos >= int64(d.r.Len()-4)
	}
	if d.version == version41 {
		return pos >= d.stringOffset-4
	}
	return true
}

func (d *Decoder) readAllApps() ([]*AppInfo, error) {
	apps := make([]*AppInfo, 0)
	i := 0
	for !d.stopReading() {
		startPos, _ := d.r.Seek(0, io.SeekCurrent)

		app, err := d.readHeader()
		if err != nil {
			return nil, fmt.Errorf("at offset %d, failed to read app header: %w", startPos, err)
		}

		if app.size < 60 {
			return nil, fmt.Errorf("app %d has an invalid size field: %d (must be at least 60)", app.AppID, app.size)
		}
		vdfDataSize := int64(app.size) - 60

		if d.log != nil && i < 10 {
			d.log.Printf("--- Reading App Chunk %d (AppID: %d) at offset %d ---", i, app.AppID, startPos)
			d.log.Printf("Header size field reports %d. Calculated VDF data size is %d.", app.size, vdfDataSize)
		}

		vdfReader := io.LimitReader(d.r, vdfDataSize)
		vdfDecoder := newVDFDecoder(vdfReader, d.version, d.stringTable, d.log, i < 10)
		app.Extended, err = vdfDecoder.parse()
		if err != nil && err != io.EOF {
			return nil, fmt.Errorf("failed to parse VDF for app %d: %w", app.AppID, err)
		}

		if vdfReader.(*io.LimitedReader).N > 0 {
			if d.log != nil {
				d.log.Printf("WARNING for App %d: VDF parser finished but %d bytes remain in its chunk. Skipping.", app.AppID, vdfReader.(*io.LimitedReader).N)
			}
			if _, err := io.CopyN(ioutil.Discard, d.r, vdfReader.(*io.LimitedReader).N); err != nil {
				return nil, fmt.Errorf("failed to skip remaining bytes for app %d", app.AppID)
			}
		}

		apps = append(apps, app)
		i++
	}
	return apps, nil
}

func (d *Decoder) readHeader() (*AppInfo, error) {
	app := &AppInfo{}
	var lastUpdatedUnix uint32

	binary.Read(d.r, binary.LittleEndian, &app.AppID)
	binary.Read(d.r, binary.LittleEndian, &app.size)
	binary.Read(d.r, binary.LittleEndian, &app.InfoState)
	binary.Read(d.r, binary.LittleEndian, &lastUpdatedUnix)
	app.LastUpdated = time.Unix(int64(lastUpdatedUnix), 0)
	binary.Read(d.r, binary.LittleEndian, &app.Token)

	io.ReadFull(d.r, app.hash[:])

	binary.Read(d.r, binary.LittleEndian, &app.ChangeNumber)

	io.ReadFull(d.r, app.binaryHash[:])

	return app, nil
}

type vdfDecoder struct {
	r           *bufio.Reader
	version     uint64
	stringTable []string
	log         *log.Logger
	shouldLog   bool
}

func newVDFDecoder(r io.Reader, version uint64, stringTable []string, log *log.Logger, shouldLog bool) *vdfDecoder {
	return &vdfDecoder{
		r:           bufio.NewReader(r),
		version:     version,
		stringTable: stringTable,
		log:         log,
		shouldLog:   shouldLog,
	}
}

func (d *vdfDecoder) parse() (map[string]interface{}, error) {
	return d.parseSubsections(0)
}

func (d *vdfDecoder) parseSubsections(depth int) (map[string]interface{}, error) {
	result := make(map[string]interface{})
	for {
		tokByte, err := d.r.ReadByte()
		if err != nil {
			return nil, err
		}
		tok := token(tokByte)

		if tok == tokenNodeEnd {
			return result, nil
		}

		var key string
		if d.version == version41 {
			key, err = d.readKeyFromStringTable()
		} else { // version 40
			key, err = d.readString()
		}
		if err != nil {
			return nil, fmt.Errorf("failed to read key: %w", err)
		}

		if d.shouldLog && d.log != nil {
			d.log.Printf("Depth %d: Token=0x%02x, Key='%s'", depth, tok, key)
		}

		var value interface{}
		switch tok {
		case tokenNodeStart:
			value, err = d.parseSubsections(depth + 1)
		case tokenString:
			value, err = d.readString()
		case tokenInt32:
			var val uint32
			err = binary.Read(d.r, binary.LittleEndian, &val)
			value = val
		default:
			return nil, fmt.Errorf("unknown token type '0x%x' for key '%s'", tok, key)
		}
		if err != nil {
			return nil, err
		}

		addToMap(result, key, value)
	}
}

func (d *vdfDecoder) readString() (string, error) {
	b, err := d.r.ReadBytes(0x00)
	if err != nil {
		return "", err
	}
	return string(b[:len(b)-1]), nil
}

func (d *vdfDecoder) readKeyFromStringTable() (string, error) {
	var index uint32
	if err := binary.Read(d.r, binary.LittleEndian, &index); err != nil {
		return "", err
	}
	if int(index) >= len(d.stringTable) {
		return "", fmt.Errorf("string table index %d out of bounds (table size %d)", index, len(d.stringTable))
	}
	return d.stringTable[index], nil
}

func addToMap(m map[string]interface{}, key string, value interface{}) {
	if existingValue, ok := m[key]; ok {
		if slice, isSlice := existingValue.([]interface{}); isSlice {
			m[key] = append(slice, value)
		} else {
			m[key] = []interface{}{existingValue, value}
		}
	} else {
		m[key] = value
	}
}

// --- ENCODER ---

// Encoder for VDF appinfo format.
type Encoder struct {
	w   io.Writer
	log *log.Logger
}

// NewEncoder creates a new VDF encoder.
func NewEncoder(w io.Writer) *Encoder {
	return &Encoder{w: w}
}

// SetLogOutput sets a logger for the encoder.
func (enc *Encoder) SetLogOutput(w io.Writer) {
	enc.log = log.New(w, "vdf-encoder: ", log.Lshortfile)
}

// Encode writes the provided AppInfo slice to the writer in VDF version 41 format.
func (enc *Encoder) Encode(apps []AppInfo) error {
	buf := new(bytes.Buffer)

	stringMap := make(map[string]uint32)
	stringList := make([]string, 0)
	addKeyToStringTable := func(s string) {
		if _, exists := stringMap[s]; !exists {
			stringMap[s] = uint32(len(stringList))
			stringList = append(stringList, s)
		}
	}
	var collectKeys func(data map[string]interface{})
	collectKeys = func(data map[string]interface{}) {
		for key, val := range data {
			addKeyToStringTable(key)
			if subMap, ok := val.(map[string]interface{}); ok {
				collectKeys(subMap)
			} else if slice, ok := val.([]interface{}); ok {
				for _, item := range slice {
					if subMap, ok := item.(map[string]interface{}); ok {
						collectKeys(subMap)
					}
				}
			}
		}
	}
	for _, app := range apps {
		collectKeys(app.Extended)
	}

	binary.Write(buf, binary.LittleEndian, version41)
	binary.Write(buf, binary.LittleEndian, int64(0)) // Placeholder

	for i := range apps {
		app := &apps[i] // Use a pointer to modify the app in the slice

		vdfDataBuf := new(bytes.Buffer)
		vdfEncoder := newVDFEncoder(vdfDataBuf, stringMap)
		if err := vdfEncoder.encode(app.Extended); err != nil {
			return fmt.Errorf("failed to encode VDF data for app %d: %w", app.AppID, err)
		}
		vdfData := vdfDataBuf.Bytes()

		// The VDF data needs to be hashed to verify.
		// The VDF text serialization is not stable, so we need to use the text package to serialize it.
		textVDFBytes, err := text.MarshalMap("appinfo", app.Extended["appinfo"].(map[string]interface{}))
		if err != nil {
			return fmt.Errorf("failed to marshal extended data to text for hashing for app %d: %w", app.AppID, err)
		}

		app.size = uint32(60 + len(vdfData))

		// Hash is calculated over the VDF data part
		app.hash = sha1.Sum(textVDFBytes)
		app.binaryHash = sha1.Sum(vdfData)

		if err := writeHeader(buf, app); err != nil {
			return fmt.Errorf("failed to write header for app %d: %w", app.AppID, err)
		}
		buf.Write(vdfData)
	}

	stringOffset := int64(buf.Len())
	binary.Write(buf, binary.LittleEndian, uint32(len(stringList)))
	for _, s := range stringList {
		buf.WriteString(s)
		buf.WriteByte(0x00)
	}

	finalBytes := buf.Bytes()
	binary.LittleEndian.PutUint64(finalBytes[8:16], uint64(stringOffset))

	_, err := enc.w.Write(finalBytes)
	return err
}

func writeHeader(w io.Writer, app *AppInfo) error {
	binary.Write(w, binary.LittleEndian, app.AppID)
	binary.Write(w, binary.LittleEndian, app.size)
	binary.Write(w, binary.LittleEndian, app.InfoState)
	binary.Write(w, binary.LittleEndian, uint32(app.LastUpdated.Unix()))
	binary.Write(w, binary.LittleEndian, app.Token)
	w.Write(app.hash[:])
	binary.Write(w, binary.LittleEndian, app.ChangeNumber)
	w.Write(app.binaryHash[:])
	return nil
}

type vdfEncoder struct {
	w         *bytes.Buffer
	stringMap map[string]uint32
}

func newVDFEncoder(w *bytes.Buffer, stringMap map[string]uint32) *vdfEncoder {
	return &vdfEncoder{w: w, stringMap: stringMap}
}

func (e *vdfEncoder) encode(data map[string]interface{}) error {
	if err := e.encodeSubsections(data); err != nil {
		return err
	}
	e.w.WriteByte(byte(tokenNodeEnd))
	return nil
}

func (e *vdfEncoder) encodeSubsections(data map[string]interface{}) error {
	keys := make([]string, 0, len(data))
	for k := range data {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	for _, key := range keys {
		value := data[key]
		if slice, ok := value.([]interface{}); ok {
			for _, item := range slice {
				if err := e.writeKeyValuePair(key, item); err != nil {
					return err
				}
			}
		} else {
			if err := e.writeKeyValuePair(key, value); err != nil {
				return err
			}
		}
	}
	return nil
}

func (e *vdfEncoder) writeKeyValuePair(key string, value interface{}) error {
	var tok token
	var val interface{}

	switch v := value.(type) {
	case map[string]interface{}:
		tok = tokenNodeStart
		val = v
	case string:
		tok = tokenString
		val = v
	case float64: // JSON numbers are often float64
		tok = tokenInt32
		val = uint32(v)
	case int:
		tok = tokenInt32
		val = uint32(v)
	case uint32:
		tok = tokenInt32
		val = v
	default:
		return fmt.Errorf("unsupported value type for key '%s': %T", key, reflect.TypeOf(value))
	}

	e.w.WriteByte(byte(tok))
	keyIndex := e.stringMap[key]
	binary.Write(e.w, binary.LittleEndian, keyIndex)

	switch v := val.(type) {
	case map[string]interface{}:
		if err := e.encodeSubsections(v); err != nil {
			return err
		}
		e.w.WriteByte(byte(tokenNodeEnd))
	case string:
		e.w.WriteString(v)
		e.w.WriteByte(0x00)
	case uint32:
		binary.Write(e.w, binary.LittleEndian, v)
	}

	return nil
}
