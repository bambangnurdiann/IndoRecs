import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateAccesstradeJWT, convertToAffiliateLink } from './_lib/accesstrade';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { urls } = req.body as { urls?: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Field "urls" harus berupa array of Shopee URLs' });
    }

    if (urls.length > 10) {
      return res.status(400).json({ error: 'Maksimal 10 URL per request' });
    }

    // Validate all URLs are Shopee URLs
    const shopeeRegex = /^https?:\/\/(www\.)?shopee\.co\.id\//;
    for (const url of urls) {
      if (!shopeeRegex.test(url)) {
        return res.status(400).json({ 
          error: `URL tidak valid: "${url}". Hanya URL shopee.co.id yang diterima.` 
        });
      }
    }

    // Check env vars
    const { ACCESSTRADE_SITE_ID, ACCESSTRADE_CAMPAIGN_ID, ACCESSTRADE_USER_UID, ACCESSTRADE_SECRET_KEY } = process.env;
    if (!ACCESSTRADE_SITE_ID || !ACCESSTRADE_CAMPAIGN_ID || !ACCESSTRADE_USER_UID || !ACCESSTRADE_SECRET_KEY) {
      console.error('Missing Accesstrade environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = generateAccesstradeJWT(ACCESSTRADE_USER_UID, ACCESSTRADE_SECRET_KEY);

    // Convert all URLs in parallel
    const results = await Promise.allSettled(
      urls.map((url) =>
        convertToAffiliateLink({
          landingUrl: url,
          siteId: ACCESSTRADE_SITE_ID,
          campaignId: ACCESSTRADE_CAMPAIGN_ID,
          token,
        })
      )
    );

    const affiliateLinks: Record<string, string | null> = {};
    results.forEach((result, index) => {
      const originalUrl = urls[index];
      if (result.status === 'fulfilled') {
        affiliateLinks[originalUrl] = result.value;
      } else {
        console.error(`Failed to convert ${originalUrl}:`, result.reason);
        affiliateLinks[originalUrl] = null;
      }
    });

    return res.status(200).json({ affiliateLinks });
  } catch (error) {
    console.error('Affiliate conversion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
