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
 *
 * Gracefully returns null for all URLs if the API is unavailable
 * (e.g., running with plain Vite instead of `vercel dev`).
 */
export async function convertShopeeUrls(urls: string[]): Promise<Record<string, string | null>> {
  if (urls.length === 0) return {};

  const fallback = Object.fromEntries(urls.map((url) => [url, null]));

  try {
    const response = await fetch('/api/convert-affiliate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });

    // If we get HTML back (e.g. Vite 404 page), the API isn't available
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn('[Affiliate] API endpoint not available (not running on Vercel). Skipping conversion.');
      return fallback;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Affiliate] API error:', errorData);
      return fallback;
    }

    const data: AffiliateConversionResult = await response.json();
    return data.affiliateLinks;
  } catch (error) {
    console.error('[Affiliate] Failed to convert links:', error);
    return fallback;
  }
}
