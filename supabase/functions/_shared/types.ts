// Shared types for Edge Functions.
// IMPORTANT: keep this file in sync with `src/types/recommendations.ts`.
// Supabase only bundles files under `supabase/functions/` so we cannot import
// from `src/` directly.

export type Retailer = 'amazon' | 'walmart' | 'mock';

export type GearTag = 'Best Value' | 'Premium' | 'Value Items' | 'Cheapest';

export type BudgetTier = 'Best Value' | 'Premium';

export interface ProductLink {
  retailer: Retailer;
  url: string;
}

export interface PriceResult {
  retailer: Retailer;
  priceUSD: number;
  url: string;
  title: string;
  image?: string;
}

export interface GearItem {
  id: string;
  name: string;
  description: string;
  tag: GearTag;
  estPriceUSD: number;
  prices: PriceResult[];
  links: ProductLink[];
  group: string;
  rationale?: string;
}

export interface GearGroup {
  group: string;
  items: GearItem[];
}

export interface GearRecommendationRequest {
  species: string;
  method: string;
  ownedGroups: string[];
  budgetTier: BudgetTier;
}

export interface RecommendationSource {
  provider: Retailer;
  cached: boolean;
}

export interface GearRecommendationResponse {
  species: string;
  method: string;
  groups: GearGroup[];
  totalEstimateUSD: number;
  source: RecommendationSource;
}

export interface RecommendationErrorBody {
  code:
    | 'INVALID_REQUEST'
    | 'UNKNOWN_SPECIES'
    | 'UNKNOWN_METHOD'
    | 'NO_RECOMMENDATIONS'
    | 'PROVIDER_FAILURE'
    | 'INTERNAL_ERROR';
  message: string;
  details?: unknown;
}

/** Internal shape produced by the repository before pricing is attached. */
export interface CatalogGearItem {
  id: string;
  name: string;
  description: string;
  tag: GearTag;
  basePriceUSD: number;
  groupSlug: string;
  groupName: string;
}
