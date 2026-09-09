import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True only when both env vars are present. The site runs without them
 *  (falls back to seed content); the CMS requires them. */
export const supabaseEnabled = Boolean(url && anon);

/** Anon client only — never the service_role key in the frontend. */
export const supabase = supabaseEnabled
  ? createClient(url!, anon!, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
