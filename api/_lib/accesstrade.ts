import * as crypto from 'crypto';

// ============================================================
// Server-side only: JWT generation & Accesstrade API call
// These functions use Node.js crypto and must NEVER run client-side.
// ============================================================

interface JWTPayload {
  uid: string;
  iat: number;
  exp: number;
}

/**
 * Generate a JWT (HS256) for Accesstrade authentication.
 */
export function generateAccesstradeJWT(uid: string, secretKey: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    uid,
    iat: now,
    exp: now + 3600, // 1 hour expiry
  };

  const base64Header = base64UrlEncode(JSON.stringify(header));
  const base64Payload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');

  return `${base64Header}.${base64Payload}.${signature}`;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

interface ConvertOptions {
  landingUrl: string;
  siteId: string;
  campaignId: string;
  token: string;
}

interface AccesstradeCreativeResponse {
  data?: {
    url?: string;
  };
  error?: string;
}

/**
 * Call Accesstrade Custom Creative API to convert a landing URL
 * into an affiliate link.
 */
export async function convertToAffiliateLink(options: ConvertOptions): Promise<string> {
  const { landingUrl, siteId, campaignId, token } = options;

  const endpoint = `https://gurkha.accesstrade.global/v1/publishers/me/sites/${siteId}/campaigns/${campaignId}/creatives/custom`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Accesstrade-User-Type': 'publisher',
    },
    body: JSON.stringify({
      landingUrl,
      name: 'IndoRecs Rekomendasi Produk',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Accesstrade API error (${response.status}): ${errorText}`);
  }

  const data: AccesstradeCreativeResponse = await response.json();

  if (!data.data?.url) {
    throw new Error('Accesstrade API did not return an affiliate URL');
  }

  return data.data.url;
}
