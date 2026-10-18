import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The service module reads `process.env.EXPO_PUBLIC_*` at import time. Stub the
 * Supabase client module *before* importing the service so the offline path is
 * exercised deterministically.
 */
const backend = vi.hoisted(() => ({ configured: false, invoke: vi.fn() }));
vi.mock('../src/lib/supabase', () => ({
  get isSupabaseConfigured() { return backend.configured; },
  getSupabaseClient: () => backend.configured ? { functions: { invoke: backend.invoke } } : null,
  supabaseConnectivitySmokeTest: async () => ({ configured: false, reachable: false }),
}));

afterEach(() => {
  vi.clearAllMocks();
  backend.configured = false;
});

describe('fetchGearRecommendations (service entry point)', () => {
  it.each([
    { name: 'FunctionsFetchError', message: 'Failed to send a request' },
    { name: 'FunctionsHttpError', context: { status: 404 }, message: 'Function not found' },
  ])('uses the starter catalog when the cloud function is unavailable: $name', async error => {
    backend.configured = true;
    backend.invoke.mockResolvedValue({ data: null, error });
    const { fetchGearRecommendations } = await import('../src/services/recommendations');
    const result = await fetchGearRecommendations({ species: 'largemouth-bass', method: 'shore', ownedGroups: [], budgetTier: 'Best Value' });
    expect(result.groups.length).toBeGreaterThan(0);
    expect(result.source.provider).toBe('mock');
  });
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
