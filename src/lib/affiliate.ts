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

/**
 * Generate Blibli affiliate deep link via Accesstrade.
 * Template URL: product search di blibli.com dengan keyword nama produk.
 */
export function generateBlibliAffiliateLink(productName: string): string {
  // 1. Bentuk URL pencarian Blibli: domain + path slug
  const slug = encodeURIComponent(productName).replace(/%20/g, '-').toLowerCase();
  const blibliSearchUrl = `https://www.blibli.com/jual/${slug}`;

  // 2. Ambil path tanpa domain (tanpa leading slash) untuk di-inject ke skema blibli://
  const landingPath = blibliSearchUrl.replace('https://www.blibli.com/', '');

  // 3. Susun deep link Onelink dengan:
  //    - af_dp  = blibli://<path>  (di-encode 1x → nanti di-encode lagi oleh wrapper → %253A%252F...)
  //    - af_r   = full URL Blibli  (di-encode 1x)
  //    - utm_content = {psn}-{clickid} wajib di ujung untuk pelacakan Accesstrade
  const deepLinkUrl =
    `https://blibliaffiliate.onelink.me/JLcX` +
    `?af_force_deeplink=true` +
    `&af_param_forwarding=true` +
    `&af_dp=blibli%3A%2F%2F${encodeURIComponent(landingPath)}` +
    `&at_fnlp_parameter_name=af_r` +
    `&af_r=${encodeURIComponent(blibliSearchUrl)}` +
    `&utm_source=affiliates` +
    `&utm_medium=affb_6841170ad1b1481a31281e8b` +
    `&utm_campaign=business_share` +
    `&utm_content={psn}-{clickid}`;

  // 4. Bungkus dengan redirector Accesstrade
  return `https://atid.me/00dh9j002poy?url=${encodeURIComponent(deepLinkUrl)}`;
}

