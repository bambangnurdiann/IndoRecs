import React, { useState } from 'react';
import { Monitor, Shirt, Home, Sparkles, Dumbbell, Loader2, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    <form onSubmit={handleSubmit} className="w-full">
      {/* Horizontal Category Tabs */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setCategory(cat.id); setSubcategory(''); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 text-sm font-semibold",
                  category === cat.id
                    ? "bg-green-600 text-white shadow-md shadow-green-200"
                    : "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700"
                )}
              >
                <cat.icon className="h-4 w-4" />
                <span>{cat.id}</span>
              </button>
            ))}
          </div>
          {activeCategory && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
              {activeCategory.sub.map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubcategory(sub)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all duration-200",
                    subcategory === sub
                      ? "bg-green-600 border-green-600 text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
                  )}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Advanced Filters */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 py-3 text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors w-full"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter Lanjutan</span>
            {selectedNeeds.length > 0 && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {selectedNeeds.length}
              </span>
            )}
            {isFilterOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </button>
          {isFilterOpen && (
            <div className="pb-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-gray-50/80 rounded-2xl border border-gray-100">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Budget Maksimal</label>
                    <span className="text-sm font-bold text-green-600">Rp {budget.toLocaleString('id-ID')}</span>
                  </div>
                  <input type="range" min="100000" max="30000000" step="100000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full" />
                  <div className="flex flex-wrap gap-1.5">
                    {BUDGET_PRESETS.map(preset => (
                      <button key={preset.value} type="button" onClick={() => setBudget(preset.value)} className={cn("px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all", budget === preset.value ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-200 text-gray-500 hover:border-green-400")}>
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kebutuhan</label>
                  <div className="flex flex-wrap gap-2">
                    {NEEDS.map(need => (
                      <button key={need} type="button" onClick={() => toggleNeed(need)} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200", selectedNeeds.includes(need) ? "bg-green-50 border-green-500 text-green-700 shadow-sm" : "bg-white border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600")}>
                        {need}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detail Tambahan</label>
                  <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Contoh: Harus warna hitam, baterai awet..." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none h-[88px] text-sm bg-white placeholder:text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Search Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button type="submit" disabled={isLoading || !category || !subcategory || selectedNeeds.length === 0} className={cn("flex items-center justify-center px-8 py-3.5 rounded-2xl text-sm font-bold text-white shadow-2xl transition-all duration-300 active:scale-95", isLoading || !category || !subcategory || selectedNeeds.length === 0 ? "bg-gray-300 cursor-not-allowed shadow-gray-200" : "bg-green-600 hover:bg-green-700 shadow-green-300/50 hover:shadow-green-400/60")}>
          {isLoading ? (
            <span className="flex items-center"><Loader2 className="animate-spin mr-2 h-4 w-4" />Memproses...</span>
          ) : (
            <span className="flex items-center"><Sparkles className="mr-2 h-4 w-4" />Cari Rekomendasi</span>
          )}
        </button>
      </div>
    </form>
  );
}
