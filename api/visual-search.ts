// api/visual-search.ts
type ApiRequest = { method?: string; body?: unknown };
type ApiResponse = { setHeader: (n:string,v:string)=>void; status: (c:number)=>ApiResponse; json: (b:unknown)=>unknown; end: ()=>unknown; };

import { GoogleGenAI } from '@google/genai';
import { findBlibliProductUrl } from './_lib/blibli.js';
import { generateBlibliAffiliateLink } from '../src/lib/affiliate.js';

interface VisualSearchBody {
  image?: string;
  mimeType?: string;
}

interface GeminiProduct {
  rank: number;
  name: string;
  brand: string;
  price_min: string;
  price_max: string;
  is_bekas: boolean;
  badge: string;
  match_score: number;
  match_reason: string;
  key_specs: string[];
  pros: string[];
  cons: string[];
  best_for: string;
  not_for: string;
  blibli_url?: string;
  shopee_url?: string;
  whatsapp_text: string;
  blibli_affiliate_url?: string;
}

interface GeminiResponse {
  budget_warning: boolean;
  budget_warning_message: string;
  summary: string;
  products: GeminiProduct[];
  tips: string;
  alternative_suggestion: string;
}

const BLIBLI_FALLBACK_URL = 'https://www.blibli.com/home';

/**
 * Resolve Blibli affiliate URLs for every product in parallel.
 */
async function injectBlibliAffiliateUrls(products: GeminiProduct[]): Promise<void> {
  const lookups = products.map(async (p) => {
    const candidateUrl =
      p.blibli_url && p.blibli_url.includes('/p/') ? p.blibli_url : null;

    const productUrl =
      candidateUrl ?? (await findBlibliProductUrl(p.name)) ?? BLIBLI_FALLBACK_URL;

    p.blibli_affiliate_url = generateBlibliAffiliateLink(productUrl);
  });

  await Promise.all(lookups);
}

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

const GEMINI_MODEL = 'gemini-2.5-flash';

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (client) return client;
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not configured');
  client = new GoogleGenAI({ apiKey: key });
  return client;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = (req.body ?? {}) as VisualSearchBody;
    if (!body.image) return res.status(400).json({ error: 'Image (Base64) is required.' });

    const ai = getClient();
    const prompt = `Lihat gambar produk ini. Berikan rekomendasi 3 produk serupa yang tersedia di Indonesia.\n\nBalas HANYA JSON (tanpa markdown, tanpa backtick):{"budget_warning":false,"budget_warning_message":"","summary":"deskripsi singkat","products":[{"rank":1,"name":"Nama Produk","brand":"Brand","price_min":"Rp X","price_max":"Rp Y","is_bekas":false,"badge":"Best Match","match_score":85,"match_reason":"alasan","key_specs":["spek"],"pros":["pro"],"cons":["con"],"best_for":"cocok","not_for":"tidak cocok","blibli_url":"https://www.blibli.com/p/nama-produk/is--KODE-PRODUK","shopee_url":"https://shopee.co.id/search?keyword=nama+produk","whatsapp_text":"teks"}],"tips":"tips","alternative_suggestion":"saran"}\nUntuk blibli_url, gunakan format URL produk spesifik Blibli: https://www.blibli.com/p/{slug-produk}/is--{kode-sku} jika diketahui, atau https://www.blibli.com/jual/{keyword} jika tidak. Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt },
        { inlineData: { mimeType: body.mimeType || 'image/jpeg', data: body.image } }
      ],
      config: { responseMimeType: 'application/json' },
    });

    const rawText: string | undefined = response.text;
    if (!rawText || rawText.trim() === '') {
      throw new Error('Empty response from Gemini');
    }

    const cleaned = extractJson(rawText);
    const parsed: GeminiResponse = JSON.parse(cleaned);

    // Resolve Blibli product pages and generate affiliate links (server-side).
    await injectBlibliAffiliateUrls(parsed.products);

    return res.status(200).json(parsed);

  } catch (error: any) {
    console.error('[visual-search] Error:', error?.message, error?.stack?.slice(0, 300));
    return res.status(502).json({ error: 'Failed to process image' });
  }
}
