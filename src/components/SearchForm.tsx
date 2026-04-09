import React, { useState } from 'react';
import { Monitor, Shirt, Home, Sparkles, Dumbbell, Search } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
      {/* Kategori */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">Kategori Produk</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { setCategory(cat.id); setSubcategory(''); }}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border transition-all",
                category === cat.id 
                  ? "border-green-600 bg-green-50 text-green-700" 
                  : "border-gray-200 hover:border-green-300 hover:bg-gray-50 text-gray-600"
              )}
            >
              <cat.icon className="h-6 w-6 mb-2" />
              <span className="text-xs font-medium text-center">{cat.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subkategori */}
      {activeCategory && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <label className="block text-sm font-semibold text-gray-900">Pilih Jenis {activeCategory.id}</label>
          <div className="flex flex-wrap gap-2">
            {activeCategory.sub.map(sub => (
              <button
                key={sub}
                type="button"
                onClick={() => setSubcategory(sub)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                  subcategory === sub
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:border-green-600 hover:text-green-600"
                )}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Budget */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-gray-900">Budget Maksimal</label>
          <span className="text-green-600 font-bold">Rp {budget.toLocaleString('id-ID')}</span>
        </div>
        
        <input
          type="range"
          min="100000"
          max="30000000"
          step="100000"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
        />
        
        <div className="flex flex-wrap gap-2">
          {BUDGET_PRESETS.map(preset => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setBudget(preset.value)}
              className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kebutuhan */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">Untuk Kebutuhan Apa?</label>
        <div className="flex flex-wrap gap-2">
          {NEEDS.map(need => (
            <button
              key={need}
              type="button"
              onClick={() => toggleNeed(need)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                selectedNeeds.includes(need)
                  ? "bg-green-50 border-green-600 text-green-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-green-300"
              )}
            >
              {need}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Tambahan */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">Detail Tambahan (Opsional)</label>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Contoh: Harus warna hitam, baterai awet, atau merk tertentu..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-24 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !category || !subcategory || selectedNeeds.length === 0}
        className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <span className="flex items-center">
            <Search className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            Memproses...
          </span>
        ) : (
          <span className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5" />
            Cariin Rekomendasi ✦
          </span>
        )}
      </button>
    </form>
  );
}
