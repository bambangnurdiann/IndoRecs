import React, { useState, useEffect } from 'react';
import { SearchForm } from '../components/SearchForm';
import { ProductCard } from '../components/ProductCard';
import { WishlistTab } from '../components/WishlistTab';
import { HistoryTab } from '../components/HistoryTab';
import { SearchResult, Product, SearchHistory, WishlistItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AlertTriangle, ArrowRight, Loader2, X, Search } from 'lucide-react';
import { AdPlacement } from '../components/AdPlacement';
import { generateShopeeAffiliateLink } from '../lib/affiliate';
import toast from 'react-hot-toast';

export default function Home({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) {
  const { user, loginWithGoogle } = useAuth();
  const { wishlist, toggleWishlist, isWishlisted } = useWishlist(user?.uid);
  const { history, fetchHistory } = useSearchHistory(user?.uid);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Mencari produk terbaik...");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [streamedProducts, setStreamedProducts] = useState<Product[]>([]);

  useEffect(() => { if (!isLoading) return; const texts = ["Mencari produk terbaik...","Membandingkan harga...","Menyusun rekomendasi..."]; let i=0; const iv=setInterval(()=>{i=(i+1)%texts.length;setLoadingText(texts[i])},2000); return ()=>clearInterval(iv); }, [isLoading]);

  const handleSearch = async (formData: any, stream = false) => {
    setIsLoading(true); setResult(null); setCompareList([]); setStreamedProducts([]);
    try {
      const res = await fetch('/api/recommend', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...formData,stream}) });
      if (!res.ok) { const err=await res.json().catch(()=>({})); throw new Error(err.error||'Gagal mencari rekomendasi'); }

      if (stream) {
        // SSE streaming
        const reader = res.body?.getReader();
        if (!reader) throw new Error('Streaming tidak didukung');
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, {stream:true});
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.partial?.products) {
                  setStreamedProducts(parsed.partial.products);
                  if (parsed.partial.summary) {
                    setResult(prev => prev ? {...prev, summary:parsed.partial.summary, products:parsed.partial.products, tips:parsed.partial.tips||prev.tips, alternative_suggestion:parsed.partial.alternative_suggestion||prev.alternative_suggestion} : parsed.partial);
                  }
                }
              } catch { /* partial chunk */ }
            }
          }
        }
      } else {
        const data: SearchResult = await res.json();
        data.products = data.products.map(p => ({...p, affiliate_url: generateShopeeAffiliateLink(p.name)}));
        setResult(data);
        if (user) { const dr = await addDoc(collection(db,'searches'),{userId:user.uid,...formData,results:data,createdAt:serverTimestamp()}); setCurrentSearchId(dr.id); fetchHistory(); }
        else { setCurrentSearchId(null); }
      }
    } catch (e: any) { console.error(e); toast.error(e.message||'Terjadi kesalahan saat mencari rekomendasi.'); }
    finally { setIsLoading(false); }
  };

  const handleVisualSearch = async (imageBase64: string, mimeType: string) => {
    setIsLoading(true); setResult(null); setCompareList([]);
    try {
      const res = await fetch('/api/visual-search', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({image:imageBase64,mimeType}) });
      if (!res.ok) { const err=await res.json().catch(()=>({})); throw new Error(err.error||'Gagal memproses gambar'); }
      const data: SearchResult = await res.json();
      data.products = data.products.map(p => ({...p, affiliate_url: generateShopeeAffiliateLink(p.name)}));
      setResult(data);
      if (user) { const dr = await addDoc(collection(db,'searches'),{userId:user.uid,category:'Visual Search',subcategory:'Gambar',budget:'-',needs:[],detail:'Pencarian via gambar',results:data,createdAt:serverTimestamp()}); setCurrentSearchId(dr.id); fetchHistory(); }
    } catch (e: any) { console.error(e); toast.error(e.message||'Gagal memproses gambar'); }
    finally { setIsLoading(false); }
  };

  const handleCompareToggle = (p: Product, sel: boolean) => {
    if (sel && compareList.length>=3) { toast.error('Maksimal membandingkan 3 produk'); return; }
    setCompareList(sel ? [...compareList,p] : compareList.filter(x=>x.name!==p.name));
  };
  const handleCompare = async () => {
    if (compareList.length<2) return;
    setIsComparing(true); setShowCompareModal(true);
    try {
      const res = await fetch('/api/compare', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({productNames:compareList.map(p=>p.name)}) });
      if (!res.ok) { const err=await res.json().catch(()=>({})); throw new Error(err.error||'Gagal membandingkan'); }
      const data = await res.json(); setCompareResult(data);
    } catch (e: any) { console.error(e); toast.error(e.message); setShowCompareModal(false); }
    finally { setIsComparing(false); }
  };

  const handleFeedback = async (name: string, helpful: boolean) => {
    if (!user) { toast.error('Login untuk memberikan feedback'); return; }
    try { await addDoc(collection(db,'feedback'),{userId:user.uid,searchId:currentSearchId||'unknown',productName:name,helpful,createdAt:serverTimestamp()}); toast.success('Terima kasih atas feedback Anda!'); }
    catch (e) { console.error(e); }
  };

  const renderSkeleton = () => (
    <div className="space-y-8">
      <div className="text-center py-12"><Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" /><p className="text-base text-gray-500">{loadingText}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1,2,3].map(i => (<div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4 mb-4"></div><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-2"></div><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-6"></div><div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-full mb-4"></div><div className="space-y-2 mb-6"><div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full"></div></div><div className="h-10 bg-gray-100 dark:bg-gray-800 rounded w-full"></div></div>))}
      </div>
    </div>
  );

  const displayProducts = streamedProducts.length > 0 ? streamedProducts : result?.products || [];

  return (<>
    {activeTab === 'search' && <SearchForm onSubmit={handleSearch} isLoading={isLoading} onVisualSearch={handleVisualSearch} />}
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdPlacement placement="top_banner" className="mb-8 h-24 md:h-32" />
      {activeTab === 'search' && (<div className="space-y-8">
        {isLoading ? renderSkeleton() : result ? (<div className="space-y-8">
          {result.budget_warning && (<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4"><p className="text-sm text-yellow-700 dark:text-yellow-300">{result.budget_warning_message}</p></div>)}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Ringkasan Rekomendasi</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Berdasarkan kriteria yang Anda berikan</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.summary}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Tips Pembelian</h3><p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{result.tips}</p></div><div><h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Alternatif Budget</h3><p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{result.alternative_suggestion}</p></div></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayProducts.map((product, idx) => (<ProductCard key={idx} product={product} onCompareToggle={handleCompareToggle} isCompared={compareList.some(p => p.name === product.name)} onWishlistToggle={toggleWishlist} isWishlisted={isWishlisted(product.name)} onFeedback={handleFeedback} />))}
          </div>
        </div>) : (<div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Temukan Produk Terbaik untuk Kebutuhanmu</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">IndoRecs adalah platform rekomendasi produk berbasis AI untuk konsumen Indonesia. Kami membantu kamu menemukan produk terbaik — dari smartphone, laptop, skincare, hingga peralatan rumah tangga — yang sesuai dengan budget dan kebutuhan spesifik kamu.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Cukup pilih kategori produk di atas, tentukan budget maksimal, dan jelaskan kebutuhan. AI kami akan menganalisis dan memberikan <strong className="text-gray-700 dark:text-gray-200">3 rekomendasi terbaik</strong> lengkap dengan analisis kelebihan, kekurangan, spesifikasi, dan link langsung ke marketplace.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5"><p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">1. Pilih Kriteria</p><p className="text-sm text-gray-500 dark:text-gray-400">Tentukan kategori produk, budget, dan kebutuhan kamu.</p></div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5"><p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">2. AI Menganalisis</p><p className="text-sm text-gray-500 dark:text-gray-400">Google Gemini mencocokkan produk terbaik untuk kamu.</p></div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5"><p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">3. Belanja Cerdas</p><p className="text-sm text-gray-500 dark:text-gray-400">Dapatkan rekomendasi dan langsung beli di marketplace favorit.</p></div>
          </div>
        </div>)}
      </div>)}

      {activeTab === 'history' && (user ? <HistoryTab history={history} onSelect={(r) => { setResult(r); setActiveTab('search'); }} /> : (<div className="max-w-md mx-auto text-center py-16"><h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login untuk melihat Riwayat</h2><p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Masuk dengan akun Google untuk menyimpan dan melihat riwayat pencarian kamu.</p><button onClick={loginWithGoogle} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">Login dengan Google</button></div>))}
      {activeTab === 'wishlist' && (user ? <WishlistTab wishlist={wishlist} compareList={compareList} onCompareToggle={handleCompareToggle} onWishlistToggle={toggleWishlist} onFeedback={handleFeedback} /> : (<div className="max-w-md mx-auto text-center py-16"><h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login untuk melihat Wishlist</h2><p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Masuk dengan akun Google untuk menyimpan produk favorit kamu di wishlist.</p><button onClick={loginWithGoogle} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">Login dengan Google</button></div>))}
    </main>
    {compareList.length > 0 && (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{compareList.length} produk</span>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">{compareList.map(p => (<span key={p.name} className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded max-w-[120px] truncate">{p.name}</span>))}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCompareList([])} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Batal</button>
            <button onClick={handleCompare} disabled={compareList.length<2} className="px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">Bandingkan<ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    )}
    {showCompareModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Perbandingan Produk</h2>
            <button onClick={() => setShowCompareModal(false)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 overflow-y-auto">
            {isComparing ? (<div className="text-center py-12"><Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" /><p className="text-base text-gray-500 dark:text-gray-400">Menganalisis perbandingan...</p></div>) : compareResult ? (<div className="space-y-8">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pemenang</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{compareResult.winner}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{compareResult.winner_reason}</p>
              </div>
              <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr><th className="p-3 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400">Aspek</th>{compareList.map(p => (<th key={p.name} className="p-3 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white">{p.name}</th>))}</tr></thead>
                <tbody>{compareResult.comparison.map((comp: any, i: number) => (<tr key={i} className="border-b border-gray-100 dark:border-gray-700"><td className="p-3 text-sm text-gray-900 dark:text-white">{comp.aspect}</td>{compareList.map(p => (<td key={p.name} className="p-3"><span className="text-sm font-semibold text-green-600">{(comp.scores[p.name] || {score:'-'}).score}/10</span><p className="text-sm text-gray-500 dark:text-gray-400">{(comp.scores[p.name] || {note:'-'}).note}</p></td>))}</tr>))}</tbody></table></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Object.entries(compareResult.verdict).map(([name, verdict]: any) => (<div key={name} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"><h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{name}</h4><p className="text-sm text-gray-500 dark:text-gray-400">{verdict}</p></div>))}</div>
            </div>) : null}
          </div>
        </div>
      </div>
    )}
  </>);
}
