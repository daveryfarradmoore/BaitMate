import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Whether the Supabase env vars are configured. The app falls back to a local
 * mock implementation in `recommendations.ts` whenever this is false so the
 * demo keeps working before a Supabase project is provisioned.
 */
export const isSupabaseConfigured: boolean =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

let cached: SupabaseClient | null = null;

/**
 * Lazily-initialized Supabase client. Returns `null` when env vars are missing
 * so callers can branch on local-only code paths instead of throwing.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (cached) return cached;
  cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return cached;
}

/** Lightweight smoke test used on app boot during Milestone 1 to confirm
 * env vars are loaded and the project is reachable. Removed after M1. */
export async function supabaseConnectivitySmokeTest(): Promise<{
  configured: boolean;
  reachable: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) return { configured: false, reachable: false };
  try {
    const { error } = await client.from('species').select('id').limit(1);
    if (error) return { configured: true, reachable: false, error: error.message };
    return { configured: true, reachable: true };
  } catch (e) {
    return { configured: true, reachable: false, error: (e as Error).message };
  }
}
