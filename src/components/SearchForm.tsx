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
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const activeCategory = CATEGORIES.find(c => c.id === category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subcategory || selectedNeeds.length === 0) {
      alert('Mohon lengkapi kategori, subkategori, dan kebutuhan.');
      return;
    }
    onSubmit({ category, subcategory, budget: `Rp ${budget.toLocaleString('id-ID')}`, needs: selectedNeeds, detail });
  };

  const toggleNeed = (need: string) => {
    setSelectedNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-3">
            {CATEGORIES.map(cat => (
              <button key={cat.id} type="button" onClick={() => { setCategory(cat.id); setSubcategory(''); }} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm font-medium", category === cat.id ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700")}>
                <cat.icon className="h-4 w-4" />
                <span>{cat.id}</span>
              </button>
            ))}
          </div>
          {activeCategory && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
              {activeCategory.sub.map(sub => (
                <button key={sub} type="button" onClick={() => setSubcategory(sub)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium border whitespace-nowrap transition-colors", subcategory === sub ? "bg-green-600 border-green-600 text-white" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500")}>
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors w-full">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            {selectedNeeds.length > 0 && (<span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded-full">{selectedNeeds.length}</span>)}
            {isFilterOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </button>
          {isFilterOpen && (
            <div className="pb-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-500 dark:text-gray-400">Budget Maksimal</label>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Rp {budget.toLocaleString('id-ID')}</span>
                  </div>
                  <input type="range" min="100000" max="30000000" step="100000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full" />
                  <div className="flex flex-wrap gap-1.5">
                    {BUDGET_PRESETS.map(preset => (
                      <button key={preset.value} type="button" onClick={() => setBudget(preset.value)} className={cn("px-2.5 py-1 text-sm rounded-lg border transition-colors", budget === preset.value ? "bg-green-600 border-green-600 text-white" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400")}>{preset.label}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Kebutuhan</label>
                  <div className="flex flex-wrap gap-2">
                    {NEEDS.map(need => (
                      <button key={need} type="button" onClick={() => toggleNeed(need)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors", selectedNeeds.includes(need) ? "bg-green-600 border-green-600 text-white" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400")}>{need}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Detail Tambahan</label>
                  <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Contoh: Butuh untuk kerja desain grafis, baterai tahan lama, layar minimal 15 inch..." className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none h-[88px] text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button type="submit" disabled={isLoading || !category || !subcategory || selectedNeeds.length === 0} className={cn("flex items-center justify-center px-8 py-3 rounded-xl text-sm font-semibold text-white shadow-sm transition-colors", isLoading || !category || !subcategory || selectedNeeds.length === 0 ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed" : "bg-green-600 hover:bg-green-700")}>
          {isLoading ? (<span className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" />Memproses...</span>) : (<span>Cari Rekomendasi</span>)}
        </button>
      </div>
    </form>
  );
}
