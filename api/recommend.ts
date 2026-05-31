// api/recommend.ts
// Server-side product recommendation. Keeps GEMINI_API_KEY off the client.
type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponse;
  json: (body: unknown) => unknown;
  end: () => unknown;
};
import { generateJson } from './_lib/gemini';

interface RecommendBody {
  category?: string;
  subcategory?: string;
  budget?: string;
  needs?: string[];
  detail?: string;
}

// Cap free-form input so the prompt stays bounded and prompt-injection surface is small.
const MAX_FIELD_LEN = 200;
const MAX_DETAIL_LEN = 500;
const MAX_NEEDS = 10;

function clean(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  // Strip control chars & collapse whitespace, then truncate.
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLen);
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
      ? body.needs.slice(0, MAX_NEEDS).map((n) => clean(n, MAX_FIELD_LEN)).filter(Boolean)
      : [];
    const detail = clean(body.detail, MAX_DETAIL_LEN);

    if (!category || !subcategory || !budget || needsArr.length === 0) {
      return res.status(400).json({
        error: 'Field "category", "subcategory", "budget", dan "needs" wajib diisi.',
      });
    }

    const prompt = `Carikan rekomendasi produk:
Kategori: ${category} - ${subcategory}
Budget: ${budget}
Kebutuhan: ${needsArr.join(', ')}
Detail: ${detail}

Balas HANYA JSON dengan struktur:
{
  "budget_warning": false,
  "budget_warning_message": "",
  "summary": "ringkasan 1-2 kalimat",
  "products": [
    {
      "rank": 1,
      "name": "Nama Produk Lengkap",
      "brand": "Brand",
      "price_min": "Rp X.XXX.XXX",
      "price_max": "Rp X.XXX.XXX",
      "is_bekas": false,
      "badge": "Best Value",
      "match_score": 85,
      "match_reason": "alasan spesifik cocok untuk kebutuhan user",
      "key_specs": ["spek1", "spek2", "spek3"],
      "pros": ["pro1", "pro2", "pro3"],
      "cons": ["con1", "con2"],
      "best_for": "cocok untuk siapa",
      "not_for": "tidak cocok untuk siapa",
      "tokopedia_url": "https://www.tokopedia.com/search?st=product&q=KEYWORD",
      "shopee_url": "https://shopee.co.id/product-name-i.SHOPID.ITEMID (link spesifik produk, BUKAN search link)",
      "whatsapp_text": "teks share whatsapp"
    }
  ],
  "tips": "tips pembelian spesifik",
  "alternative_suggestion": "saran kalau budget dinaikkan"
}
Kembalikan tepat 3 produk. You are IndoRecs, an expert product recommendation assistant for Indonesian consumers. Always respond ONLY in valid JSON, no markdown, no backticks. All products must be real and available in Indonesia. Respond in Bahasa Indonesia.`;

    const result = await generateJson(prompt);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Recommend error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    // Don't leak the full error to the client.
    const safe = message.startsWith('GEMINI_API_KEY') ? 'Server configuration error' : 'Failed to generate recommendations';
    return res.status(502).json({ error: safe });
  }
}
