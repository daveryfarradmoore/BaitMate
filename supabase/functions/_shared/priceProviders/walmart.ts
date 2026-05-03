import type { CatalogGearItem, PriceResult } from '../types.ts';
import type { PriceProvider, PriceProviderContext } from './types.ts';
import { log } from '../logger.ts';

/**
 * Walmart Affiliate API adapter (skeleton).
 *
 * Disabled until `WALMART_CONSUMER_ID` and `WALMART_PRIVATE_KEY` are set.
 * Full implementation:
 *   1. GET https://developer.api.walmart.com/api-proxy/service/affil/product/v2/search
 *      with query params `query=<keywords>&format=json`.
 *   2. Sign with the Walmart-specific RSA-SHA256 header set:
 *      WM_CONSUMER.ID, WM_CONSUMER.INTIMESTAMP, WM_SEC.KEY_VERSION, WM_SEC.AUTH_SIGNATURE.
 *   3. Map `items[0].salePrice` to `PriceResult.priceUSD`,
 *      `items[0].productUrl` to URL, and `items[0].thumbnailImage` to image.
 *
 * Same fallback semantics as the Amazon adapter.
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
    _items: CatalogGearItem[],
    ctx: PriceProviderContext,
  ): Promise<Map<string, PriceResult[]>> {
    if (!this.enabled) {
      log('info', {
        requestId: ctx.requestId,
        message: 'walmart_provider_disabled',
        details: 'Set WALMART_CONSUMER_ID and WALMART_PRIVATE_KEY to enable.',
      });
      return new Map();
    }

    log('warn', {
      requestId: ctx.requestId,
      message: 'walmart_provider_not_implemented',
      details: 'Walmart Affiliate signing implementation pending.',
    });
    return new Map();
  }
}
