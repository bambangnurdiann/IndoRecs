// api/recommend.ts
import type { IncomingMessage, ServerResponse } from 'http';
type ApiRequest = { method?: string; body?: unknown; headers?: Record<string,string> };
type ApiResponse = { setHeader: (n:string,v:string)=>void; status: (c:number)=>ApiResponse; json: (b:unknown)=>unknown; end: ()=>unknown; write?: (chunk:string)=>void; };

import { GoogleGenAI } from '@google/genai';
import { findBlibliProductUrl } from './_lib/blibli.js';
import { generateBlibliAffiliateLink } from '../src/lib/affiliate.js';

interface RecommendBody {
  category?: string; subcategory?: string; budget?: string;
  needs?: string[]; detail?: string; stream?: boolean;
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
 *
 * Priority:
 * 1. Gemini-provided blibli_url containing /p/ or /jual/ (trusted — no scraping)
 * 2. Server-side scraping via findBlibliProductUrl() (last-resort fallback)
 * 3. BLIBLI_FALLBACK_URL (homepage)
 *
 * /cari/ URLs are never used — they are not eligible for affiliate commission.
 */
function isValidBlibliUrl(url: string | undefined): boolean {
  if (!url) return false;
  // Accept /p/ (product page) or /jual/ (search listing) from Gemini.
  // Reject /cari/, homepage, and anything else.
  return url.includes('/p/') || url.includes('/jual/');
}

async function injectBlibliAffiliateUrls(products: GeminiProduct[]): Promise<void> {
  const lookups = products.map(async (p) => {
    // Use Gemini's URL directly if it's a valid product or search page.
    const candidateUrl = isValidBlibliUrl(p.blibli_url) ? p.blibli_url! : null;

    const productUrl =
      candidateUrl ?? (await findBlibliProductUrl(p.name)) ?? BLIBLI_FALLBACK_URL;

    p.blibli_affiliate_url = generateBlibliAffiliateLink(productUrl, p.brand);
  });

  await Promise.all(lookups);
}

const MAX_FIELD_LEN = 200;
const MAX_DETAIL_LEN = 500;
const MAX_NEEDS = 10;

function clean(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.replace(/[\u0000-\u001F\u007F]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
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
    const body = (req.body ?? {}) as RecommendBody;
    const category = clean(body.category, MAX_FIELD_LEN);
    const subcategory = clean(body.subcategory, MAX_FIELD_LEN);
    const budget = clean(body.budget, MAX_FIELD_LEN);
    const needsArr = Array.isArray(body.needs)
      ? body.needs.slice(0, MAX_NEEDS).map(n => clean(n, MAX_FIELD_LEN)).filter(Boolean)
      : [];
    const detail = clean(body.detail, MAX_DETAIL_LEN);

    if (!category || !subcategory || !budget || needsArr.length === 0) {
      return res.status(400).json({ error: 'Field wajib diisi.' });
    }

    const prompt = `Carikan rekomendasi produk:\nKategori: ${category} - ${subcategory}\nBudget: ${budget}\nKebutuhan: ${needsArr.join(', ')}\nDetail: ${detail}\n\nBalas HANYA JSON (tanpa markdown, tanpa backtick):{"budget_warning":false,"budget_warning_message":"","summary":"ringkasan singkat","products":[{"rank":1,"name":"Nama Produk","brand":"Brand","price_min":"Rp X","price_max":"Rp Y","is_bekas":false,"badge":"Best Value","match_score":85,"match_reason":"alasan","key_specs":["spek"],"pros":["pro"],"cons":["con"],"best_for":"cocok","not_for":"tidak cocok","blibli_url":"https://www.blibli.com/p/nama-produk/is--KODE-PRODUK","shopee_url":"https://shopee.co.id/search?keyword=nama+produk","whatsapp_text":"teks"}],"tips":"tips","alternative_suggestion":"saran"}\nKembalikan 3 produk.\n\nPENTING — Aturan blibli_url:\n- Format ideal: https://www.blibli.com/p/{slug-produk}/ps--{kode-sku}\n  Contoh: iPhone 15 Pro → https://www.blibli.com/p/apple-iphone-15-pro/ps--APF-70017-00303\n  Contoh: MSI Modern 14 → https://www.blibli.com/p/msi-modern-14/ps--ACI-27019-05020\n  Contoh: Samsung Galaxy A55 → https://www.blibli.com/p/samsung-galaxy-a55/ps--SAM-70017-00500\n- Jika kamu tidak tahu SKU-nya, gunakan: https://www.blibli.com/p/{slug-nama-produk-dengan-dash}\n  Contoh: Redmi Note 13 → https://www.blibli.com/p/redmi-note-13\n- Jika sama sekali tidak tahu URL produk spesifik, gunakan: https://www.blibli.com/jual/{keyword-produk}\n- JANGAN gunakan URL /cari/ karena tidak eligible untuk komisi afiliasi.\n\nRespond ONLY JSON. Bahasa Indonesia.`;

    const ai = getClient();

    // --- Streaming path ---
    if (body.stream === true) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      const stream = await ai.models.generateContentStream({
        model: GEMINI_MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      // Buffer all chunks so we can inject affiliate URLs before responding.
      let fullText = '';
      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
        }
      }

      if (!fullText.trim()) {
        throw new Error('Empty response from Gemini');
      }

      const cleaned = extractJson(fullText);
      const parsed: GeminiResponse = JSON.parse(cleaned);

      // Resolve Blibli product pages and generate affiliate links (server-side).
      await injectBlibliAffiliateUrls(parsed.products);

      res.write!(JSON.stringify(parsed));
      return res.end();
    }

    // --- Non-streaming fallback ---
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
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
    console.error('[recommend] Error:', error?.message, error?.stack?.slice(0, 300));
    return res.status(502).json({ error: 'Failed to generate recommendations' });
  }
}
