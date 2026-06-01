// api/recommend.ts
import type { IncomingMessage, ServerResponse } from 'http';
type ApiRequest = { method?: string; body?: unknown; headers?: Record<string,string> };
type ApiResponse = { setHeader: (n:string,v:string)=>void; status: (c:number)=>ApiResponse; json: (b:unknown)=>unknown; end: ()=>unknown; write?: (chunk:string)=>void; };

import { GoogleGenAI } from '@google/genai';

interface RecommendBody {
  category?: string; subcategory?: string; budget?: string;
  needs?: string[]; detail?: string; stream?: boolean;
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

    const prompt = `Carikan rekomendasi produk:\nKategori: ${category} - ${subcategory}\nBudget: ${budget}\nKebutuhan: ${needsArr.join(', ')}\nDetail: ${detail}\n\nBalas HANYA JSON (tanpa markdown, tanpa backtick):{"budget_warning":false,"budget_warning_message":"","summary":"ringkasan singkat","products":[{"rank":1,"name":"Nama Produk","brand":"Brand","price_min":"Rp X","price_max":"Rp Y","is_bekas":false,"badge":"Best Value","match_score":85,"match_reason":"alasan","key_specs":["spek"],"pros":["pro"],"cons":["con"],"best_for":"cocok","not_for":"tidak cocok","blibli_url":"https://www.blibli.com/jual/nama-produk","shopee_url":"https://shopee.co.id/search?keyword=nama+produk","whatsapp_text":"teks"}],"tips":"tips","alternative_suggestion":"saran"}\nKembalikan 3 produk. Respond ONLY JSON. Bahasa Indonesia.`;

    const ai = getClient();
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
    return res.status(200).json(JSON.parse(cleaned));

  } catch (error: any) {
    console.error('[recommend] Error:', error?.message, error?.stack?.slice(0, 300));
    return res.status(502).json({ error: 'Failed to generate recommendations' });
  }
}
