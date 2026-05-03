import type { CatalogGearItem, PriceResult, Retailer } from '../types.ts';
import type { PriceProvider, PriceProviderContext } from './types.ts';
import { log } from '../logger.ts';

/**
 * Hybrid provider: queries every wrapped provider in parallel and returns the
 * combined set of `PriceResult`s per item. The Edge Function then picks the
 * cheapest. If every wrapped provider returns empty, the caller is responsible
 * for falling back (we keep that responsibility in the entrypoint so logs make
 * the failure mode explicit).
 */
export class HybridPriceProvider implements PriceProvider {
  readonly retailer: Retailer = 'mock';
  readonly displayName = 'Hybrid';
  readonly enabled: boolean;

  constructor(private readonly providers: PriceProvider[]) {
    this.enabled = providers.some((p) => p.enabled);
  }

  async getPrices(
    items: CatalogGearItem[],
    ctx: PriceProviderContext,
  ): Promise<Map<string, PriceResult[]>> {
    const merged = new Map<string, PriceResult[]>();
    if (items.length === 0) return merged;

    const results = await Promise.allSettled(
      this.providers.filter((p) => p.enabled).map((p) => p.getPrices(items, ctx)),
    );

    for (const r of results) {
      if (r.status !== 'fulfilled') {
        log('warn', {
          requestId: ctx.requestId,
          message: 'hybrid_provider_subcall_rejected',
          details: r.reason instanceof Error ? r.reason.message : String(r.reason),
        });
        continue;
      }
      for (const [id, prices] of r.value) {
        const existing = merged.get(id);
        if (existing) existing.push(...prices);
        else merged.set(id, [...prices]);
      }
    }

    return merged;
  }
}
