import { describe, expect, it } from 'vitest';
import {
  buildRetailerSearchUrls,
  buildSearchKeywords,
  CATALOG_RETAILER_SLUGS,
} from '../src/lib/retailerSearchUrls';

describe('retailerSearchUrls', () => {
  it('builds search keywords with gear group context', () => {
    const q = buildSearchKeywords(
      'Braided Line 20-30lb + Fluorocarbon Leader 10-12lb',
      'line',
    );
    expect(q).toContain('braided');
    expect(q).toContain('fishing line');
    expect(q).not.toContain('example.com');
  });

  it('builds real retailer search URLs for all catalog retailers', () => {
    const urls = buildRetailerSearchUrls({
      itemName: "Medium-Heavy Spinning Rod 7'",
      gearGroup: 'rod',
    });
    for (const slug of CATALOG_RETAILER_SLUGS) {
      expect(urls[slug]).toMatch(/^https:\/\//);
      expect(urls[slug]).not.toContain('example.com');
    }
    expect(urls.amazon).toContain('amazon.com/s?k=');
    expect(urls.walmart).toContain('walmart.com/search?q=');
    expect(urls.basspro).toContain('basspro.com');
    expect(urls.cabelas).toContain('cabelas.com/search?q=');
  });
});
