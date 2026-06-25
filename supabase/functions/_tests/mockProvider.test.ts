import { assertEquals } from 'jsr:@std/assert@1';
import { MockPriceProvider } from '../_shared/priceProviders/mock.ts';
import type { CatalogGearItem } from '../_shared/types.ts';

function fakeDb(rows: Array<{
  gear_item_id: string;
  price_usd: number | null;
  url: string;
  title: string;
  image_url: string | null;
  in_stock: boolean | null;
  fetched_at: string | null;
  retailer_slug: string;
}>) {
  // deno-lint-ignore no-explicit-any
  const client: any = {
    from(_table: string) {
      return {
        select(_cols: string) {
          return {
            in(col: string, vals: string[]) {
              if (col === 'retailers.slug') {
                return {
                  in(_col2: string, ids: string[]) {
                    const filtered = rows.filter(
                      (r) => vals.includes(r.retailer_slug) && ids.includes(r.gear_item_id),
                    );
                    return Promise.resolve({
                      data: filtered.map((r) => ({
                        gear_item_id: r.gear_item_id,
                        price_usd: r.price_usd,
                        url: r.url,
                        title: r.title,
                        image_url: r.image_url,
                        in_stock: r.in_stock,
                        fetched_at: r.fetched_at,
                        retailers: { slug: r.retailer_slug },
                      })),
                      error: null,
                    });
                  },
                };
              }
              return Promise.resolve({ data: [], error: null });
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
];

Deno.test('MockPriceProvider returns catalog retailer links without example.com', async () => {
  const db = fakeDb([
    {
      gear_item_id: 'item-1',
      price_usd: null,
      url: 'https://www.amazon.com/s?k=test+rod',
      title: 'Test Rod',
      image_url: null,
      in_stock: null,
      fetched_at: null,
      retailer_slug: 'amazon',
    },
  ]);
  const provider = new MockPriceProvider(db);
  const out = await provider.getPrices(sampleItems, { requestId: 'r1' });

  assertEquals(out.size, 1);
  const prices = out.get('item-1') ?? [];
  assertEquals(prices.length, 4);
  for (const p of prices) {
    assertEquals(p.url.includes('example.com'), false);
    assertEquals(p.url.startsWith('https://'), true);
  }
});

Deno.test('MockPriceProvider gracefully returns empty map for empty input', async () => {
  const db = fakeDb([]);
  const provider = new MockPriceProvider(db);
  const out = await provider.getPrices([], { requestId: 'r2' });
  assertEquals(out.size, 0);
});
