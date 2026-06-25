import type { CatalogGearItem } from './types.ts';
import type { PriceProviderContext } from './priceProviders/types.ts';

/** Turn `largemouth-bass` into `largemouth bass` for retailer keyword search. */
export function slugToSearchWords(slug: string): string {
  return slug.trim().replace(/-/g, ' ').replace(/\s+/g, ' ');
}

/**
 * Build a single search string for Amazon/Walmart from DB catalog + optional
 * LLM curator hints + species/method context. Clamped to retailer limits.
 */
export function buildRetailSearchQuery(
  item: CatalogGearItem,
  ctx: PriceProviderContext,
  maxLen = 400,
): string {
  const species = ctx.species?.trim() ? slugToSearchWords(ctx.species) : '';
  const method = ctx.method?.trim() ? slugToSearchWords(ctx.method) : '';
  const hint = ctx.searchHints?.[item.groupSlug]?.trim();

  const parts: string[] = [];
  if (species) parts.push(species);
  if (method) parts.push(method);
  if (hint) parts.push(hint);
  parts.push(item.name, 'fishing');

  const q = parts.join(' ').replace(/\s+/g, ' ').trim();
  return q.slice(0, maxLen);
}
