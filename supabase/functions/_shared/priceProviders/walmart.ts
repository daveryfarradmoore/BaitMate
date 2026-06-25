import forge from 'node-forge';
import type { CatalogGearItem, PriceResult } from '../types.ts';
import type { PriceProvider, PriceProviderContext } from './types.ts';
import { buildRetailSearchQuery } from '../retailSearchQuery.ts';
import { log } from '../logger.ts';

const WALMART_SEARCH_BASE =
  'https://developer.api.walmart.com/api-proxy/service/affil/product/v2/search';

function normalizePem(pem: string): string {
  return pem.replace(/\\n/g, '\n').trim();
}

function walmartAuthHeadersForKey(
  consumerId: string,
  keyVersion: string,
  privateKey: forge.pki.PrivateKey,
): Record<string, string> {
  const timestamp = Date.now().toString();
  const stringToSign = `${consumerId}\n${timestamp}\n${keyVersion}\n`;
  const md = forge.md.sha256.create();
  md.update(stringToSign, 'utf8');
  const signature = privateKey.sign(md);
  const signatureB64 = forge.util.encode64(signature);

  return {
    'WM_SEC.AUTH_SIGNATURE': signatureB64,
    'WM_CONSUMER.INTIMESTAMP': timestamp,
    'WM_CONSUMER.ID': consumerId,
    'WM_SEC.KEY_VERSION': keyVersion,
    Accept: 'application/json',
  };
}

function parseUsd(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && v >= 0) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
}

function firstString(...vals: unknown[]): string | null {
  for (const v of vals) {
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return null;
}

function extractWalmartFirstItem(row: Record<string, unknown>): PriceResult | null {
  const url = firstString(
    row.productTrackingUrl,
    row.productUrl,
    row.itemPageUrl,
    row.affiliateAddToCartUrl,
  );
  if (!url) return null;

  const title = firstString(row.name, row.title) ?? 'Walmart result';
  const image = firstString(
    row.thumbnailImage,
    row.mediumImage,
    row.largeImage,
  ) ?? undefined;

  const price = parseUsd(row.salePrice) ??
    parseUsd(row.price) ??
    parseUsd(row.offerPrice) ??
    parseUsd((row.priceInfo as Record<string, unknown> | undefined)?.price);

  if (price == null) return null;

  return {
    retailer: 'walmart',
    priceUSD: price,
    url,
    title,
    image,
  };
}

/**
 * Walmart Affiliate product search (v2) with RSA-SHA256 headers.
 */
export class WalmartPriceProvider implements PriceProvider {
  readonly retailer = 'walmart' as const;
  readonly displayName = 'Walmart';
  readonly enabled: boolean;

  private readonly consumerId: string;
  private readonly privateKey: string;
  private readonly keyVersion: string;

  constructor(env: Record<string, string | undefined>) {
    this.consumerId = env.WALMART_CONSUMER_ID ?? '';
    this.privateKey = env.WALMART_PRIVATE_KEY ?? '';
    this.keyVersion = env.WALMART_KEY_VERSION ?? '1';
    this.enabled = Boolean(this.consumerId && this.privateKey);
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
          message: 'walmart_provider_disabled',
          details: 'Set WALMART_CONSUMER_ID and WALMART_PRIVATE_KEY.',
        });
      }
      return out;
    }

    let parsedKey: forge.pki.PrivateKey;
    try {
      parsedKey = forge.pki.privateKeyFromPem(normalizePem(this.privateKey));
    } catch (e) {
      log('warn', {
        requestId: ctx.requestId,
        message: 'walmart_key_parse_failed',
        details: (e as Error).message,
      });
      return out;
    }

    for (const item of items) {
      const auth = walmartAuthHeadersForKey(this.consumerId, this.keyVersion, parsedKey);
      const query = buildRetailSearchQuery(item, ctx);
      const url = `${WALMART_SEARCH_BASE}?query=${encodeURIComponent(query)}&format=json`;

      try {
        const res = await fetch(url, { method: 'GET', headers: auth });
        const text = await res.text();
        let json: Record<string, unknown>;
        try {
          json = JSON.parse(text) as Record<string, unknown>;
        } catch {
          log('warn', {
            requestId: ctx.requestId,
            message: 'walmart_invalid_json',
            details: { status: res.status, snippet: text.slice(0, 200) },
          });
          continue;
        }

        if (!res.ok) {
          log('warn', {
            requestId: ctx.requestId,
            message: 'walmart_http_error',
            details: { status: res.status, body: json },
          });
          continue;
        }

        const rawItems = json.items as unknown[] | undefined;
        if (!Array.isArray(rawItems) || rawItems.length === 0) {
          log('info', {
            requestId: ctx.requestId,
            message: 'walmart_no_items',
            details: { gearItemId: item.id, query },
          });
          continue;
        }

        let best: PriceResult | null = null;
        for (const raw of rawItems) {
          if (!raw || typeof raw !== 'object') continue;
          const parsed = extractWalmartFirstItem(raw as Record<string, unknown>);
          if (!parsed) continue;
          if (!best || parsed.priceUSD < best.priceUSD) best = parsed;
        }

        if (best) out.set(item.id, [best]);
      } catch (e) {
        log('warn', {
          requestId: ctx.requestId,
          message: 'walmart_item_failed',
          details: { gearItemId: item.id, error: (e as Error).message },
        });
      }
    }

    return out;
  }
}
