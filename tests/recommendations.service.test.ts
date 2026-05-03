import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The service module reads `process.env.EXPO_PUBLIC_*` at import time. Stub the
 * Supabase client module *before* importing the service so the offline path is
 * exercised deterministically.
 */
vi.mock('../src/lib/supabase', () => ({
  isSupabaseConfigured: false,
  getSupabaseClient: () => null,
  supabaseConnectivitySmokeTest: async () => ({ configured: false, reachable: false }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('fetchGearRecommendations (service entry point)', () => {
  it('falls back to local data when Supabase is not configured', async () => {
    const { fetchGearRecommendations } = await import('../src/services/recommendations');
    const res = await fetchGearRecommendations({
      species: 'largemouth-bass',
      method: 'shore',
      ownedGroups: [],
      budgetTier: 'Best Value',
    });
    expect(res.source.provider).toBe('mock');
    expect(res.source.cached).toBe(false);
    expect(res.groups.length).toBeGreaterThan(0);
  });
});
