// src/lib/affiliate.ts

/**
 * Generate a Shopee affiliate link by constructing a search URL
 * with the product name as keyword, wrapped in the Accesstrade redirect.
 */
export function generateShopeeAffiliateLink(productName: string): string {
  const keyword = encodeURIComponent(productName);
  const shopeeSearchUrl = `https://shopee.co.id/search?keyword=${keyword}&affiliate_id=11146330000&sub_id={psn}-{clickid}-{publisher_site_url}-{campaign}-`;
  return `https://atid.me/002bc7002poy?url=${encodeURIComponent(shopeeSearchUrl)}`;
}

/** Fallback product URL used when no valid /p/ page is discovered and no brand is available. */
const BLIBLI_FALLBACK_URL = 'https://www.blibli.com/home';

/**
 * Convert a brand name to a Blibli ``/brand/`` URL.
 *
 * @example "Samsung" → "https://www.blibli.com/brand/samsung"
 * @example "Xiaomi"  → "https://www.blibli.com/brand/xiaomi"
 */
function toBrandUrl(brand: string): string {
  const slug = brand.toLowerCase().trim().replace(/\s+/g, '-');
  return `https://www.blibli.com/brand/${slug}`;
}

/**
 * Select the best eligible Blibli URL from the available inputs.
 *
 * Hierarchy:
 * 1. ``productUrl`` if it contains ``/p/`` (product page — best for commission)
 * 2. ``brand`` → ``/brand/{slug}`` URL (brand page — eligible fallback)
 * 3. ``BLIBLI_FALLBACK_URL`` (homepage — absolute last resort)
 */
function pickEligibleUrl(productUrl: string, brand: string): string {
  if (productUrl && productUrl.includes('/p/')) return productUrl;
  if (brand) return toBrandUrl(brand);
  return BLIBLI_FALLBACK_URL;
}

/**
 * Generate a Blibli affiliate link backed by the most commission-eligible URL.
 *
 * Architecture:
 * 1. Pick the best URL (product page → brand page → homepage)
 * 2. Build OneLink with Accesstrade-managed deep-link placeholder
 * 3. Wrap with Accesstrade shortener (``atid.me``) for tracking
 *
 * @param productUrl  A Blibli URL (ideally ``/p/…``).  May be the fallback.
 * @param brand       Optional brand name for ``/brand/`` fallback.
 * @returns Accesstrade-wrapped affiliate link ready for the browser.
 */
export function generateBlibliAffiliateLink(
  productUrl: string,
  brand: string = '',
): string {
  const eligibleUrl = pickEligibleUrl(productUrl, brand);

  const afR = encodeURIComponent(eligibleUrl);
  // Accesstrade-managed deep-link placeholder — do NOT re-encode.
  const afDp = 'blibli%253A%252F%252F%7Blanding_page_url_without_domain%7D';

  const oneLinkUrl =
    `https://blibliaffiliate.onelink.me/JLcX` +
    `?af_force_deeplink=true` +
    `&af_param_forwarding=true` +
    `&af_dp=${afDp}` +
    `&at_fnlp_parameter_name=af_r` +
    `&af_r=${afR}` +
    `&utm_source=affiliates` +
    `&utm_medium=affb_6841170ad1b1481a31281e8b` +
    `&utm_campaign=business_share` +
    `&utm_content={psn}-{clickid}`;

  // Wrap with Accesstrade shortener for proper affiliate tracking.
  return `https://atid.me/00dh9j002poy?url=${encodeURIComponent(oneLinkUrl)}`;
}

