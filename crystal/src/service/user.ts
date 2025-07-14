
import {createClient, type Provider} from '@supabase/supabase-js';

interface Session {
    access_token: string;
    expires_in: number;
    expires_at: number;
    provider_token: string;
    refresh_token: string;
    token_type: string;
}

export class UserService {
    static supabaseUrl = 'https://joincyfzsuvolyklirho.supabase.co'
    static supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW5jeWZ6c3V2b2x5a2xpcmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODc2MjMsImV4cCI6MjA1NjU2MzYyM30.1MOumBy-Hatxd25iynOUJh2ggIWdZMEzQeUfzV1fsZE'
    static supabaseClient = createClient(UserService.supabaseUrl, UserService.supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    })

    static metaHost = "http://localhost:15637"
    static updateSessionUrl = "/api/user/auth/update_session"
    static authCallbackUrl = "/pages/user/auth/callback.html"
    async updateSession(authResult: Session) {
        await fetch(UserService.metaHost + UserService.updateSessionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(authResult)
        });
    }

    getAuthResult(): Session | null {
        const hash = window.location.hash.substring(1);

        const params = new URLSearchParams(hash);

        const accessToken = params.get('access_token');
        const expiresInStr = params.get('expires_in');
        if (expiresInStr == null || expiresInStr == "") {
            return null;
        }
        const expiresIn = parseInt(expiresInStr);
        const expiresAtStr = params.get('expires_at');
        if (expiresAtStr == null || expiresAtStr == "") {
            return null;
        }
        const expiresAt = parseInt(expiresAtStr);
        const providerToken = params.get('provider_token');
        const refreshToken = params.get('refresh_token');
        const tokenType = params.get('token_type');
        if (!accessToken || !expiresIn || !expiresAt || !providerToken || !refreshToken || !tokenType) {
            return null;
        }

        return {
            access_token: accessToken,
            expires_in: expiresIn,
            expires_at: expiresAt,
            provider_token: providerToken,
            refresh_token: refreshToken,
            token_type: tokenType
        };
    }

    async authCallback() {
        const authResult = this.getAuthResult()
        if (!authResult) {
            return;
        }
        await this.updateSession(authResult)
    }

    async signInWithOAuth(provider: Provider, scope: string) {
        await UserService.supabaseClient.auth.signOut();

        const { data, error } = await UserService.supabaseClient.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: UserService.metaHost + UserService.authCallbackUrl,
                scopes: scope,
            },
        });

        console.error( error)
        console.log(data)
    }

    async signInWithGoogleOAuth() {
        await this.signInWithOAuth('google', "openid email profile")
    }
}

export const userService = new UserService();
