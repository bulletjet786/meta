import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://crh5nk8g91hjuhhg05pg.baseapi.memfiredb.com'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImV4cCI6MzMwMjkxMDY3MywiaWF0IjoxNzI2MTEwNjczLCJpc3MiOiJzdXBhYmFzZSJ9._MBt4CDCQ34ZKNeytRUFkweMHxGgewMosEO4fDDq7w8'
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export default supabaseClient