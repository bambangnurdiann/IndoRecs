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
 * Generate Blibli affiliate deep link via OneLink.
 * Builds a direct deep link URL with af_dp and af_r parameters properly encoded.
 */
export function generateBlibliAffiliateLink(productName: string): string {
  const keyword = encodeURIComponent(productName);

  const blibliSearchUrl = `https://www.blibli.com/cari/${keyword}`;

  const afDp = encodeURIComponent(`blibli://cari/${keyword}`);
  const afR = encodeURIComponent(blibliSearchUrl);

  return (
    `https://blibliaffiliate.onelink.me/JLcX` +
    `?af_force_deeplink=true` +
    `&af_param_forwarding=true` +
    `&af_dp=${afDp}` +
    `&at_fnlp_parameter_name=af_r` +
    `&af_r=${afR}` +
    `&utm_source=affiliates` +
    `&utm_medium=affb_6841170ad1b1481a31281e8b` +
    `&utm_campaign=business_share` +
    `&utm_content={psn}-{clickid}`
  );
}

