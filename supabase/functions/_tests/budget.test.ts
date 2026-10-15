import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@1';
import { parseRequest } from '../_shared/validation.ts';
import { buildRequestHash } from '../_shared/cache.ts';

Deno.test('budget validation accepts zero and decimal targets, rejects invalid amounts', () => {
  for (const budgetUSD of [0, 100, 99.99]) {
    const parsed = parseRequest({ species: 'trout', method: 'shore', budgetUSD });
    assert(parsed.ok);
    assertEquals(parsed.value.budgetUSD, budgetUSD);
  }
  for (const budgetUSD of [-1, Infinity, NaN, 100001, 1.001, '100', null]) {
    assertFalse(parseRequest({ species: 'trout', method: 'shore', budgetUSD }).ok);
  }
});

Deno.test('recommendation cache separates budgets, including zero and omitted', async () => {
  const request = { species: 'trout', method: 'shore', ownedGroups: [], budgetTier: 'Best Value' as const };
  const hashes = await Promise.all([undefined, 0, 100, 101].map(budgetUSD => buildRequestHash({ ...request, budgetUSD }, 'mock')));
  assertEquals(new Set(hashes).size, 4);
});
