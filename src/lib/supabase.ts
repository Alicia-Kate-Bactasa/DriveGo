import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-side client (singleton)
let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

// Server-side client for Server Components / Server Actions
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Setting cookies in Server Components may throw; ignore.
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.delete({ name, ...options });
        } catch {
          // Removing cookies in Server Components may throw; ignore.
        }
      },
    },
  });
}

// Admin client for privileged operations (server-side only)
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
  });
}