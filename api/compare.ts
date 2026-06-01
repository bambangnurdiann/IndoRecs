// api/compare.ts
// Server-side product comparison. Keeps GEMINI_API_KEY off the client.
type ApiRequest = { method?: string; body?: unknown };
type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponse;
  json: (body: unknown) => unknown;
  end: () => unknown;
};
import { generateJson } from './_lib/gemini';

interface CompareBody { productNames?: string[] }

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

    // Gunakan key index pendek agar Gemini tidak mengubah nama produk
    const scoreTemplate = names.reduce<Record<string, unknown>>((acc, _, i) => {
      acc[`p${i}`] = { score: 0, note: 'penjelasan singkat' };
      return acc;
    }, {});
    const verdictTemplate = names.reduce<Record<string, string>>((acc, _, i) => {
      acc[`p${i}`] = 'cocok untuk siapa';
      return acc;
    }, {});

    const productMapping = names.map((name, i) => `p${i} = "${name}"`).join(', ');

    const prompt = `Bandingkan produk berikut:
${names.map((name, i) => `p${i}: ${name}`).join('\n')}

Mapping key: ${productMapping}

Balas HANYA dengan JSON valid (tanpa markdown, tanpa backtick, tanpa komentar):
{
  "winner": "nama produk pemenang (nama lengkap asli, bukan key p0/p1/p2)",
  "winner_reason": "alasan singkat kenapa menang",
  "comparison": [
    { "aspect": "Performa", "scores": ${JSON.stringify(scoreTemplate)} },
    { "aspect": "Nilai Harga", "scores": ${JSON.stringify(scoreTemplate)} },
    { "aspect": "Build Quality", "scores": ${JSON.stringify(scoreTemplate)} },
    { "aspect": "Cocok untuk Kebutuhan", "scores": ${JSON.stringify(scoreTemplate)} },
    { "aspect": "Ketersediaan Servis", "scores": ${JSON.stringify(scoreTemplate)} }
  ],
  "verdict": ${JSON.stringify(verdictTemplate)}
}
Isi score dengan angka integer 1-10. Semua teks dalam Bahasa Indonesia.`;

    console.log('[compare] Sending request to Gemini for products:', names);

    const raw = await generateJson<any>(prompt);

    console.log('[compare] Gemini raw response keys:', Object.keys(raw ?? {}));

    // Remap key p0/p1/p2 kembali ke nama produk asli untuk frontend
    const remapped = {
      ...raw,
      comparison: Array.isArray(raw.comparison)
        ? raw.comparison.map((comp: any) => ({
            ...comp,
            scores: names.reduce<Record<string, unknown>>((acc, name, i) => {
              acc[name] = comp.scores?.[`p${i}`] ?? { score: '-', note: '-' };
              return acc;
            }, {}),
          }))
        : [],
      verdict: names.reduce<Record<string, string>>((acc, name, i) => {
        acc[name] = raw.verdict?.[`p${i}`] ?? '-';
        return acc;
      }, {}),
    };

    console.log('[compare] Remapped successfully, returning response');
    return res.status(200).json(remapped);

  } catch (error: any) {
    console.error('[compare] Error detail:', {
      message: error?.message,
      stack: error?.stack?.slice(0, 500),
    });

    const message: string = error?.message ?? 'Internal server error';

    let userMessage = 'Gagal membandingkan produk, coba lagi.';
    if (message.startsWith('GEMINI_API_KEY')) {
      userMessage = 'Server configuration error';
    } else if (message.includes('Empty response')) {
      userMessage = 'AI tidak dapat memproses permintaan ini. Coba dengan nama produk yang berbeda.';
    } else if (message.includes('non-JSON')) {
      userMessage = 'AI mengembalikan format yang tidak valid. Silakan coba lagi.';
    } else if (message.includes('API call failed')) {
      userMessage = 'Koneksi ke AI gagal. Periksa koneksi internet dan coba lagi.';
    }

    return res.status(502).json({ error: userMessage });
  }
}
