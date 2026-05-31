// src/lib/api.ts
// Thin client for our serverless endpoints. No secrets, no Node APIs here.
import { SearchResult } from '../types';

interface RecommendRequest {
  category: string;
  subcategory: string;
  budget: string;
  needs: string[];
  detail: string;
}

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError('Tidak dapat terhubung ke server. Cek koneksi internet Anda.', 0);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    // Plain `vite` (without `vercel dev`) returns the index.html for unknown routes.
    throw new ApiError(
      'Endpoint API tidak tersedia. Jalankan "vercel dev" untuk mengaktifkan fitur ini.',
      response.status,
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed (${response.status})`, response.status);
  }
  return data as T;
}

export function recommendProducts(input: RecommendRequest): Promise<SearchResult> {
  return postJson<SearchResult>('/api/recommend', input);
}

export function compareProducts(productNames: string[]): Promise<unknown> {
  return postJson<unknown>('/api/compare', { productNames });
}

export { ApiError };
