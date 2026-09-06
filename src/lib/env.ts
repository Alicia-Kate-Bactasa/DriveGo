import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Missing SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Missing SERVICE_ROLE_KEY"),
  NEXT_PUBLIC_APP_URL: z.string().url("Invalid APP_URL"),
  SECRET_KEY: z.string().min(16, "SECRET_KEY must be at least 16 chars"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten());
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;