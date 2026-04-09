import React from 'react';
import { Product } from '../types';
import { CheckCircle2, XCircle, ShoppingBag, Share2, Heart, AlertTriangle } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {product.badge}
              </span>
              {product.is_bekas && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  BEKAS
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.brand}</p>
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
              "p-2 rounded-full transition-colors",
              isWishlisted ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500 hover:bg-red-50"
            )}
          >
            <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
          </button>
        </div>

        {/* Price & Match Score */}
        <div className="mb-5">
          <div className="text-xl font-extrabold text-gray-900 mb-2">
            {product.price_min} <span className="text-sm font-normal text-gray-500">sd</span> {product.price_max}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-600">Match Score</span>
              <span className="text-green-600">{product.match_score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${product.match_score}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 italic">"{product.match_reason}"</p>
          </div>
        </div>

        {/* Specs & Pros/Cons */}
        <div className="space-y-4 mb-6">
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Spesifikasi Utama</h4>
            <ul className="space-y-1">
              {product.key_specs.map((spec, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start">
                  <span className="mr-2 text-gray-400">•</span>
                  {spec}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Kelebihan
              </h4>
              <ul className="space-y-1">
                {product.pros.map((pro, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start">
                    <span className="mr-1 text-green-500">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center">
                <XCircle className="w-3 h-3 mr-1" /> Kekurangan
              </h4>
              <ul className="space-y-1">
                {product.cons.map((con, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start">
                    <span className="mr-1 text-red-500">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <div className="mb-1"><span className="font-semibold text-gray-900">Best for:</span> <span className="text-gray-700">{product.best_for}</span></div>
            <div><span className="font-semibold text-gray-900">Not for:</span> <span className="text-gray-700">{product.not_for}</span></div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <a 
              href={product.tokopedia_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center px-4 py-2 bg-[#00AA5B] text-white text-sm font-semibold rounded-lg hover:bg-[#008f4c] transition-colors"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Tokopedia
            </a>
            <a 
              href={product.shopee_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center px-4 py-2 bg-[#EE4D2D] text-white text-sm font-semibold rounded-lg hover:bg-[#d74224] transition-colors"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shopee
            </a>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isCompared}
                onChange={(e) => onCompareToggle(product, e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-600">Bandingkan</span>
            </label>

            <div className="flex items-center gap-2">
              <button onClick={() => handleShare('wa')} className="p-1.5 text-gray-400 hover:text-green-600 transition-colors" title="Share WhatsApp">
                <Share2 className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-gray-200 mx-1"></div>
              <button onClick={() => onFeedback(product.name, true)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Membantu">
                👍
              </button>
              <button onClick={() => onFeedback(product.name, false)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Kurang Relevan">
                👎
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
