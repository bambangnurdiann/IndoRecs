import React from 'react';
import { Product } from '../types';
import { CheckCircle2, XCircle, ShoppingBag, Share2, Heart, AlertTriangle, ThumbsUp, ThumbsDown, Target } from 'lucide-react';
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
  onFeedback 
}) => {
  const { user } = useAuth();

  const handleShare = (platform: 'wa' | 'twitter') => {
    const text = `Nemu rekomendasi ${product.name} di IndoRecs! 💰 ${product.price_min} ✅ Cocok untuk ${product.best_for} 🔗 ${window.location.href}`;
    if (platform === 'wa') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <div className="p-5 flex flex-col h-full space-y-4">
        {/* Badge & Wishlist */}
        <div className="flex justify-between items-start">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
              {product.badge}
            </span>
            {product.is_bekas && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-100">
                BEKAS
              </span>
            )}
          </div>
          <button 
            onClick={() => {
              if (!user) {
                alert("Login untuk simpan ke wishlist");
                return;
              }
              onWishlistToggle(product);
            }}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              isWishlisted ? "text-red-500 bg-red-50" : "text-gray-300 hover:text-red-500 hover:bg-red-50"
            )}
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <h3 className="text-[18px] font-semibold text-gray-900 leading-tight line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.brand}</p>
          <div className="pt-1">
            <span className="text-[16px] font-bold text-green-600">{product.price_min}</span>
            <span className="text-xs text-gray-400 mx-1">sd</span>
            <span className="text-sm font-semibold text-gray-700">{product.price_max}</span>
          </div>
        </div>

        {/* Match Score */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-medium text-gray-500">Match Score</span>
            <span className="text-[12px] font-bold text-green-600">{product.match_score}%</span>
          </div>
          <div className="relative w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="absolute top-0 left-0 bg-green-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${product.match_score}%` }}
            />
          </div>
          <p className="text-[12px] text-gray-500 italic line-clamp-2">&ldquo;{product.match_reason}&rdquo;</p>
        </div>

        <hr className="border-gray-50" />

        {/* Specs */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Spesifikasi</h4>
          <div className="flex flex-wrap gap-1.5">
            {product.key_specs.slice(0, 4).map((spec, i) => (
              <span key={i} className="px-2 py-1 bg-gray-50 rounded text-[11px] text-gray-600 font-medium">
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold text-green-600 uppercase tracking-wider flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Pros
            </h4>
            <ul className="space-y-1">
              {product.pros.slice(0, 3).map((pro, i) => (
                <li key={i} className="text-[12px] text-gray-600 leading-tight flex items-start">
                  <span className="text-green-400 mr-1">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold text-red-500 uppercase tracking-wider flex items-center">
              <XCircle className="w-3 h-3 mr-1" /> Cons
            </h4>
            <ul className="space-y-1">
              {product.cons.slice(0, 3).map((con, i) => (
                <li key={i} className="text-[12px] text-gray-500 leading-tight flex items-start">
                  <span className="text-red-300 mr-1">•</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Actions */}
        <div className="space-y-2 pt-4">
          <a 
            href={product.tokopedia_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center px-4 py-2.5 bg-[#00AA5B] text-white text-sm font-bold rounded-lg hover:bg-[#008f4c] transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Beli di Tokopedia
          </a>
          <a 
            href={product.shopee_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center px-4 py-2.5 bg-white text-[#EE4D2D] text-sm font-bold rounded-lg border border-[#EE4D2D] hover:bg-orange-50 transition-colors"
          >
            Cek di Shopee
          </a>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={isCompared}
                onChange={(e) => onCompareToggle(product, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
              />
              <span className="text-[12px] text-gray-500 group-hover:text-gray-700 transition-colors">Bandingkan</span>
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
    </div>
  );
}
