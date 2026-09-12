// Re-export everything from the appropriate file for backwards compat
// Prefer importing from supabase-browser.ts (client) or supabase-server.ts (server) directly
// to avoid bundling server-only code into client bundles.

export { createSupabaseBrowserClient } from "./supabase-browser";
export { createSupabaseServerClient, createSupabaseAdminClient } from "./supabase-server";
