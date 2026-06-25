/**
 * AWS Signature Version 4 for Amazon PA-API 5.0 (ProductAdvertisingAPI).
 * Uses Web Crypto only (no AWS SDK) so Edge Functions stay small.
 */

const encoder = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(message: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(message));
  return toHex(hash);
}

async function hmac(key: Uint8Array, data: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return new Uint8Array(sig);
}

async function getSignatureKey(
  secretKey: string,
  dateStamp: string,
  regionName: string,
  serviceName: string,
): Promise<Uint8Array> {
  const kDate = await hmac(encoder.encode(`AWS4${secretKey}`), dateStamp);
  const kRegion = await hmac(kDate, regionName);
  const kService = await hmac(kRegion, serviceName);
  return await hmac(kService, 'aws4_request');
}

function amzDateParts(now: Date): { amzDate: string; dateStamp: string } {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const H = String(now.getUTCHours()).padStart(2, '0');
  const M = String(now.getUTCMinutes()).padStart(2, '0');
  const S = String(now.getUTCSeconds()).padStart(2, '0');
  const dateStamp = `${y}${m}${d}`;
  const amzDate = `${dateStamp}T${H}${M}${S}Z`;
  return { amzDate, dateStamp };
}

const PAAPI_SERVICE = 'ProductAdvertisingAPI';
const PAAPI_TARGET = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
const PAAPI_PATH = '/paapi5/searchitems';

export interface PaapiSignedPost {
  url: string;
  headers: Record<string, string>;
  body: string;
}

/**
 * Build a signed POST to PA-API SearchItems. Caller sends `body` as-is on the wire.
 */
export async function signPaapiSearchItemsRequest(opts: {
  accessKey: string;
  secretKey: string;
  region: string;
  host: string;
  body: string;
  now?: Date;
}): Promise<PaapiSignedPost> {
  const now = opts.now ?? new Date();
  const { amzDate, dateStamp } = amzDateParts(now);
  const payloadHash = await sha256Hex(opts.body);

  const canonicalHeaders = [
    `content-encoding:amz-1.0`,
    `content-type:application/json; charset=UTF-8`,
    `host:${opts.host.toLowerCase()}`,
    `x-amz-date:${amzDate}`,
    `x-amz-target:${PAAPI_TARGET}`,
  ].join('\n') + '\n';

  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';

  const canonicalRequest = [
    'POST',
    PAAPI_PATH,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${opts.region}/${PAAPI_SERVICE}/aws4_request`;
  const canonicalRequestHash = await sha256Hex(canonicalRequest);
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    canonicalRequestHash,
  ].join('\n');

  const signingKey = await getSignatureKey(opts.secretKey, dateStamp, opts.region, PAAPI_SERVICE);
  const signature = toHex(await hmac(signingKey, stringToSign));

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${opts.accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `https://${opts.host}${PAAPI_PATH}`;
  const headers: Record<string, string> = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=UTF-8',
    host: opts.host,
    'x-amz-date': amzDate,
    'x-amz-target': PAAPI_TARGET,
    authorization,
  };

  return { url, headers, body: opts.body };
}
