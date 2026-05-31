// ============================================================
// Client-side: simple affiliate link generator for Shopee
// Uses Accesstrade redirect URL with search keyword approach
// ============================================================

/**
 * Generate a Shopee affiliate link by constructing a search URL
 * with the product name as keyword, wrapped in the Accesstrade redirect.
 */
export function generateShopeeAffiliateLink(productName: string): string {
  const keyword = encodeURIComponent(productName);
  const shopeeSearchUrl = `https://shopee.co.id/search?keyword=${keyword}&affiliate_id=11146330000&sub_id={psn}-{clickid}-{publisher_site_url}-{campaign}-`;
  return `https://atid.me/002bc7002poy?url=${encodeURIComponent(shopeeSearchUrl)}`;
}

