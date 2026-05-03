import type { CatalogGearItem, PriceResult } from '../types.ts';
import type { PriceProvider, PriceProviderContext } from './types.ts';
import { log } from '../logger.ts';

/**
 * Amazon Product Advertising API 5.0 adapter (skeleton).
 *
 * Disabled until `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY` and
 * `AMAZON_PARTNER_TAG` are configured. The full implementation should:
 *   1. POST to https://{AMAZON_HOST}/paapi5/searchitems
 *   2. Sign requests with AWS SigV4 (service: `ProductAdvertisingAPI`,
 *      region: `AMAZON_REGION`).
 *   3. Use one search query per gear item (or per group when curator hints
 *      are supplied) with `SearchItemsRequest.Keywords`.
 *   4. Map `Item.Offers.Listings[0].Price.Amount` to `PriceResult.priceUSD`.
 *   5. Use `Item.DetailPageURL` as the URL and `Item.Images.Primary.Large.URL`
 *      as the image.
 *
 * On any failure, the hybrid provider falls back to the mock data so the app
 * never breaks.
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

  constructor(env: Record<string, string | undefined>) {
    this.accessKey = env.AMAZON_ACCESS_KEY ?? '';
    this.secretKey = env.AMAZON_SECRET_KEY ?? '';
    this.partnerTag = env.AMAZON_PARTNER_TAG ?? '';
    this.host = env.AMAZON_HOST ?? 'webservices.amazon.com';
    this.region = env.AMAZON_REGION ?? 'us-east-1';
    this.enabled = Boolean(this.accessKey && this.secretKey && this.partnerTag);
  }

  async getPrices(
    _items: CatalogGearItem[],
    ctx: PriceProviderContext,
  ): Promise<Map<string, PriceResult[]>> {
    if (!this.enabled) {
      log('info', {
        requestId: ctx.requestId,
        message: 'amazon_provider_disabled',
        details: 'Set AMAZON_* env vars to enable.',
      });
      return new Map();
    }

    log('warn', {
      requestId: ctx.requestId,
      message: 'amazon_provider_not_implemented',
      details: 'PA-API SigV4 implementation pending; returning empty result.',
    });
    return new Map();
  }
}
