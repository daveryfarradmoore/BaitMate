import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { CatalogGearItem, PriceResult, Retailer } from '../types.ts';
import type { PriceProvider, PriceProviderContext } from './types.ts';
import {
  buildRetailerSearchUrls,
  CATALOG_RETAILER_SLUGS,
  type CatalogRetailerSlug,
} from '../retailerSearchUrls.ts';
import { log } from '../logger.ts';

const CATALOG_SLUGS = CATALOG_RETAILER_SLUGS as Retailer[];

/**
 * Catalog provider: reads seeded `price_results` for amazon/walmart/basspro/cabelas.
 * Rows may have null `price_usd` (search link only). Missing rows are filled with
 * generated search URLs at runtime — never example.com or fake live prices.
 */
export class MockPriceProvider implements PriceProvider {
  readonly retailer = 'mock' as const;
  readonly displayName = 'Catalog Search Links';
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
      .select(
        'gear_item_id, price_usd, url, title, image_url, in_stock, fetched_at, retailers!inner(slug)',
      )
      .in('retailers.slug', [...CATALOG_RETAILER_SLUGS])
      .in('gear_item_id', itemIds);

    if (error) {
      log('warn', {
        requestId: ctx.requestId,
        message: 'catalog_price_provider_query_failed',
        errorCode: error.code,
        details: error.message,
      });
    }

    type Row = {
      gear_item_id: string;
      price_usd: number | string | null;
      url: string;
      title: string;
      image_url: string | null;
      in_stock: boolean | null;
      fetched_at: string | null;
      retailers: { slug: string } | { slug: string }[];
    };

    for (const row of (data ?? []) as Row[]) {
      const retailer = Array.isArray(row.retailers)
        ? row.retailers[0]
        : row.retailers;
      if (!retailer) continue;
      const slug = retailer.slug as CatalogRetailerSlug;
      if (!CATALOG_RETAILER_SLUGS.includes(slug)) continue;

      const price: PriceResult = {
        retailer: slug,
        priceUSD: row.price_usd == null ? null : Number(row.price_usd),
        url: row.url,
        title: row.title,
        image: row.image_url ?? undefined,
        inStock: row.in_stock,
        lastCheckedAt: row.fetched_at,
      };
      const list = out.get(row.gear_item_id);
      if (list) list.push(price);
      else out.set(row.gear_item_id, [price]);
    }

    for (const item of items) {
      const urls = buildRetailerSearchUrls({
        itemName: item.name,
        gearGroup: item.groupSlug,
      });
      const existing = out.get(item.id) ?? [];
      const byRetailer = new Map(existing.map((p) => [p.retailer, p]));

      for (const slug of CATALOG_RETAILER_SLUGS) {
        if (byRetailer.has(slug)) continue;
        byRetailer.set(slug, {
          retailer: slug,
          priceUSD: null,
          url: urls[slug],
          title: item.name,
          inStock: null,
          lastCheckedAt: null,
        });
      }

      const ordered = CATALOG_SLUGS.map((s) => byRetailer.get(s)).filter(
        (p): p is PriceResult => p != null,
      );
      out.set(item.id, ordered);
    }

    return out;
  }
}
