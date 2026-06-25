export type Retailer =
  | 'amazon'
  | 'walmart'
  | 'basspro'
  | 'cabelas'
  | 'mock'
  | 'hybrid';

export type GearTag = 'Best Value' | 'Premium' | 'Value Items' | 'Cheapest';

export type BudgetTier = 'Best Value' | 'Premium';

export interface ProductLink {
  retailer: Retailer;
  url: string;
}

export interface PriceResult {
  retailer: Retailer;
  /** Null when only a search link is stored (no live API price yet). */
  priceUSD: number | null;
  url: string;
  title: string;
  image?: string;
  inStock?: boolean | null;
  lastCheckedAt?: string | null;
}

export interface GearItem {
  id: string;
  name: string;
  description: string;
  tag: GearTag;
  /** Best available price, or catalog base estimate when no live price exists. */
  estPriceUSD: number;
  prices: PriceResult[];
  links: ProductLink[];
  group: string;
  /** Optional, populated only when the LLM curator is enabled. */
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

/** Stable error shape returned by the backend on validation/runtime errors. */
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
