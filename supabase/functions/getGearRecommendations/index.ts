import { createClient } from 'jsr:@supabase/supabase-js@2';

import { corsHeaders } from '../_shared/cors.ts';
import { log, newRequestId } from '../_shared/logger.ts';
import { parseRequest } from '../_shared/validation.ts';
import {
  buildRequestHash,
  readCache,
  writeCache,
} from '../_shared/cache.ts';
import {
  fetchCatalogForSpeciesMethod,
  findSpeciesAndMethodIds,
} from '../_shared/repository.ts';
import { resolvePriceProvider } from '../_shared/priceProviders/index.ts';
import { runCurator } from '../_shared/curator.ts';
import type {
  BudgetTier,
  CatalogGearItem,
  GearGroup,
  GearItem,
  GearRecommendationResponse,
  GearTag,
  PriceResult,
  RecommendationErrorBody,
  Retailer,
} from '../_shared/types.ts';

interface DenoEnv {
  get(key: string): string | undefined;
  toObject(): Record<string, string>;
}

function readEnv(): Record<string, string | undefined> {
  // Deno.env exists in Supabase Edge Runtime; guard for type safety.
  const env = (globalThis as unknown as { Deno?: { env: DenoEnv } }).Deno?.env;
  if (!env) return {};
  return env.toObject();
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

function errorResponse(
  status: number,
  body: RecommendationErrorBody,
): Response {
  return jsonResponse(body, status);
}

/**
 * Choose the canonical price for the budget tier:
 * - Cheapest of the available `PriceResult`s, since hybrid providers may
 *   return multiple offers per item.
 */
function pickPrice(prices: PriceResult[]): PriceResult | null {
  if (prices.length === 0) return null;
  return prices.reduce((best, p) => (p.priceUSD < best.priceUSD ? p : best), prices[0]!);
}

/**
 * For each gear group, collapse the candidate items down to the one matching
 * the requested budgetTier (preferring the exact tag, falling back to the
 * cheapest available so the response is never empty).
 */
function chooseTierItem(
  groupItems: (CatalogGearItem & { _prices: PriceResult[] })[],
  budgetTier: BudgetTier,
): (CatalogGearItem & { _prices: PriceResult[] }) | null {
  if (groupItems.length === 0) return null;

  const exact = groupItems.find((i) => i.tag === budgetTier);
  if (exact) return exact;

  // Tier substitutions when an exact match doesn't exist for a group.
  const substitutes: GearTag[] = budgetTier === 'Premium'
    ? ['Best Value']
    : ['Value Items', 'Cheapest', 'Premium'];
  for (const sub of substitutes) {
    const m = groupItems.find((i) => i.tag === sub);
    if (m) return m;
  }
  return groupItems[0] ?? null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const requestId = newRequestId();
  const startedAt = Date.now();

  if (req.method !== 'POST') {
    log('warn', { requestId, message: 'method_not_allowed', errorCode: 'INVALID_REQUEST' });
    return errorResponse(405, {
      code: 'INVALID_REQUEST',
      message: 'Only POST is supported',
    });
  }

  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return errorResponse(400, {
      code: 'INVALID_REQUEST',
      message: 'Body must be valid JSON',
    });
  }

  const parsed = parseRequest(bodyJson);
  if (!parsed.ok) {
    log('warn', {
      requestId,
      message: 'request_validation_failed',
      errorCode: 'INVALID_REQUEST',
      details: parsed.details,
    });
    return errorResponse(400, {
      code: 'INVALID_REQUEST',
      message: parsed.message,
      details: parsed.details,
    });
  }

  const env = readEnv();
  const supabaseUrl = env.SUPABASE_URL ?? '';
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!supabaseUrl || !serviceRoleKey) {
    log('error', {
      requestId,
      message: 'env_misconfigured',
      errorCode: 'INTERNAL_ERROR',
    });
    return errorResponse(500, {
      code: 'INTERNAL_ERROR',
      message: 'Server is missing Supabase credentials',
    });
  }

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { primary, fallback, flag } = resolvePriceProvider(db, env);
  log('info', {
    requestId,
    species: parsed.value.species,
    method: parsed.value.method,
    providerSelected: flag,
    message: 'request_received',
  });

  // ---- Cache lookup ------------------------------------------------------
  const requestHash = await buildRequestHash(parsed.value, flag);
  const cached = await readCache(db, requestHash, requestId);
  if (cached) {
    log('info', {
      requestId,
      species: parsed.value.species,
      method: parsed.value.method,
      providerSelected: flag,
      cacheHit: true,
      durationMs: Date.now() - startedAt,
      message: 'cache_hit',
    });
    return jsonResponse({ ...cached, source: { ...cached.source, cached: true } });
  }

  // ---- Resolve species + method -----------------------------------------
  const lookup = await findSpeciesAndMethodIds(
    db,
    parsed.value.species,
    parsed.value.method,
  );
  if (!lookup.ok) {
    const code = lookup.missing === 'species' ? 'UNKNOWN_SPECIES' : 'UNKNOWN_METHOD';
    log('warn', {
      requestId,
      species: parsed.value.species,
      method: parsed.value.method,
      providerSelected: flag,
      errorCode: code,
      message: 'lookup_failed',
    });
    return errorResponse(404, {
      code,
      message: `Unknown ${lookup.missing}: '${
        lookup.missing === 'species' ? parsed.value.species : parsed.value.method
      }'`,
    });
  }

  // ---- Fetch the catalog for this combo --------------------------------
  let catalog: CatalogGearItem[];
  try {
    catalog = await fetchCatalogForSpeciesMethod(
      db,
      lookup.ids.speciesId,
      lookup.ids.methodId,
      parsed.value.ownedGroups,
    );
  } catch (e) {
    log('error', {
      requestId,
      message: 'catalog_fetch_failed',
      errorCode: 'INTERNAL_ERROR',
      details: (e as Error).message,
    });
    return errorResponse(500, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to load gear catalog',
    });
  }

  if (catalog.length === 0) {
    const empty: GearRecommendationResponse = {
      species: parsed.value.species,
      method: parsed.value.method,
      groups: [],
      totalEstimateUSD: 0,
      source: { provider: 'mock', cached: false },
    };
    await writeCache(db, requestHash, empty, requestId);
    return jsonResponse(empty);
  }

  // ---- Optional LLM curation -------------------------------------------
  const curator = await runCurator(
    env,
    {
      species: parsed.value.species,
      method: parsed.value.method,
      budgetTier: parsed.value.budgetTier,
      items: catalog,
    },
    requestId,
  );

  // ---- Pricing ---------------------------------------------------------
  const ctx = { requestId, searchHints: curator?.searchHints };
  let prices = await primary.getPrices(catalog, ctx);
  let providerForResponse: Retailer = primary.retailer;
  if (prices.size === 0 && primary !== fallback) {
    log('warn', {
      requestId,
      providerSelected: flag,
      message: 'primary_provider_returned_no_prices_falling_back',
    });
    prices = await fallback.getPrices(catalog, ctx);
    providerForResponse = fallback.retailer;
  }

  // ---- Group + tier selection ------------------------------------------
  const itemsWithPrices = catalog.map((item) => ({
    ...item,
    _prices: prices.get(item.id) ?? [],
  }));

  const byGroup = new Map<string, typeof itemsWithPrices>();
  for (const item of itemsWithPrices) {
    const list = byGroup.get(item.groupSlug);
    if (list) list.push(item);
    else byGroup.set(item.groupSlug, [item]);
  }

  const groups: GearGroup[] = [];
  let totalEstimate = 0;

  for (const [groupSlug, candidates] of byGroup) {
    const chosen = chooseTierItem(candidates, parsed.value.budgetTier);
    if (!chosen) continue;
    const picked = pickPrice(chosen._prices);
    const priceUSD = picked?.priceUSD ?? chosen.basePriceUSD;

    const gearItem: GearItem = {
      id: chosen.id,
      name: chosen.name,
      description: chosen.description,
      tag: chosen.tag,
      estPriceUSD: priceUSD,
      prices: chosen._prices,
      links: chosen._prices.map((p) => ({ retailer: p.retailer, url: p.url })),
      group: chosen.groupName,
      rationale: curator?.rationales?.[chosen.id],
    };
    totalEstimate += priceUSD;
    groups.push({ group: chosen.groupName, items: [gearItem] });
    void groupSlug;
  }

  const response: GearRecommendationResponse = {
    species: parsed.value.species,
    method: parsed.value.method,
    groups,
    totalEstimateUSD: Math.round(totalEstimate * 100) / 100,
    source: { provider: providerForResponse, cached: false },
  };

  // ---- Cache + log + respond -------------------------------------------
  await writeCache(db, requestHash, response, requestId);

  log('info', {
    requestId,
    species: parsed.value.species,
    method: parsed.value.method,
    providerSelected: flag,
    cacheHit: false,
    durationMs: Date.now() - startedAt,
    message: 'request_completed',
  });

  return jsonResponse(response);
});
