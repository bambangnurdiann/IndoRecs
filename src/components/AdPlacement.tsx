import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { ExternalLink } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  placement: string;
  priority?: number;
}

interface AdPlacementProps {
  placement: 'right_sidebar' | 'top_banner' | 'inline' | 'sponsored';
  className?: string;
}

export function AdPlacement({ placement, className = "" }: AdPlacementProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetchAds();
  }, [placement]);

  const fetchAds = async () => {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, 'ads'),
        where('is_active', '==', true),
        where('placement', '==', placement),
        where('start_date', '<=', now)
      );
      
      const snapshot = await getDocs(q);
      const items: Ad[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Manual filter for end_date because Firestore doesn't support multiple inequality filters on different fields easily without composite indexes
        if (data.end_date.toDate() >= new Date()) {
          items.push({ id: doc.id, ...data } as Ad);
        }
      });

      if (items.length > 0) {
        setAds(items);
        // Random selection or priority based
        const selected = items[Math.floor(Math.random() * items.length)];
        setCurrentAd(selected);
      }
    } catch (error) {
      console.error(`Error fetching ${placement} ads:`, error);
    }
  };

  if (!currentAd) return null;

  const isSidebar = placement === 'right_sidebar';
  const isBanner = placement === 'top_banner';
  const isSponsored = placement === 'sponsored';

  return (
    <div className={`relative group overflow-hidden rounded-2xl border border-gray-100 bg-[#f9f9f9] ${className}`}>
      <a 
        href={currentAd.target_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full h-full"
      >
        <div className="relative">
          <img 
            src={currentAd.image_url} 
            alt={currentAd.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Ad Label */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className="px-2 py-0.5 bg-black/50 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest rounded-md">
              {isSponsored ? 'Sponsored' : 'Advertisement'}
            </span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <div className="bg-white p-2 rounded-full shadow-lg">
                <ExternalLink className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Ad Info (Optional for some placements) */}
        {!isBanner && (
          <div className="p-3">
            <p className="text-xs font-bold text-gray-900 line-clamp-1">{currentAd.title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{new URL(currentAd.target_url).hostname}</p>
          </div>
        )}
      </a>
    </div>
  );
}
