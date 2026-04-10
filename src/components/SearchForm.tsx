import React, { useState } from 'react';
import { Monitor, Shirt, Home, Sparkles, Dumbbell, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = [
  { id: 'Elektronik', icon: Monitor, sub: ['Smartphone', 'Laptop', 'Tablet', 'TWS/Earphone', 'Smartwatch', 'Kamera', 'TV'] },
  { id: 'Fashion', icon: Shirt, sub: ['Sepatu', 'Tas', 'Jaket', 'Jam Tangan', 'Baju Kasual'] },
  { id: 'Peralatan Rumah', icon: Home, sub: ['Vacuum Cleaner', 'Air Purifier', 'Blender', 'Rice Cooker', 'Dispenser'] },
  { id: 'Kecantikan', icon: Sparkles, sub: ['Skincare', 'Makeup', 'Parfum', 'Haircare'] },
  { id: 'Olahraga', icon: Dumbbell, sub: ['Sepatu Lari', 'Sepeda', 'Alat Gym', 'Outdoor Gear'] },
];

const BUDGET_PRESETS = [
  { label: 'Rp 500rb', value: 500000 },
  { label: 'Rp 1jt', value: 1000000 },
  { label: 'Rp 3jt', value: 3000000 },
  { label: 'Rp 5jt', value: 5000000 },
  { label: 'Rp 10jt', value: 10000000 },
];

const NEEDS = ['Gaming', 'Kerja', 'Sekolah', 'Traveling', 'Sehari-hari', 'Konten Kreator'];

interface SearchFormProps {
  onSubmit: (data: { category: string; subcategory: string; budget: string; needs: string[]; detail: string }) => void;
  isLoading: boolean;
}

export function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [budget, setBudget] = useState<number>(3000000);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [detail, setDetail] = useState('');

  const activeCategory = CATEGORIES.find(c => c.id === category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subcategory || selectedNeeds.length === 0) {
      alert('Mohon lengkapi kategori, subkategori, dan kebutuhan.');
      return;
    }
    
    onSubmit({
      category,
      subcategory,
      budget: `Rp ${budget.toLocaleString('id-ID')}`,
      needs: selectedNeeds,
      detail
    });
  };

  const toggleNeed = (need: string) => {
    setSelectedNeeds(prev => 
      prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-8">
      <div className="space-y-6">
        {/* Kategori */}
        <div className="space-y-3">
          <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider">Kategori</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setCategory(cat.id); setSubcategory(''); }}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left",
                  category === cat.id 
                    ? "border-green-600 bg-green-50 text-green-700" 
                    : "border-gray-100 hover:border-green-200 hover:bg-gray-50 text-gray-500"
                )}
              >
                <cat.icon className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-tight">{cat.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subkategori */}
        {activeCategory && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider">Jenis {activeCategory.id}</label>
            <div className="flex flex-wrap gap-1.5">
              {activeCategory.sub.map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubcategory(sub)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                    subcategory === sub
                      ? "bg-green-600 border-green-600 text-white"
                      : "bg-white border-gray-100 text-gray-600 hover:border-green-600 hover:text-green-600"
                  )}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        <hr className="border-gray-50" />

        {/* Budget */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider">Budget Maksimal</label>
            <span className="text-lg font-bold text-green-600">Rp {budget.toLocaleString('id-ID')}</span>
          </div>
          
          <div className="px-1">
            <input
              type="range"
              min="100000"
              max="30000000"
              step="100000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {BUDGET_PRESETS.map(preset => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setBudget(preset.value)}
                className={cn(
                  "px-2 py-1 text-[10px] font-bold rounded border transition-all",
                  budget === preset.value
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-gray-50" />

        {/* Kebutuhan */}
        <div className="space-y-3">
          <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider">Kebutuhan</label>
          <div className="flex flex-wrap gap-1.5">
            {NEEDS.map(need => (
              <button
                key={need}
                type="button"
                onClick={() => toggleNeed(need)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                  selectedNeeds.includes(need)
                    ? "bg-green-50 border-green-600 text-green-700"
                    : "bg-white border-gray-100 text-gray-500 hover:border-green-300"
                )}
              >
                {need}
              </button>
            ))}
          </div>
        </div>

        {/* Detail Tambahan */}
        <div className="space-y-3">
          <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider">Detail Tambahan</label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Contoh: Harus warna hitam, baterai awet..."
            className="w-full p-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none h-24 text-xs font-medium bg-gray-50/50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !category || !subcategory || selectedNeeds.length === 0}
        className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-green-100 text-xs font-bold uppercase tracking-widest text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        {isLoading ? (
          <span className="flex items-center">
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
            Memproses...
          </span>
        ) : (
          <span className="flex items-center">
            <Sparkles className="mr-2 h-4 w-4" />
            Cari Rekomendasi
          </span>
        )}
      </button>
    </form>
  );
}
