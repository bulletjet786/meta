package event

import (
	"time"

	"github.com/supabase-community/supabase-go"

	"meta/backend/integration"
)

const ()

type Service struct {
	options ServiceOptions

	client *supabase.Client
}

type ServiceOptions struct {
	DeviceId string
}

func NewService(options ServiceOptions) (*Service, error) {
	client, err := integration.NewSupabaseClient()
	if err != nil {
		return nil, err
	}
	return &Service{
		options: options,
		client: client,
	}, nil
}

func (s *Service) Start() {}

func (s *Service) Send(eType string, subType string, payload any) {
	event := event{
		Id: "",
		DeviceId: s.options.DeviceId,
		Type:      eType,
		SubType:   subType,
		Payload:   payload,
		CreatedAt: time.Now(),
	}
	s.client.From("events").Insert(event, false, "", "", "")
}

type event struct {
	Id        string    `json:"id"`
	DeviceId  string 	`json:"device_id"`
	Type      string    `json:"type"`
	SubType   string    `json:"sub_type"`
	Payload   any       `json:"payload"`
	CreatedAt time.Time `json:"created_at"`
}