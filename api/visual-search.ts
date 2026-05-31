// api/visual-search.ts
// Visual product search - accepts image (Base64) and returns product recommendations.

type ApiRequest = { method?: string; body?: unknown };
type ApiResponse = { setHeader: (n:string,v:string)=>void; status: (c:number)=>ApiResponse; json: (b:unknown)=>unknown; end: ()=>unknown; };

import { GoogleGenAI } from '@google/genai';

interface VisualSearchBody {
  image?: string; // Base64
  mimeType?: string;
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
    const prompt = `Lihat gambar produk ini. Berikan rekomendasi 3 produk serupa yang tersedia di Indonesia.\n\nBalas HANYA JSON:{\"budget_warning\":false,\"budget_warning_message\":\"\",\"summary\":\"deskripsi singkat\",\"products\":[{\"rank\":1,\"name\":\"Nama Produk\",\"brand\":\"Brand\",\"price_min\":\"Rp X\",\"price_max\":\"Rp Y\",\"is_bekas\":false,\"badge\":\"Best Match\",\"match_score\":85,\"match_reason\":\"alasan\",\"key_specs\":[\"spek\"],\"pros\":[\"pro\"],\"cons\":[\"con\"],\"best_for\":\"cocok\",\"not_for\":\"tidak cocok\",\"tokopedia_url\":\"https://...\",\"shopee_url\":\"https://...\",\"whatsapp_text\":\"teks\"}],\"tips\":\"tips\",\"alternative_suggestion\":\"saran\"}\nRespond ONLY JSON, no markdown. Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt },
        { inlineData: { mimeType: body.mimeType || 'image/jpeg', data: body.image } }
      ],
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (!text) throw new Error('Empty response');
    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error('Visual search error:', error);
    return res.status(502).json({ error: 'Failed to process image' });
  }
}
