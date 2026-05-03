import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type {
  GearRecommendationRequest,
  GearRecommendationResponse,
} from './types.ts';
import { log } from './logger.ts';

/** TTL for cached responses. 24h - long enough to amortize provider cost,
 * short enough to pick up catalog/seed updates within a day. */
const CACHE_TTL_SECONDS = 60 * 60 * 24;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await (globalThis as unknown as { crypto: Crypto }).crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(buf));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function buildRequestHash(
  req: GearRecommendationRequest,
  providerSlug: string,
): Promise<string> {
  const sortedOwned = [...req.ownedGroups].map((s) => s.toLowerCase()).sort();
  const key = [
    req.species.toLowerCase(),
    req.method.toLowerCase(),
    sortedOwned.join(','),
    req.budgetTier,
    providerSlug,
  ].join('|');
  return sha256Hex(key);
}

export async function readCache(
  db: SupabaseClient,
  hash: string,
  requestId: string,
): Promise<GearRecommendationResponse | null> {
  const { data, error } = await db
    .from('cached_recommendations')
    .select('response_jsonb, expires_at')
    .eq('request_hash', hash)
    .maybeSingle();

  if (error) {
    log('warn', { requestId, message: 'cache_read_failed', errorCode: error.code });
    return null;
  }
  if (!data) return null;

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return null;
  }
  return data.response_jsonb as GearRecommendationResponse;
}

export async function writeCache(
  db: SupabaseClient,
  hash: string,
  response: GearRecommendationResponse,
  requestId: string,
): Promise<void> {
  const expiresAt = new Date(Date.now() + CACHE_TTL_SECONDS * 1000).toISOString();
  const { error } = await db.from('cached_recommendations').upsert(
    {
      request_hash: hash,
      response_jsonb: response,
      expires_at: expiresAt,
    },
    { onConflict: 'request_hash' },
  );
  if (error) {
    log('warn', { requestId, message: 'cache_write_failed', errorCode: error.code, details: error.message });
  }
}
