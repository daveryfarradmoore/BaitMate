/**
 * Local in-memory recommendation engine, used as a fallback whenever Supabase
 * env vars are not configured. Mirrors the logic of the Edge Function so the
 * UI behaves identically online and offline.
 */
import type {
  GearGroup,
  GearItem,
  GearRecommendationRequest,
  GearRecommendationResponse,
  PriceResult,
} from '../types/recommendations';
import {
  buildRetailerSearchUrls,
  CATALOG_RETAILER_SLUGS,
} from '../lib/retailerSearchUrls';
import {
  GROUP_NAME_TO_SLUG,
  SEED_DEFAULT_GEAR,
  SEED_SPECIES,
  SEED_SPECIES_GEAR_DATA,
} from './seedData';

import { budgetCents, cheapestItem } from '../../supabase/functions/_shared/budget';

const SPECIES_SLUG_TO_NAME: Record<string, string> = SEED_SPECIES.reduce(
  (acc, s) => {
    acc[s.slug] = s.name;
    return acc;
  },
  {} as Record<string, string>,
);

function buildCatalogPrices(itemName: string, groupSlug: string): PriceResult[] {
  const urls = buildRetailerSearchUrls({ itemName, gearGroup: groupSlug });
  return CATALOG_RETAILER_SLUGS.map((retailer) => ({
    retailer,
    priceUSD: null,
    url: urls[retailer],
    title: itemName,
    inStock: null,
    lastCheckedAt: null,
  }));
}

function pickTierItem(
  groupName: string,
  items: typeof SEED_DEFAULT_GEAR[string],
  budgetTier: GearRecommendationRequest['budgetTier'],
  budgetUSD?: number,
): GearItem | null {
  if (!items || items.length === 0) return null;

  const exact = items.find((i) => i.tag === budgetTier);
  const fallback = budgetTier === 'Premium'
    ? items.find((i) => i.tag === 'Best Value')
    : items.find((i) => i.tag === 'Value Items') ?? items.find((i) => i.tag === 'Cheapest');
  const chosen = budgetUSD === undefined ? exact ?? fallback ?? items[0] : cheapestItem(items, item => item.price);
  if (!chosen) return null;

  const groupSlug = GROUP_NAME_TO_SLUG[groupName] ?? groupName.toLowerCase();
  const prices = buildCatalogPrices(chosen.name, groupSlug);

  return {
    id: `local:${groupName}:${chosen.name}`,
    name: chosen.name,
    description: chosen.description,
    tag: chosen.tag,
    estPriceUSD: chosen.price,
    prices,
    links: prices.map((p) => ({ retailer: p.retailer, url: p.url })),
    group: groupName,
  };
}

export function buildLocalRecommendation(
  req: GearRecommendationRequest,
): GearRecommendationResponse {
  if (req.budgetUSD !== undefined) budgetCents(req.budgetUSD);
  const displayName = SPECIES_SLUG_TO_NAME[req.species] ?? req.species;
  const speciesGear =
    SEED_SPECIES_GEAR_DATA[displayName] ?? SEED_DEFAULT_GEAR;
  const ownedSlugs = new Set(
    req.ownedGroups.map((s) => s.toLowerCase()),
  );

  const groups: GearGroup[] = [];
  let total = 0;

  for (const [groupName, items] of Object.entries(speciesGear)) {
    const slug = GROUP_NAME_TO_SLUG[groupName] ?? groupName.toLowerCase();
    if (ownedSlugs.has(slug) || ownedSlugs.has(groupName.toLowerCase())) continue;
    const picked = pickTierItem(groupName, items, req.budgetTier, req.budgetUSD);
    if (!picked) continue;
    total += picked.estPriceUSD;
    groups.push({ group: groupName, items: [picked] });
  }

  return {
    species: req.species,
    method: req.method,
    groups,
    totalEstimateUSD: Math.round(total * 100) / 100,
    source: { provider: 'mock', cached: false },
  };
}
