import { assertEquals } from 'jsr:@std/assert@1';
import { buildRetailSearchQuery } from '../_shared/retailSearchQuery.ts';
import type { CatalogGearItem } from '../_shared/types.ts';
import type { PriceProviderContext } from '../_shared/priceProviders/types.ts';

const sampleItem: CatalogGearItem = {
  id: 'id-1',
  name: 'Spinning Rod 7ft',
  description: 'Test',
  tag: 'Best Value',
  basePriceUSD: 99,
  groupSlug: 'rod',
  groupName: 'Rod',
};

Deno.test('buildRetailSearchQuery includes species, method, hint, and item name', () => {
  const ctx: PriceProviderContext = {
    requestId: 'r1',
    species: 'largemouth-bass',
    method: 'shore',
    searchHints: { rod: 'medium heavy' },
  };
  const q = buildRetailSearchQuery(sampleItem, ctx);
  assertEquals(q.includes('largemouth bass'), true);
  assertEquals(q.includes('shore'), true);
  assertEquals(q.includes('medium heavy'), true);
  assertEquals(q.includes('Spinning Rod'), true);
  assertEquals(q.includes('fishing'), true);
  assertEquals(q.length <= 400, true);
});
