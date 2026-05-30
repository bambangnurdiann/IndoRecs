// ============================================================
// Client-side affiliate link generator untuk Accesstrade + Shopee
// Tidak memerlukan API call atau backend apapun.
// Pola URL didapat dari Accesstrade Custom Link generator.
// ============================================================

const AFFILIATE_BASE = 'https://atid.me/002bc7002poy';
const AFFILIATE_ID = '11146330000';

/**
 * Generate affiliate link Shopee yang langsung mengarah ke halaman
 * pencarian produk berdasarkan nama produk.
 *
 * Contoh output:
 * https://atid.me/002bc7002poy?url=https%3A%2F%2Fshopee.co.id%2Fsearch%3Fkeyword%3Dinfinix%2Bhot%2B30s%26affiliate_id%3D11146330000...
 */
export function generateShopeeAffiliateLink(productName: string): string {
  const keyword = productName.trim().replace(/\s+/g, '+');
  const shopeeSearchUrl =
    `https://shopee.co.id/search?keyword=${keyword}` +
    `&affiliate_id=${AFFILIATE_ID}` +
    `&sub_id={psn}-{clickid}-{publisher_site_url}-{campaign}-`;

  return `${AFFILIATE_BASE}?url=${encodeURIComponent(shopeeSearchUrl)}`;
}
