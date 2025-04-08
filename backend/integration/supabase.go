package integration

import (
	"fmt"

	"github.com/supabase-community/supabase-go"
)

const (
	apiUrl     = "https://joincyfzsuvolyklirho.supabase.co"
	anonKey    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW5jeWZ6c3V2b2x5a2xpcmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODc2MjMsImV4cCI6MjA1NjU2MzYyM30.1MOumBy-Hatxd25iynOUJh2ggIWdZMEzQeUfzV1fsZE"
	serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW5jeWZ6c3V2b2x5a2xpcmhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDk4NzYyMywiZXhwIjoyMDU2NTYzNjIzfQ.W4WWp_aoFiFSs-7b5pl1Q6ClAHhKR7KYp3BRJyvn8No"
)

func NewSupabaseClient() (*supabase.Client, error) {
	client, err := supabase.NewClient(apiUrl, serviceKey, &supabase.ClientOptions{
		Schema: "public",
	})
	if err != nil {
		return nil, fmt.Errorf("cannot initalize supabase client: %s", err)
	}
	return client, nil
}
