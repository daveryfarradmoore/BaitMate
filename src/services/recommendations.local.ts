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
} from '../types/recommendations';
import {
  GROUP_NAME_TO_SLUG,
  SEED_DEFAULT_GEAR,
  SEED_SPECIES,
  SEED_SPECIES_GEAR_DATA,
  mockProductUrl,
} from './seedData';

const SPECIES_SLUG_TO_NAME: Record<string, string> = SEED_SPECIES.reduce(
  (acc, s) => {
    acc[s.slug] = s.name;
    return acc;
  },
  {} as Record<string, string>,
);

function pickTierItem(
  groupName: string,
  items: typeof SEED_DEFAULT_GEAR[string],
  budgetTier: GearRecommendationRequest['budgetTier'],
): GearItem | null {
  if (!items || items.length === 0) return null;

  const exact = items.find((i) => i.tag === budgetTier);
  const fallback = budgetTier === 'Premium'
    ? items.find((i) => i.tag === 'Best Value')
    : items.find((i) => i.tag === 'Value Items') ?? items.find((i) => i.tag === 'Cheapest');
  const chosen = exact ?? fallback ?? items[0];
  if (!chosen) return null;

  const url = mockProductUrl(chosen.name);
  return {
    id: `local:${groupName}:${chosen.name}`,
    name: chosen.name,
    description: chosen.description,
    tag: chosen.tag,
    estPriceUSD: chosen.price,
    prices: [
      {
        retailer: 'mock',
        priceUSD: chosen.price,
        url,
        title: chosen.name,
      },
    ],
    links: [{ retailer: 'mock', url }],
    group: groupName,
  };
}

export function buildLocalRecommendation(
  req: GearRecommendationRequest,
): GearRecommendationResponse {
  // Accept either a slug ('largemouth-bass') or a display name ('Largemouth
  // Bass') so this fallback stays compatible with both call sites.
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
    const picked = pickTierItem(groupName, items, req.budgetTier);
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
