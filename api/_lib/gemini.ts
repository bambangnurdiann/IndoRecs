// api/_lib/gemini.ts
// Server-side Gemini client. The API key never reaches the browser.
import { GoogleGenAI } from '@google/genai';

export const GEMINI_MODEL = 'gemini-2.5-flash';

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  client = new GoogleGenAI({ apiKey });
  return client;
}

/**
 * Strip markdown code fences jika Gemini membungkus JSON dengan ```json ... ```
 */
export function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

/**
 * Call Gemini dengan JSON-only response dan parse hasilnya.
 */
export async function generateJson<T = unknown>(prompt: string): Promise<T> {
  const ai = getGeminiClient();

  let response: Awaited<ReturnType<typeof ai.models.generateContent>>;
  try {
    response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
  } catch (err: any) {
    throw new Error(`Gemini API call failed: ${err?.message ?? String(err)}`);
  }

  const rawText: string | undefined = response.text;
  if (!rawText || rawText.trim() === '') {
    throw new Error('Empty response from Gemini — model may have blocked the request.');
  }

  const cleaned = extractJson(rawText);

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Gemini returned non-JSON output: ${cleaned.slice(0, 300)}`);
  }
}
