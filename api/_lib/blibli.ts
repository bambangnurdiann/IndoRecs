// api/_lib/blibli.ts
// Server-side Blibli product URL discovery.
// Never call this from the browser — CORS, security, and rate-limiting reasons.

const BLIBLI_PRODUCT_PATH_RE = /"https:\/\/www\.blibli\.com\/p\/[^"]+"/g;
const BLIBLI_SEARCH_TIMEOUT_MS = 8_000;
const BLIBLI_PRODUCT_URL_RE = /^https:\/\/www\.blibli\.com\/p\//;

/** Normalise a product name into a safe search keyword. */
function toKeyword(name: string): string {
  return name.replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
}

/**
 * Discover a valid Blibli product page URL for the given product name.
 *
 * Strategy: fetch Blibli's search results page and extract the first
 * ``/p/…`` product link.  If the page is blocked, times out, or
 * returns no useful links we fall back to `null` so callers can use
 * the homepage fallback.
 *
 * **Server-side only** — keep this inside `api/` routes.
 */
export async function findBlibliProductUrl(
  productName: string,
): Promise<string | null> {
  const keyword = toKeyword(productName);
  if (!keyword) return null;

  const searchUrl = `https://www.blibli.com/jual/${encodeURIComponent(keyword)}`;

  let html: string;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BLIBLI_SEARCH_TIMEOUT_MS);

    const resp = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'User-Agent':
          'Mozilla/5.0 (compatible; IndoRecs/1.0; +https://indorecs.vercel.app)',
      },
    });
    clearTimeout(timer);

    if (!resp.ok) return null;

    html = await resp.text();
  } catch {
    // Timeout, network error — safe to ignore and fall back.
    return null;
  }

  // Extract absolute Blibli product URLs embedded in the HTML.
  const matches = html.match(BLIBLI_PRODUCT_PATH_RE);
  if (!matches || matches.length === 0) return null;

  for (const raw of matches) {
    // Strip surrounding quotes.
    const url = raw.slice(1, -1);
    if (BLIBLI_PRODUCT_URL_RE.test(url)) return url;
  }

  return null;
}
