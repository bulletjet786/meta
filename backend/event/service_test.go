package event

import (
	"github.com/supabase-community/supabase-go"
	"meta/backend/integration"
	"testing"
)

func TestService_Send(t *testing.T) {
	client, err := integration.NewSupabaseClient()
	if err != nil {
		t.Fatal(err)
	}

	type fields struct {
		options ServiceOptions
		client  *supabase.Client
	}
	type args struct {
		eType   string
		subType string
		payload any
	}
	tests := []struct {
		name   string
		fields fields
		args   args
	}{
		{
			name: "send test event should success",
			fields: fields{
				options: ServiceOptions{
					DeviceId: "test-device-id",
					LaunchId: "test-launch-id",
				},
				client: client,
			},
			args: args{
				eType:   TypeForApp,
				subType: SubTypeForAppStart,
				payload: AppStartTypeEventPayload{
					Success: true,
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := &Service{
				options: tt.fields.options,
				client:  tt.fields.client,
			}
			s.E(tt.args.eType, tt.args.subType, tt.args.payload)
		})
	}
}
