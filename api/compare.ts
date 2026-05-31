// api/compare.ts
// Server-side product comparison. Keeps GEMINI_API_KEY off the client.
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

interface CompareBody {
  productNames?: string[];
}

const MAX_NAME_LEN = 200;
const MIN_PRODUCTS = 2;
const MAX_PRODUCTS = 3;

function clean(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = (req.body ?? {}) as CompareBody;

    const names = Array.isArray(body.productNames)
      ? body.productNames.map((n) => clean(n, MAX_NAME_LEN)).filter(Boolean)
      : [];

    if (names.length < MIN_PRODUCTS || names.length > MAX_PRODUCTS) {
      return res.status(400).json({
        error: `Field "productNames" harus berisi ${MIN_PRODUCTS}-${MAX_PRODUCTS} nama produk.`,
      });
    }

    // Build score templates for each product so Gemini knows the exact keys to use.
    const scoreTemplate = names.reduce<Record<string, unknown>>((acc, name) => {
      acc[name] = { score: 0, note: 'penjelasan' };
      return acc;
    }, {});
    const verdictTemplate = names.reduce<Record<string, string>>((acc, name) => {
      acc[name] = 'cocok untuk siapa';
      return acc;
    }, {});

    const prompt = `Bandingkan produk berikut:
Produk: ${names.join(', ')}

Balas HANYA JSON:
{
  "winner": "nama produk pemenang",
  "winner_reason": "alasan singkat",
  "comparison": [
    { "aspect": "Performa", "scores": ${JSON.stringify(scoreTemplate)} },
    { "aspect": "Nilai Harga", "scores": ${JSON.stringify(scoreTemplate)} },
    { "aspect": "Build Quality", "scores": ${JSON.stringify(scoreTemplate)} },
    { "aspect": "Cocok untuk Kebutuhan", "scores": ${JSON.stringify(scoreTemplate)} },
    { "aspect": "Ketersediaan Servis", "scores": ${JSON.stringify(scoreTemplate)} }
  ],
  "verdict": ${JSON.stringify(verdictTemplate)}
}
Always respond ONLY in valid JSON, no markdown, no backticks. Respond in Bahasa Indonesia.`;

    const result = await generateJson(prompt);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Compare error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const safe = message.startsWith('GEMINI_API_KEY') ? 'Server configuration error' : 'Failed to compare products';
    return res.status(502).json({ error: safe });
  }
}
