import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { LibraryService } from '../gen/library/v1/library_pb';

const supabaseUrl = 'https://joincyfzsuvolyklirho.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW5jeWZ6c3V2b2x5a2xpcmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODc2MjMsImV4cCI6MjA1NjU2MzYyM30.1MOumBy-Hatxd25iynOUJh2ggIWdZMEzQeUfzV1fsZE';

// Supabase REST client
const supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);
export default supabaseClient;

interface LoginInfo {
    signIn: boolean,
    plan: string,
    accessToken: string
}

async function getLoginInfo(): Promise<LoginInfo> {
    const url = 'http://127.0.0.1:15637/api/user/auth/get_login_info';
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

/**
 * Creates and configures a ConnectRPC client.
 * @param useAuthService - If true, the client will attempt to fetch an auth token from the local service.
 *                         If false, it will use the anonymous key directly as a Bearer token.
 * @returns A configured ConnectRPC client instance.
 */
export function createConnectClient({ useAuthService = true } = {}) {
  const transport = createConnectTransport({
    baseUrl: "https://joincyfzsuvolyklirho.supabase.co/functions/v1/tame/api/",
    interceptors: [
      (next) => async (req) => {
        // For tests or when local service is disabled, use the anon key as a Bearer token.
        if (!useAuthService) {
          req.header.set("Authorization", `Bearer ${supabaseAnonKey}`);
          return await next(req);
        }

        // For normal operation, try to get a real user token.
        try {
          const loginInfo = await getLoginInfo();
          if (loginInfo.signIn && loginInfo.accessToken) {
            req.header.set("Authorization", `Bearer ${loginInfo.accessToken}`);
          } else {
            // Fallback for logged-out user: use anon key as Bearer token.
            req.header.set("Authorization", `Bearer ${supabaseAnonKey}`);
          }
        } catch (e) {
          console.error("RPC auth failed, falling back to anon key as Bearer token:", e);
          // Fallback for service failure: use anon key as Bearer token.
          req.header.set("Authorization", `Bearer ${supabaseAnonKey}`);
        }
        return await next(req);
      },
    ],
  });

  return createClient(LibraryService, transport);
}

/**
 * A default client instance for general application use.
 * This instance uses the standard authentication flow.
 */
export const connectClient = createConnectClient();
