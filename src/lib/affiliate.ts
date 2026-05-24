// ============================================================
// Client-side: helper to call our serverless API for affiliate conversion
// No secrets or Node.js APIs are used here.
// ============================================================

export interface AffiliateConversionResult {
  affiliateLinks: Record<string, string | null>;
}

/**
 * Convert Shopee URLs to affiliate links via our serverless API endpoint.
 * This is safe to call from the browser.
 */
export async function convertShopeeUrls(urls: string[]): Promise<Record<string, string | null>> {
  if (urls.length === 0) return {};

  try {
    const response = await fetch('/api/convert-affiliate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Affiliate API error:', errorData);
      return Object.fromEntries(urls.map((url) => [url, null]));
    }

    const data: AffiliateConversionResult = await response.json();
    return data.affiliateLinks;
  } catch (error) {
    console.error('Failed to convert affiliate links:', error);
    return Object.fromEntries(urls.map((url) => [url, null]));
  }
}
