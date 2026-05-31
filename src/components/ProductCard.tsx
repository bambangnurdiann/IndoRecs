import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, Share2, Heart, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  onCompareToggle: (product: Product, isSelected: boolean) => void;
  isCompared: boolean;
  onWishlistToggle: (product: Product) => void | Promise<void>;
  isWishlisted: boolean;
  onFeedback: (productName: string, helpful: boolean) => void | Promise<void>;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product, onCompareToggle, isCompared, onWishlistToggle, isWishlisted, onFeedback,
}) => {
  const { user } = useAuth();
  const [showSpecs, setShowSpecs] = useState(false);

  const handleShare = (platform: 'wa' | 'twitter') => {
    const text = `Nemu rekomendasi ${product.name} di IndoRecs! 💰 ${product.price_min} ✅ Cocok untuk ${product.best_for} 🔗 ${window.location.href}`;
    if (platform === 'wa') window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    else window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{product.badge}</span>
              {product.is_bekas && <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">BEKAS</span>}
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{product.brand}</p>
          </div>
          <span className={cn("text-sm font-semibold flex-shrink-0", product.match_score >= 80 ? "text-green-600 dark:text-green-400" : product.match_score >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-500 dark:text-red-400")}>{product.match_score}% match</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-semibold text-gray-900 dark:text-white">{product.price_min}</span>
            <span className="text-sm text-gray-400 mx-1.5">-</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{product.price_max}</span>
          </div>
          <button onClick={() => { if (!user) { alert('Login untuk simpan ke wishlist'); return; } onWishlistToggle(product); }} className={cn("p-1.5 rounded-lg transition-colors", isWishlisted ? "text-red-500 bg-red-50 dark:bg-red-900/30" : "text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30")}>
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>
        </div>

        {/* Match Reason */}
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">“{product.match_reason}”</p>

        {/* Pros & Cons */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Kelebihan</h4>
            <ul className="space-y-1">
              {product.pros.slice(0, 3).map((pro, i) => (<li key={i} className="text-sm text-gray-500 dark:text-gray-400">{pro}</li>))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Kekurangan</h4>
            <ul className="space-y-1">
              {product.cons.slice(0, 3).map((con, i) => (<li key={i} className="text-sm text-gray-500 dark:text-gray-400">{con}</li>))}
            </ul>
          </div>
        </div>

        {/* Specs */}
        <div>
          <button onClick={() => setShowSpecs(!showSpecs)} className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            {showSpecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showSpecs ? 'Sembunyikan Spesifikasi' : 'Lihat Spesifikasi'}
          </button>
          {showSpecs && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.key_specs.map((spec, i) => (<span key={i} className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-500 dark:text-gray-400">{spec}</span>))}
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2 pt-1">
          <a href={product.tokopedia_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 text-[#00AA5B] text-sm font-medium rounded-lg border border-[#00AA5B]/30 hover:bg-[#00AA5B] hover:text-white transition-colors">
            <ShoppingBag className="w-3.5 h-3.5" />Tokopedia
          </a>
          <a href={product.affiliate_url || product.shopee_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 text-[#EE4D2D] text-sm font-medium rounded-lg border border-[#EE4D2D]/30 hover:bg-[#EE4D2D] hover:text-white transition-colors">
            <ShoppingBag className="w-3.5 h-3.5" />Shopee
          </a>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isCompared} onChange={(e) => onCompareToggle(product, e.target.checked)} className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500 cursor-pointer" />
            <span className="text-sm text-gray-400 dark:text-gray-500">Bandingkan</span>
          </label>
          <div className="flex items-center gap-2">
            <button onClick={() => handleShare('wa')} className="text-gray-300 dark:text-gray-600 hover:text-green-600 dark:hover:text-green-400 transition-colors"><Share2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => onFeedback(product.name, true)} className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
            <button onClick={() => onFeedback(product.name, false)} className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
