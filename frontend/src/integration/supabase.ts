import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://crh5nk8g91hjuhhg05pg.baseapi.memfiredb.com'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiZXhwIjozMzAyOTEwNjczLCJpYXQiOjE3MjYxMTA2NzMsImlzcyI6InN1cGFiYXNlIn0.tjKhMaUfAP6uKXlZFFtw8OKDSBAYkbpkwoKBcj-yaqg'
const supabaseClient = createClient(supabaseUrl, supabaseKey)

export default supabaseClient

// function init() {
//     const { accessToken, expiresIn } = getAuthAccessToken()
//     startRefreshTokenBackgroundTask()
// }
//
// function startRefreshTokenBackgroundTask() {
//     const { accessToken, expiresIn } = getAuthAccessToken()
//     supabaseClient.auth.setAuth(accessToken)
//     timeout.setTimeout(() => {
//         startRefreshTokenBackgroundTask()
//     }, expiresIn * 1000)
// }
//
// function getAuthAccessToken(): string {
//     return "abc"
// }

