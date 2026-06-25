import { assertEquals } from 'jsr:@std/assert@1';
import {
  buildRetailerSearchUrls,
  CATALOG_RETAILER_SLUGS,
} from '../_shared/retailerSearchUrls.ts';

Deno.test('buildRetailerSearchUrls returns HTTPS links for all retailers', () => {
  const urls = buildRetailerSearchUrls({
    itemName: "Medium-Heavy Spinning Rod 7'",
    gearGroup: 'rod',
  });
  for (const slug of CATALOG_RETAILER_SLUGS) {
    assertEquals(urls[slug].startsWith('https://'), true);
    assertEquals(urls[slug].includes('example.com'), false);
  }
});
