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

/** Fallback product URL used when no valid /p/ page is discovered. */
const BLIBLI_FALLBACK_URL = 'https://www.blibli.com/home';

/**
 * Derive a ``blibli://…`` deep-link path from a Blibli web URL.
 * For product pages we swap the scheme and host; for everything else
 * we fall back to ``blibli://home`` to avoid broken deep links.
 */
function deriveDeepLink(productUrl: string): string {
  try {
    const u = new URL(productUrl);
    if (u.hostname === 'www.blibli.com' && u.pathname.startsWith('/p/')) {
      return `blibli://${u.pathname}${u.search}${u.hash}`;
    }
  } catch { /* invalid URL — use fallback */ }
  return 'blibli://home';
}

/**
 * Generate a Blibli affiliate link backed by a **product page** URL.
 *
 * Architecture:
 * 1. Product URL → OneLink (with ``af_dp`` deep-link + ``af_r`` web fallback)
 * 2. OneLink → Accesstrade shortener (``atid.me``) for tracking
 *
 * @param productUrl  A valid ``https://www.blibli.com/p/…`` URL, or the
 *                    fallback homepage URL.  Must NOT be a ``/cari/`` URL —
 *                    those are not eligible for affiliate commission.
 * @returns Accesstrade-wrapped affiliate link ready for the browser.
 */
export function generateBlibliAffiliateLink(productUrl: string): string {
  const safeUrl = productUrl || BLIBLI_FALLBACK_URL;

  const afR = encodeURIComponent(safeUrl);
  const afDp = encodeURIComponent(deriveDeepLink(safeUrl));

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

