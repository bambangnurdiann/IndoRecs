import React, { useState } from 'react';
import { Product } from '../types';
import { CheckCircle2, XCircle, ShoppingBag, Share2, Heart, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
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
  product,
  onCompareToggle,
  isCompared,
  onWishlistToggle,
  isWishlisted,
  onFeedback,
}) => {
  const { user } = useAuth();
  const [showSpecs, setShowSpecs] = useState(false);

  const handleShare = (platform: 'wa' | 'twitter') => {
    const text = `Nemu rekomendasi ${product.name} di IndoRecs! 💰 ${product.price_min} ✅ Cocok untuk ${product.best_for} 🔗 ${window.location.href}`;
    if (platform === 'wa') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const scoreColor = product.match_score >= 80 ? 'text-green-600' : product.match_score >= 60 ? 'text-yellow-600' : 'text-red-500';
  const scoreBg = product.match_score >= 80 ? 'bg-green-50 border-green-200' : product.match_score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
  const progressColor = product.match_score >= 80 ? '#22c55e' : product.match_score >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
      <div className="p-5 space-y-4">
        {/* Header: Name, Brand, Badge, Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                {product.badge}
              </span>
              {product.is_bekas && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-100">
                  BEKAS
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-400 mt-0.5">{product.brand}</p>
          </div>
          {/* Radial Match Score */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="radial-progress" style={{ '--progress': product.match_score, '--progress-color': progressColor } as React.CSSProperties}>
              <span className={cn("text-xs font-bold", scoreColor)}>{product.match_score}%</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Match</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-gray-900">{product.price_min}</span>
            <span className="text-xs text-gray-400 mx-1.5">-</span>
            <span className="text-sm font-semibold text-gray-500">{product.price_max}</span>
          </div>
          <button
            onClick={() => { if (!user) { alert('Login untuk simpan ke wishlist'); return; } onWishlistToggle(product); }}
            className={cn("p-2 rounded-full transition-all duration-200", isWishlisted ? "text-red-500 bg-red-50" : "text-gray-300 hover:text-red-500 hover:bg-red-50")}
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>
        </div>

        {/* Match Reason */}
        <p className="text-xs text-gray-500 italic leading-relaxed border-l-2 border-green-200 pl-3">“{product.match_reason}”</p>

        {/* Pros & Cons - 2 Column Layout */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Kelebihan
            </h4>
            <ul className="space-y-1">
              {product.pros.slice(0, 3).map((pro, i) => (
                <li key={i} className="text-xs text-gray-600 leading-snug flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Kekurangan
            </h4>
            <ul className="space-y-1">
              {product.cons.slice(0, 3).map((con, i) => (
                <li key={i} className="text-xs text-gray-500 leading-snug flex items-start gap-1.5">
                  <XCircle className="w-3 h-3 text-red-300 flex-shrink-0 mt-0.5" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Expandable Specs */}
        <div>
          <button
            onClick={() => setShowSpecs(!showSpecs)}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-green-600 transition-colors"
          >
            {showSpecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showSpecs ? 'Sembunyikan Spesifikasi' : 'Lihat Spesifikasi'}
          </button>
          {showSpecs && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.key_specs.map((spec, i) => (
                <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[11px] text-gray-600 font-medium">
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CTA Buttons - Side by Side with Brand Colors */}
        <div className="flex gap-2 pt-2">
          <a
            href={product.tokopedia_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center px-3 py-2.5 bg-white text-[#00AA5B] text-xs font-bold rounded-xl border-2 border-[#00AA5B] hover:bg-[#00AA5B] hover:text-white transition-all duration-200"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            Tokopedia
          </a>
          <a
            href={product.affiliate_url || product.shopee_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center px-3 py-2.5 bg-white text-[#EE4D2D] text-xs font-bold rounded-xl border-2 border-[#EE4D2D] hover:bg-[#EE4D2D] hover:text-white transition-all duration-200"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            Shopee
          </a>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={isCompared}
              onChange={(e) => onCompareToggle(product, e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
            />
            <span className="text-[11px] text-gray-500 group-hover:text-gray-700 transition-colors">Bandingkan</span>
          </label>
          <div className="flex items-center gap-1">
            <button onClick={() => handleShare('wa')} className="p-1.5 text-gray-400 hover:text-green-600 transition-colors" title="Share">
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onFeedback(product.name, true)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onFeedback(product.name, false)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
