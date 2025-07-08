import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://joincyfzsuvolyklirho.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW5jeWZ6c3V2b2x5a2xpcmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODc2MjMsImV4cCI6MjA1NjU2MzYyM30.1MOumBy-Hatxd25iynOUJh2ggIWdZMEzQeUfzV1fsZE'
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => {
        try {
            const loginInfo = await getLoginInfo()
            if (loginInfo.signIn && loginInfo.accessToken != "") {
                return loginInfo.accessToken
            }
            return null
        } catch {
            return null
        }
    }
})

export default supabaseClient

interface LoginInfo {
    signIn: true,
    plan: string,
    accessToken: string
}

async function getLoginInfo(): Promise<LoginInfo> {
    const url = 'http://127.0.0.1:15637/api/user/auth/get_login_info';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}
