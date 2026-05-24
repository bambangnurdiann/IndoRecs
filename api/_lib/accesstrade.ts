// api/_lib/accesstrade.ts
import jwt from 'jsonwebtoken';

const ACCESSTRADE_API_BASE = 'https://gurkha.accesstrade.global';

/**
 * Generate JWT untuk Accesstrade Publisher API
 */
export function generateAccesstradeJWT(userUid: string, secretKey: string): string {
  const payload = {
    userUid,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 jam
  };

  return jwt.sign(payload, secretKey, { algorithm: 'HS256' });
}

/**
 * Convert 1 Shopee URL menjadi Affiliate Link
 */
export async function convertToAffiliateLink(params: {
  landingUrl: string;
  siteId: string;
  campaignId: string;
  token: string;
  name?: string;
}): Promise<string> {
  const { landingUrl, siteId, campaignId, token, name = 'IndoRecs Recommendation' } = params;

  const url = `${ACCESSTRADE_API_BASE}/v1/publishers/me/sites/${siteId}/campaigns/${campaignId}/creatives/custom`;

  const body = {
    landingUrl,
    name,
    // subIds bisa ditambahkan kalau mau tracking
    // subIds: ["app", "rekomendasi"]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Accesstrade-User-Type': 'publisher',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Accesstrade API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  // Field yang paling sering dipakai
  return data.affiliateLink || data.link || data.url || data.shortLink || landingUrl;
}