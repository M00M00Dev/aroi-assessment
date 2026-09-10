// Server-only Supabase client. The service role key bypasses Row Level
// Security, so this must never be imported from a "use client" component —
// only from app/api/**/route.ts.
//
// Shares the aroi-core-db project (jlravrlrpaphhoixrhqt) with every other AROI
// app. This app only reads `staff_records` to verify a login; assessment
// results still go to the Google Sheet, not Supabase.

import "server-only";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cached: ReturnType<typeof createClient> | null = null;

export function getSupabaseServerClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Set them in .env.local (dev) or the Vercel project settings (prod).",
    );
  }
  cached ??= createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
