import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SearchForm } from '../components/SearchForm';
import { ProductCard } from '../components/ProductCard';
import { SearchResult, Product, SearchHistory, WishlistItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { AlertTriangle, ArrowRight, Loader2, X, Search } from 'lucide-react';
import { AdPlacement } from '../components/AdPlacement';
import { generateShopeeAffiliateLink } from '../lib/affiliate';

let ai: GoogleGenAI | null = null;
try { if (process.env.GEMINI_API_KEY) { ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); } }
catch (e) { console.error("Failed to initialize Gemini API", e); }

export default function Home({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) {
  const { user, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Mencari produk terbaik...");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>([]);

  useEffect(() => { if (user) { fetchWishlist(); fetchHistory(); } else { setWishlist([]); setHistory([]); } }, [user]);
  useEffect(() => { if (!isLoading) return; const texts = ["Mencari produk terbaik...", "Membandingkan harga...", "Menyusun rekomendasi..."]; let i = 0; const interval = setInterval(() => { i = (i + 1) % texts.length; setLoadingText(texts[i]); }, 2000); return () => clearInterval(interval); }, [isLoading]);

  const fetchWishlist = async () => { if (!user) return; try { const q = query(collection(db, 'wishlist'), where('userId', '==', user.uid)); const snap = await getDocs(q); const items: WishlistItem[] = []; snap.forEach(d => items.push({ id: d.id, ...d.data() } as WishlistItem)); setWishlist(items); } catch (e) { console.error(e); } };
  const fetchHistory = async () => { if (!user) return; try { const q = query(collection(db, 'searches'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(20)); const snap = await getDocs(q); const items: SearchHistory[] = []; snap.forEach(d => items.push({ id: d.id, ...d.data() } as SearchHistory)); setHistory(items); } catch (e) { console.error(e); } };

  const handleSearch = async (formData: any) => {
    if (!ai) { alert("Gemini API Key belum dikonfigurasi."); return; }
    setIsLoading(true); setResult(null); setCompareList([]);
    try {
      const prompt = `Carikan rekomendasi produk:
Kategori: ${formData.category} - ${formData.subcategory}
Budget: ${formData.budget}
Kebutuhan: ${formData.needs.join(', ')}
Detail: ${formData.detail}

Balas HANYA JSON dengan struktur:
{"budget_warning":false,"budget_warning_message":"","summary":"ringkasan 1-2 kalimat","products":[{"rank":1,"name":"Nama Produk Lengkap","brand":"Brand","price_min":"Rp X.XXX.XXX","price_max":"Rp X.XXX.XXX","is_bekas":false,"badge":"Best Value","match_score":85,"match_reason":"alasan spesifik cocok untuk kebutuhan user","key_specs":["spek1"],"pros":["pro1"],"cons":["con1"],"best_for":"cocok untuk siapa","not_for":"tidak cocok untuk siapa","tokopedia_url":"https://www.tokopedia.com/search?st=product&q=KEYWORD","shopee_url":"https://shopee.co.id/product-name-i.SHOPID.ITEMID","whatsapp_text":"teks share"}],"tips":"tips pembelian spesifik","alternative_suggestion":"saran kalau budget dinaikkan"}
Kembalikan tepat 3 produk. You are IndoRecs, an expert product recommendation assistant for Indonesian consumers. Always respond ONLY in valid JSON, no markdown, no backticks. All products must be real and available in Indonesia. Respond in Bahasa Indonesia.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: "application/json" } });
      const text = response.text; if (!text) throw new Error("Empty response");
      const parsedResult = JSON.parse(text) as SearchResult;
      parsedResult.products = parsedResult.products.map(p => ({ ...p, affiliate_url: generateShopeeAffiliateLink(p.name) }));
      setResult(parsedResult);
      if (user) { const docRef = await addDoc(collection(db, 'searches'), { userId: user.uid, ...formData, results: parsedResult, createdAt: serverTimestamp() }); setCurrentSearchId(docRef.id); fetchHistory(); }
      else { setCurrentSearchId(null); }
    } catch (e) { console.error(e); alert("Terjadi kesalahan saat mencari rekomendasi."); }
    finally { setIsLoading(false); }
  };

  const handleCompareToggle = (p: Product, sel: boolean) => { if (sel) { if (compareList.length >= 3) { alert("Maksimal 3"); return; } setCompareList([...compareList, p]); } else setCompareList(compareList.filter(x => x.name !== p.name)); };
  const handleCompare = async () => { if (!ai || compareList.length < 2) return; setIsComparing(true); setShowCompareModal(true); try { const prompt = `Bandingkan produk: ${compareList.map(p => p.name).join(', ')}
Balas HANYA JSON: {"winner":"...","winner_reason":"...","comparison":[{"aspect":"Performa","scores":{}}],"verdict":{}}
Respond in Bahasa Indonesia.`; const resp = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: "application/json" } }); const t = resp.text; if (t) setCompareResult(JSON.parse(t)); } catch (e) { console.error(e); setShowCompareModal(false); } finally { setIsComparing(false); } };
  const handleWishlistToggle = async (p: Product) => { if (!user) return; const ex = wishlist.find(w => w.product.name === p.name); if (ex) { await deleteDoc(doc(db, 'wishlist', ex.id)); setWishlist(wishlist.filter(w => w.id !== ex.id)); } else { const dr = await addDoc(collection(db, 'wishlist'), { userId: user.uid, product: p, savedAt: serverTimestamp() }); setWishlist([...wishlist, { id: dr.id, userId: user.uid, product: p, savedAt: new Date() }]); } };
  const handleFeedback = async (name: string, helpful: boolean) => { if (!user) { alert("Login dulu"); return; } try { await addDoc(collection(db, 'feedback'), { userId: user.uid, searchId: currentSearchId || 'unknown', productName: name, helpful, createdAt: serverTimestamp() }); alert("Terima kasih!"); } catch (e) { console.error(e); } };

  const renderSkeleton = () => (
    <div className="space-y-8">
      <div className="text-center py-12"><Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" /><p className="text-base text-gray-500">{loadingText}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1,2,3].map(i => (<div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4 mb-4"></div><div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-2"></div><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-6"></div><div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-full mb-4"></div><div className="space-y-2 mb-6"><div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full"></div></div><div className="h-10 bg-gray-100 dark:bg-gray-800 rounded w-full"></div></div>))}
      </div>
    </div>
  );

  return (<>
    {activeTab === 'search' && <SearchForm onSubmit={handleSearch} isLoading={isLoading} />}
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdPlacement placement="top_banner" className="mb-8 h-24 md:h-32" />
      {activeTab === 'search' && (<div className="space-y-8">
        {isLoading ? renderSkeleton() : result ? (<div className="space-y-8">
          {result.budget_warning && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">{result.budget_warning_message}</p>
            </div>
          )}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Ringkasan Rekomendasi</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Berdasarkan kriteria yang Anda berikan</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.summary}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Tips Pembelian</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{result.tips}</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Alternatif Budget</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{result.alternative_suggestion}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {result.products.map((product, idx) => (<ProductCard key={idx} product={product} onCompareToggle={handleCompareToggle} isCompared={compareList.some(p => p.name === product.name)} onWishlistToggle={handleWishlistToggle} isWishlisted={wishlist.some(w => w.product.name === product.name)} onFeedback={handleFeedback} />))}
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

      {activeTab === 'history' && (user ? (<div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Pencarian</h2>
        {history.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada riwayat pencarian.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors" onClick={() => { setResult(item.results); setActiveTab('search'); }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.category}</span>
                  <span className="text-sm text-gray-400 dark:text-gray-500">{new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleDateString('id-ID')}</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{item.subcategory}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Budget: {item.budget}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.results.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>) : (
        <div className="max-w-md mx-auto text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login untuk melihat Riwayat</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Masuk dengan akun Google untuk menyimpan dan melihat riwayat pencarian kamu.</p>
          <button onClick={loginWithGoogle} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">Login dengan Google</button>
        </div>
      ))}
      {activeTab === 'wishlist' && (user ? (<div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wishlist Saya</h2>
        {wishlist.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada produk di wishlist.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map(item => (<ProductCard key={item.id} product={item.product} onCompareToggle={handleCompareToggle} isCompared={compareList.some(p => p.name === item.product.name)} onWishlistToggle={handleWishlistToggle} isWishlisted={true} onFeedback={handleFeedback} />))}
          </div>
        )}
      </div>) : (
        <div className="max-w-md mx-auto text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login untuk melihat Wishlist</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Masuk dengan akun Google untuk menyimpan produk favorit kamu di wishlist.</p>
          <button onClick={loginWithGoogle} className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">Login dengan Google</button>
        </div>
      ))}
    </main>
    {compareList.length > 0 && (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{compareList.length} produk</span>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {compareList.map(p => (<span key={p.name} className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded max-w-[120px] truncate">{p.name}</span>))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCompareList([])} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Batal</button>
            <button onClick={handleCompare} disabled={compareList.length < 2} className="px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">Bandingkan<ArrowRight className="w-4 h-4" /></button>
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
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse"><thead><tr><th className="p-3 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400">Aspek</th>{compareList.map(p => (<th key={p.name} className="p-3 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white">{p.name}</th>))}</tr></thead>
                  <tbody>{compareResult.comparison.map((comp: any, i: number) => (<tr key={i} className="border-b border-gray-100 dark:border-gray-700"><td className="p-3 text-sm text-gray-900 dark:text-white">{comp.aspect}</td>{compareList.map(p => { const s = comp.scores[p.name] || { score: '-', note: '-' }; return (<td key={p.name} className="p-3"><span className="text-sm font-semibold text-green-600">{s.score}/10</span><p className="text-sm text-gray-500 dark:text-gray-400">{s.note}</p></td>); })}</tr>))}</tbody></table>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(compareResult.verdict).map(([name, verdict]: any) => (<div key={name} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"><h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{name}</h4><p className="text-sm text-gray-500 dark:text-gray-400">{verdict}</p></div>))}
              </div>
            </div>) : null}
          </div>
        </div>
      </div>
    )}
  </>);
}
