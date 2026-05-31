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
 * Call Gemini with a JSON-only response and parse it.
 * Throws on empty / unparseable output so the caller can return a 502.
 */
export async function generateJson<T = unknown>(prompt: string): Promise<T> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Empty response from Gemini.');
  }
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    throw new Error(`Gemini returned non-JSON output: ${text.slice(0, 200)}`);
  }
}
