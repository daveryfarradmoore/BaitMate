import type { CatalogGearItem, PriceResult, Retailer } from '../types.ts';

/**
 * Common contract every retailer adapter implements. The Edge Function calls
 * `getPrices` once per request with the catalog items the user is missing.
 *
 * Implementations should be stateless and tolerant - on failure they may
 * return an empty array for individual items rather than throwing, so a
 * single retailer outage doesn't break the whole recommendation.
 */
export interface PriceProvider {
  readonly retailer: Retailer;
  readonly displayName: string;
  /** Whether the provider has all secrets/config it needs to actually run. */
  readonly enabled: boolean;
  /**
   * @param items catalog rows to price
   * @param ctx   per-request context (request id, optional curator hints)
   * @returns map keyed by `gear_item_id` -> array of zero or more prices.
   *   Multiple prices are allowed (e.g., variant SKUs); the Edge Function picks
   *   the cheapest unless told otherwise.
   */
  getPrices(items: CatalogGearItem[], ctx: PriceProviderContext): Promise<Map<string, PriceResult[]>>;
}

export interface PriceProviderContext {
  requestId: string;
  /** Optional per-group search hints from the LLM curator (M4). */
  searchHints?: Record<string, string | undefined>;
}

export type ProviderFlag = 'mock' | 'amazon' | 'walmart' | 'hybrid';

export function readProviderFlag(env: Record<string, string | undefined>): ProviderFlag {
  const raw = (env.PRICE_PROVIDER ?? 'mock').toLowerCase();
  if (raw === 'amazon' || raw === 'walmart' || raw === 'hybrid' || raw === 'mock') {
    return raw;
  }
  return 'mock';
}
