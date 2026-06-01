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
  const keyword = encodeURIComponent(productName);
  const blibliSearchUrl = `https://www.blibli.com/jual/${keyword.replace(/%20/g, '-').toLowerCase()}`;
  
  const deepLinkUrl = `https://blibliaffiliate.onelink.me/JLcX?af_force_deeplink=true&af_param_forwarding=true&af_dp=blibli%3A%2F%2F${encodeURIComponent(blibliSearchUrl.replace('https://www.blibli.com', ''))}&at_fnlp_parameter_name=af_r&af_r=${encodeURIComponent(blibliSearchUrl)}&utm_source=affiliates&utm_medium=affb_6841170ad1b1481a31281e8b&utm_campaign=business_share&utm_content={psn}-{clickid}`;

  return `https://atid.me/00dh9j002poy?url=${encodeURIComponent(deepLinkUrl)}`;
}

