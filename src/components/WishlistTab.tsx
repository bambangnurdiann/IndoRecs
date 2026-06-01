import React from 'react';
import { ProductCard } from './ProductCard';
import { Product, WishlistItem } from '../types';
import { generateShopeeAffiliateLink } from '../lib/affiliate';

interface WishlistTabProps {
  wishlist: WishlistItem[];
  compareList: Product[];
  onCompareToggle: (p: Product, sel: boolean) => void;
  onWishlistToggle: (p: Product) => void;
  onFeedback: (name: string, helpful: boolean) => void;
}

export function WishlistTab({ wishlist, compareList, onCompareToggle, onWishlistToggle, onFeedback }: WishlistTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wishlist Saya</h2>
      {wishlist.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada produk di wishlist.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(item => {
            // Inject affiliate_url karena tidak disimpan di Firestore
            const productWithAffiliate: Product = {
              ...item.product,
              affiliate_url: generateShopeeAffiliateLink(item.product.name),
            };
            return (
              <ProductCard
                key={item.id}
                product={productWithAffiliate}
                onCompareToggle={onCompareToggle}
                isCompared={compareList.some(p => p.name === item.product.name)}
                onWishlistToggle={onWishlistToggle}
                isWishlisted={true}
                onFeedback={onFeedback}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
