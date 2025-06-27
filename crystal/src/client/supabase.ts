import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://joincyfzsuvolyklirho.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW5jeWZ6c3V2b2x5a2xpcmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODc2MjMsImV4cCI6MjA1NjU2MzYyM30.1MOumBy-Hatxd25iynOUJh2ggIWdZMEzQeUfzV1fsZE'
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export default supabaseClient