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
  blibli_url: string;
  shopee_url: string;
  whatsapp_text: string;
  affiliate_url?: string;
  blibli_affiliate_url?: string;
  community_verified?: boolean;
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
  createdAt: any;
}

export interface WishlistItem {
  id: string;
  userId: string;
  product: Product;
  savedAt: any;
}
