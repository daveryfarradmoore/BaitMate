import type { CatalogGearItem, PriceResult } from '../types.ts';
import type { PriceProvider, PriceProviderContext } from './types.ts';
import { signPaapiSearchItemsRequest } from '../awsPaapiSigV4.ts';
import { buildRetailSearchQuery } from '../retailSearchQuery.ts';
import { log } from '../logger.ts';

const PAAPI_RESOURCES = [
  'ItemInfo.Title',
  'Images.Primary.Medium',
  'Images.Primary.Large',
  'Offers.Listings.Price',
  'Offers.Summaries.LowestPrice',
];

function parseUsdPrice(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && v >= 0) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
}

function extractAmazonOffer(item: Record<string, unknown>): PriceResult | null {
  const url = typeof item.DetailPageURL === 'string' ? item.DetailPageURL : null;
  if (!url) return null;

  const title =
    (item.ItemInfo as Record<string, unknown> | undefined)?.Title as
      | { DisplayValue?: string }
      | undefined;
  const titleStr = typeof title?.DisplayValue === 'string' ? title.DisplayValue : 'Amazon result';

  const images = item.Images as Record<string, unknown> | undefined;
  const primary = images?.Primary as Record<string, unknown> | undefined;
  const large = primary?.Large as { URL?: string } | undefined;
  const medium = primary?.Medium as { URL?: string } | undefined;
  const image = (typeof large?.URL === 'string' && large.URL) ||
    (typeof medium?.URL === 'string' && medium.URL) ||
    undefined;

  const offers = item.Offers as Record<string, unknown> | undefined;
  const listings = offers?.Listings as unknown[] | undefined;
  let price: number | null = null;

  if (Array.isArray(listings) && listings[0] && typeof listings[0] === 'object') {
    const listing = listings[0] as { Price?: Record<string, unknown> };
    price = parseUsdPrice(listing.Price?.Amount) ??
      parseUsdPrice(listing.Price?.DisplayAmount);
  }

  if (price == null) {
    const summaries = offers?.Summaries as Record<string, unknown> | undefined;
    const lowest = summaries?.LowestPrice as Record<string, unknown> | undefined;
    price = parseUsdPrice(lowest?.Amount) ?? parseUsdPrice(lowest?.DisplayAmount);
  }

  if (price == null) return null;

  return {
    retailer: 'amazon',
    priceUSD: price,
    url,
    title: titleStr,
    image,
  };
}

/**
 * Amazon Product Advertising API 5.0 — SearchItems with SigV4.
 * Requires Associates + PA-API credentials in Edge secrets.
 */
export class AmazonPriceProvider implements PriceProvider {
  readonly retailer = 'amazon' as const;
  readonly displayName = 'Amazon';
  readonly enabled: boolean;

  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly partnerTag: string;
  private readonly host: string;
  private readonly region: string;
  private readonly marketplace: string;

  constructor(env: Record<string, string | undefined>) {
    this.accessKey = env.AMAZON_ACCESS_KEY ?? '';
    this.secretKey = env.AMAZON_SECRET_KEY ?? '';
    this.partnerTag = env.AMAZON_PARTNER_TAG ?? '';
    this.host = env.AMAZON_HOST ?? 'webservices.amazon.com';
    this.region = env.AMAZON_REGION ?? 'us-east-1';
    this.marketplace = env.AMAZON_MARKETPLACE ?? 'www.amazon.com';
    this.enabled = Boolean(this.accessKey && this.secretKey && this.partnerTag);
  }

  async getPrices(
    items: CatalogGearItem[],
    ctx: PriceProviderContext,
  ): Promise<Map<string, PriceResult[]>> {
    const out = new Map<string, PriceResult[]>();
    if (!this.enabled || items.length === 0) {
      if (!this.enabled) {
        log('info', {
          requestId: ctx.requestId,
          message: 'amazon_provider_disabled',
          details: 'Set AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG.',
        });
      }
      return out;
    }

    for (const item of items) {
      const keywords = buildRetailSearchQuery(item, ctx);
      const body = JSON.stringify({
        Keywords: keywords,
        PartnerTag: this.partnerTag,
        PartnerType: 'Associates',
        Marketplace: this.marketplace,
        SearchIndex: 'All',
        ItemCount: 5,
        Resources: PAAPI_RESOURCES,
      });

      try {
        const { url, headers } = await signPaapiSearchItemsRequest({
          accessKey: this.accessKey,
          secretKey: this.secretKey,
          region: this.region,
          host: this.host,
          body,
        });

        const res = await fetch(url, {
          method: 'POST',
          headers,
          body,
        });

        const text = await res.text();
        let json: Record<string, unknown>;
        try {
          json = JSON.parse(text) as Record<string, unknown>;
        } catch {
          log('warn', {
            requestId: ctx.requestId,
            message: 'amazon_paapi_invalid_json',
            details: { status: res.status, snippet: text.slice(0, 200) },
          });
          continue;
        }

        if (!res.ok) {
          log('warn', {
            requestId: ctx.requestId,
            message: 'amazon_paapi_http_error',
            details: { status: res.status, body: json },
          });
          continue;
        }

        const errs = json.Errors as unknown[] | undefined;
        if (Array.isArray(errs) && errs.length > 0) {
          log('warn', {
            requestId: ctx.requestId,
            message: 'amazon_paapi_errors',
            details: errs,
          });
          continue;
        }

        const searchResult = json.SearchResult as Record<string, unknown> | undefined;
        const found = searchResult?.Items as unknown[] | undefined;
        if (!Array.isArray(found) || found.length === 0) {
          log('info', {
            requestId: ctx.requestId,
            message: 'amazon_paapi_no_items',
            details: { gearItemId: item.id, keywords },
          });
          continue;
        }

        let best: PriceResult | null = null;
        for (const raw of found) {
          if (!raw || typeof raw !== 'object') continue;
          const parsed = extractAmazonOffer(raw as Record<string, unknown>);
          if (!parsed) continue;
          if (!best || parsed.priceUSD < best.priceUSD) best = parsed;
        }

        if (best) out.set(item.id, [best]);
      } catch (e) {
        log('warn', {
          requestId: ctx.requestId,
          message: 'amazon_paapi_item_failed',
          details: { gearItemId: item.id, error: (e as Error).message },
        });
      }
    }

    return out;
  }
}
