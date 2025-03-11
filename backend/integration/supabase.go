package integration

import (
	"fmt"

	"github.com/supabase-community/supabase-go"
)

const (
	apiUrl = "https://crh5nk8g91hjuhhg05pg.baseapi.memfiredb.com"
	apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiZXhwIjozMzAyOTEwNjczLCJpYXQiOjE3MjYxMTA2NzMsImlzcyI6InN1cGFiYXNlIn0.tjKhMaUfAP6uKXlZFFtw8OKDSBAYkbpkwoKBcj-yaqg"
)

func NewSupabaseClient() (*supabase.Client, error) {
	client, err := supabase.NewClient(apiUrl, apiKey, &supabase.ClientOptions{
		Schema: "public",
	})
	if err != nil {
		return nil, fmt.Errorf("cannot initalize supabase client: %s", err)
	}
	return client, nil
}
