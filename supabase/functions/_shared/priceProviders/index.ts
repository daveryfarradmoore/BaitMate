import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { AmazonPriceProvider } from './amazon.ts';
import { HybridPriceProvider } from './hybrid.ts';
import { MockPriceProvider } from './mock.ts';
import { WalmartPriceProvider } from './walmart.ts';
import { readProviderFlag, type PriceProvider, type ProviderFlag } from './types.ts';

export { type PriceProvider, type PriceProviderContext, type ProviderFlag } from './types.ts';

export interface ResolvedProvider {
  /** Active provider ultimately responsible for prices. */
  primary: PriceProvider;
  /** Always-available fallback. Used when `primary` returns no data. */
  fallback: PriceProvider;
  flag: ProviderFlag;
}

/**
 * Pick the active `PriceProvider` based on the `PRICE_PROVIDER` env flag.
 * The mock provider is always also returned as `fallback` so any failure or
 * unconfigured retailer gracefully degrades to seeded prices.
 */
export function resolvePriceProvider(
  db: SupabaseClient,
  env: Record<string, string | undefined>,
): ResolvedProvider {
  const flag = readProviderFlag(env);
  const mock = new MockPriceProvider(db);

  if (flag === 'mock') {
    return { primary: mock, fallback: mock, flag };
  }

  const amazon = new AmazonPriceProvider(env);
  const walmart = new WalmartPriceProvider(env);

  if (flag === 'amazon') {
    return { primary: amazon.enabled ? amazon : mock, fallback: mock, flag };
  }
  if (flag === 'walmart') {
    return { primary: walmart.enabled ? walmart : mock, fallback: mock, flag };
  }

  // hybrid: prefer the cheaper of any enabled retailer, fall back to mock.
  const hybrid = new HybridPriceProvider([amazon, walmart]);
  return { primary: hybrid.enabled ? hybrid : mock, fallback: mock, flag };
}
