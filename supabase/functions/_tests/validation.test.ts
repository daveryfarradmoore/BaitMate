import { assert, assertEquals, assertFalse } from 'jsr:@std/assert@1';
import { parseRequest } from '../_shared/validation.ts';

Deno.test('parseRequest accepts a minimally-valid payload', () => {
  const result = parseRequest({
    species: 'largemouth-bass',
    method: 'shore',
    ownedGroups: [],
    budgetTier: 'Best Value',
  });
  assert(result.ok);
  assertEquals(result.value.species, 'largemouth-bass');
  assertEquals(result.value.method, 'shore');
  assertEquals(result.value.budgetTier, 'Best Value');
});

Deno.test('parseRequest rejects empty species', () => {
  const result = parseRequest({
    species: '',
    method: 'shore',
    ownedGroups: [],
    budgetTier: 'Best Value',
  });
  assertFalse(result.ok);
});

Deno.test('parseRequest rejects empty method', () => {
  const result = parseRequest({
    species: 'largemouth-bass',
    method: '   ',
    ownedGroups: [],
    budgetTier: 'Best Value',
  });
  assertFalse(result.ok);
});

Deno.test('parseRequest rejects an unknown budgetTier', () => {
  const result = parseRequest({
    species: 'largemouth-bass',
    method: 'shore',
    ownedGroups: [],
    budgetTier: 'Cheapest',
  });
  assertFalse(result.ok);
});

Deno.test('parseRequest fills in defaults for missing optional fields', () => {
  const result = parseRequest({ species: 'trout', method: 'shore' });
  assert(result.ok);
  assertEquals(result.value.ownedGroups, []);
  assertEquals(result.value.budgetTier, 'Best Value');
});

Deno.test('parseRequest rejects non-string entries in ownedGroups', () => {
  const result = parseRequest({
    species: 'trout',
    method: 'shore',
    ownedGroups: ['rod', 42],
    budgetTier: 'Best Value',
  });
  assertFalse(result.ok);
});
