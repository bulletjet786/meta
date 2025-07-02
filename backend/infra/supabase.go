package integration

import (
	"fmt"

	"github.com/supabase-community/supabase-go"
)

const (
	SupabaseApiUrl  = "https://joincyfzsuvolyklirho.supabase.co"
	SupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW5jeWZ6c3V2b2x5a2xpcmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODc2MjMsImV4cCI6MjA1NjU2MzYyM30.1MOumBy-Hatxd25iynOUJh2ggIWdZMEzQeUfzV1fsZE"
)

func MustSupabaseClient() *supabase.Client {
	client, err := supabase.NewClient(SupabaseApiUrl, SupabaseAnonKey, &supabase.ClientOptions{
		Schema: "public",
	})
	if err != nil {
		slog.Error("cannot initalize supabase client", "err", err.Error())
		os.Exit(11)
		return nil
	}
	return client
}
