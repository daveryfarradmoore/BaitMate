/** Retailers with catalog search links (no live price required). */
export type CatalogRetailerSlug = 'amazon' | 'walmart' | 'basspro' | 'cabelas';

export const CATALOG_RETAILER_SLUGS: CatalogRetailerSlug[] = [
  'amazon',
  'walmart',
  'basspro',
  'cabelas',
];

export const CATALOG_RETAILER_DISPLAY: Record<CatalogRetailerSlug, string> = {
  amazon: 'Amazon',
  walmart: 'Walmart',
  basspro: 'Bass Pro Shops',
  cabelas: "Cabela's",
};

function normalizeItemName(name: string): string {
  return name
    .replace(/'/g, ' foot ')
    .replace(/"/g, ' inch ')
    .replace(/\s+/g, ' ')
    .trim();
}

function groupSearchSuffix(groupSlug: string): string {
  const map: Record<string, string> = {
    rod: 'fishing rod',
    reel: 'fishing reel',
    line: 'fishing line',
    hooks: 'fishing hooks',
    bait: 'fishing bait',
    lures: 'fishing lures',
    flies: 'fishing flies',
    bobbers: 'fishing bobbers',
    sinkers: 'fishing sinkers',
    terminal: 'fishing terminal tackle',
  };
  return map[groupSlug.toLowerCase()] ?? 'fishing';
}

/** Build a human-readable search query from gear item name + group slug. */
export function buildSearchKeywords(itemName: string, gearGroup: string): string {
  const base = normalizeItemName(itemName).toLowerCase();
  if (base.includes('fishing')) return base;
  const suffix = groupSearchSuffix(gearGroup);
  return `${base} ${suffix}`.replace(/\s+/g, ' ').trim();
}

export function buildRetailerSearchUrls(input: {
  itemName: string;
  gearGroup: string;
}): Record<CatalogRetailerSlug, string> {
  const q = encodeURIComponent(buildSearchKeywords(input.itemName, input.gearGroup));
  return {
    amazon: `https://www.amazon.com/s?k=${q}`,
    walmart: `https://www.walmart.com/search?q=${q}`,
    basspro: `https://www.basspro.com/shop/en/search#searchTerm=${q}`,
    cabelas: `https://www.cabelas.com/search?q=${q}`,
  };
}
