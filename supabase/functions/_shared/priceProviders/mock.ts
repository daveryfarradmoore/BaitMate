import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { CatalogGearItem, PriceResult } from '../types.ts';
import type { PriceProvider, PriceProviderContext } from './types.ts';
import { log } from '../logger.ts';

/**
 * Mock provider: reads pre-seeded `price_results` rows tagged with
 * `retailers.slug = 'mock'`. Always available, never makes external HTTP
 * calls, and is the fallback when other providers fail.
 */
export class MockPriceProvider implements PriceProvider {
  readonly retailer = 'mock' as const;
  readonly displayName = 'Mock Retailer';
  readonly enabled = true;

  constructor(private readonly db: SupabaseClient) {}

  async getPrices(
    items: CatalogGearItem[],
    ctx: PriceProviderContext,
  ): Promise<Map<string, PriceResult[]>> {
    const out = new Map<string, PriceResult[]>();
    if (items.length === 0) return out;

    const itemIds = items.map((i) => i.id);

    const { data, error } = await this.db
      .from('price_results')
      .select('gear_item_id, price_usd, url, title, image_url, retailers!inner(slug)')
      .eq('retailers.slug', 'mock')
      .in('gear_item_id', itemIds);

    if (error) {
      log('warn', {
        requestId: ctx.requestId,
        message: 'mock_price_provider_query_failed',
        errorCode: error.code,
        details: error.message,
      });
      return out;
    }

    type Row = {
      gear_item_id: string;
      price_usd: number | string;
      url: string;
      title: string;
      image_url: string | null;
    };

    for (const row of (data ?? []) as Row[]) {
      const price: PriceResult = {
        retailer: 'mock',
        priceUSD: Number(row.price_usd),
        url: row.url,
        title: row.title,
        image: row.image_url ?? undefined,
      };
      const list = out.get(row.gear_item_id);
      if (list) list.push(price);
      else out.set(row.gear_item_id, [price]);
    }

    // Backfill from base_price_usd for any catalog item without a seeded price.
    // Keeps the response intact even if seed data is incomplete.
    for (const item of items) {
      if (!out.has(item.id)) {
        out.set(item.id, [
          {
            retailer: 'mock',
            priceUSD: item.basePriceUSD,
            url: `https://example.com/mock/${item.id}`,
            title: item.name,
          },
        ]);
      }
    }

    return out;
  }
}
