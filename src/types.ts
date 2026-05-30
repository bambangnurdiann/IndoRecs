export interface Product {
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
  tokopedia_url: string;
  shopee_url?: string; // Optional — Gemini kadang halusinasi URL ini, tidak dipakai untuk tombol
  whatsapp_text: string;
  /** Affiliate link yang di-generate client-side dari nama produk */
  affiliate_url: string;
}

export interface SearchResult {
  budget_warning: boolean;
  budget_warning_message: string;
  summary: string;
  products: Product[];
  tips: string;
  alternative_suggestion: string;
}

export interface SearchHistory {
  id: string;
  userId: string;
  category: string;
  subcategory: string;
  budget: string;
  needs: string[];
  detail: string;
  results: SearchResult;
  createdAt: any; // Firestore Timestamp
}

export interface WishlistItem {
  id: string;
  userId: string;
  product: Product;
  savedAt: any; // Firestore Timestamp
}
