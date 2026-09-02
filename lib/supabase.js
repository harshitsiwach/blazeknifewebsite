import { createClient } from '@supabase/supabase-js';

// Placeholders: if env not set, client is null and routes fall back to JSON file storage (data/deposits.json)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(url && (anonKey || serviceKey));

// Public / anon client (for leaderboard reads, if you enable RLS anon SELECT). Prefer anon when available.
export function getSupabaseAnon() {
  if (!isSupabaseConfigured) return null;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

// Service-role client (for inserts, bypass RLS). Use ONLY server-side (API routes).
export function getSupabaseService() {
  if (!isSupabaseConfigured) return null;
  const key = serviceKey || anonKey;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
