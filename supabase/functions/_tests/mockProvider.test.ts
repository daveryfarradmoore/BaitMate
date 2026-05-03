import { assertEquals } from 'jsr:@std/assert@1';
import { MockPriceProvider } from '../_shared/priceProviders/mock.ts';
import type { CatalogGearItem } from '../_shared/types.ts';

/**
 * Fake Supabase client just rich enough for the mock provider's chained calls:
 *   .from('price_results').select(...).eq(...).in(...)
 */
function fakeDb(rows: Array<{
  gear_item_id: string;
  price_usd: number;
  url: string;
  title: string;
  image_url: string | null;
}>) {
  // deno-lint-ignore no-explicit-any
  const client: any = {
    from(_table: string) {
      return {
        select(_cols: string) {
          return {
            eq(_col: string, _val: string) {
              return {
                in(_col2: string, ids: string[]) {
                  const filtered = rows.filter((r) => ids.includes(r.gear_item_id));
                  return Promise.resolve({ data: filtered, error: null });
                },
              };
            },
          };
        },
      };
    },
  };
  return client;
}

const sampleItems: CatalogGearItem[] = [
  {
    id: 'item-1',
    name: 'Test Rod',
    description: 'A rod',
    tag: 'Best Value',
    basePriceUSD: 99.99,
    groupSlug: 'rod',
    groupName: 'Rod',
  },
  {
    id: 'item-2',
    name: 'Test Reel',
    description: 'A reel',
    tag: 'Premium',
    basePriceUSD: 149.99,
    groupSlug: 'reel',
    groupName: 'Reel',
  },
];

Deno.test('MockPriceProvider returns seeded prices keyed by gear_item_id', async () => {
  const db = fakeDb([
    { gear_item_id: 'item-1', price_usd: 89.99, url: 'https://x/a', title: 'Test Rod', image_url: null },
  ]);
  const provider = new MockPriceProvider(db);
  const out = await provider.getPrices(sampleItems, { requestId: 'r1' });

  assertEquals(out.size, 2);
  assertEquals(out.get('item-1')?.[0]?.priceUSD, 89.99);
  assertEquals(out.get('item-1')?.[0]?.retailer, 'mock');

  // item-2 had no seeded row, so we backfill from base_price_usd.
  assertEquals(out.get('item-2')?.[0]?.priceUSD, 149.99);
  assertEquals(out.get('item-2')?.[0]?.retailer, 'mock');
});

Deno.test('MockPriceProvider gracefully returns empty map for empty input', async () => {
  const db = fakeDb([]);
  const provider = new MockPriceProvider(db);
  const out = await provider.getPrices([], { requestId: 'r2' });
  assertEquals(out.size, 0);
});
