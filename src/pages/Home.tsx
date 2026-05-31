import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SearchForm } from '../components/SearchForm';
import { ProductCard } from '../components/ProductCard';
import { SearchResult, Product, SearchHistory, WishlistItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { AlertTriangle, ArrowRight, Loader2, X, Search, Sparkles } from 'lucide-react';
import { AdPlacement } from '../components/AdPlacement';
import { generateShopeeAffiliateLink } from '../lib/affiliate';

// Initialize Gemini API lazily
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.error("Failed to initialize Gemini API", e);
}

export default function Home({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) {
  const { user } = useAuth();

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

  // Fetch History and Wishlist when user changes
  useEffect(() => {
    if (user) {
      fetchWishlist();
      fetchHistory();
    } else {
      setWishlist([]);
      setHistory([]);
    }
  }, [user]);

  // Loading text animation
  useEffect(() => {
    if (!isLoading) return;
    const texts = ["Mencari produk terbaik...", "Membandingkan harga...", "Menyusun rekomendasi..."];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'wishlist'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const items: WishlistItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as WishlistItem);
      });
      setWishlist(items);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'searches'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      const items: SearchHistory[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as SearchHistory);
      });
      setHistory(items);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleSearch = async (formData: any) => {
    if (!ai) {
      alert("Gemini API Key belum dikonfigurasi.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setCompareList([]);

    try {
      const prompt = `Carikan rekomendasi produk:
Kategori: ${formData.category} - ${formData.subcategory}
Budget: ${formData.budget}
Kebutuhan: ${formData.needs.join(', ')}
Detail: ${formData.detail}

Balas HANYA JSON dengan struktur:
{
  "budget_warning": false,
  "budget_warning_message": "",
  "summary": "ringkasan 1-2 kalimat",
  "products": [
    {
      "rank": 1,
      "name": "Nama Produk Lengkap",
      "brand": "Brand",
      "price_min": "Rp X.XXX.XXX",
      "price_max": "Rp X.XXX.XXX",
      "is_bekas": false,
      "badge": "Best Value",
      "match_score": 85,
      "match_reason": "alasan spesifik cocok untuk kebutuhan user",
      "key_specs": ["spek1", "spek2", "spek3"],
      "pros": ["pro1", "pro2", "pro3"],
      "cons": ["con1", "con2"],
      "best_for": "cocok untuk siapa",
      "not_for": "tidak cocok untuk siapa",
      "tokopedia_url": "https://www.tokopedia.com/search?st=product&q=KEYWORD",
      "shopee_url": "https://shopee.co.id/search?keyword=KEYWORD",
      "whatsapp_text": "teks share whatsapp"
    }
  ],
  "tips": "tips pembelian spesifik",
  "alternative_suggestion": "saran kalau budget dinaikkan"
}
Kembalikan tepat 3 produk. You are IndoRecs, an expert product recommendation assistant for Indonesian consumers. Always respond ONLY in valid JSON, no markdown, no backticks. All products must be real and available in Indonesia. Respond in Bahasa Indonesia.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");

      const parsedResult = JSON.parse(text) as SearchResult;

      // Generate affiliate links secara synchronous — tidak perlu API call!
      parsedResult.products = parsedResult.products.map((p) => ({
        ...p,
        affiliate_url: generateShopeeAffiliateLink(p.name),
      }));

      setResult(parsedResult);

      // Save to history if logged in
      if (user) {
        const docRef = await addDoc(collection(db, 'searches'), {
          userId: user.uid,
          ...formData,
          results: parsedResult,
          createdAt: serverTimestamp()
        });
        setCurrentSearchId(docRef.id);
        fetchHistory();
      } else {
        setCurrentSearchId(null);
      }

    } catch (error) {
      console.error("Search error:", error);
      alert("Terjadi kesalahan saat mencari rekomendasi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompareToggle = (product: Product, isSelected: boolean) => {
    if (isSelected) {
      if (compareList.length >= 3) {
        alert("Maksimal membandingkan 3 produk");
        return;
      }
      setCompareList([...compareList, product]);
    } else {
      setCompareList(compareList.filter(p => p.name !== product.name));
    }
  };

  const handleCompare = async () => {
    if (!ai || compareList.length < 2) return;
    setIsComparing(true);
    setShowCompareModal(true);

    try {
      const prompt = `Bandingkan produk berikut:
Produk: ${compareList.map(p => p.name).join(', ')}

Balas HANYA JSON:
{
  "winner": "nama produk pemenang",
  "winner_reason": "alasan singkat",
  "comparison": [
    {
      "aspect": "Performa",
      "scores": {
        "${compareList[0]?.name || 'P1'}": {"score": 8, "note": "penjelasan"},
        "${compareList[1]?.name || 'P2'}": {"score": 6, "note": "penjelasan"}
      }
    },
    {"aspect": "Nilai Harga", "scores": {}},
    {"aspect": "Build Quality", "scores": {}},
    {"aspect": "Cocok untuk Kebutuhan", "scores": {}},
    {"aspect": "Ketersediaan Servis", "scores": {}}
  ],
  "verdict": {
    "${compareList[0]?.name || 'P1'}": "cocok untuk siapa",
    "${compareList[1]?.name || 'P2'}": "cocok untuk siapa"
  }
}
Always respond ONLY in valid JSON, no markdown, no backticks. Respond in Bahasa Indonesia.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text;
      if (text) {
        setCompareResult(JSON.parse(text));
      }
    } catch (error) {
      console.error("Compare error:", error);
      setShowCompareModal(false);
    } finally {
      setIsComparing(false);
    }
  };

  const handleWishlistToggle = async (product: Product) => {
    if (!user) return;
    const existing = wishlist.find(w => w.product.name === product.name);

    if (existing) {
      await deleteDoc(doc(db, 'wishlist', existing.id));
      setWishlist(wishlist.filter(w => w.id !== existing.id));
    } else {
      const docRef = await addDoc(collection(db, 'wishlist'), {
        userId: user.uid,
        product,
        savedAt: serverTimestamp()
      });
      setWishlist([...wishlist, { id: docRef.id, userId: user.uid, product, savedAt: new Date() }]);
    }
  };

  const handleFeedback = async (productName: string, helpful: boolean) => {
    if (!user) {
      alert("Login untuk memberikan feedback");
      return;
    }
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        searchId: currentSearchId || 'unknown',
        productName,
        helpful,
        createdAt: serverTimestamp()
      });
      alert("Terima kasih atas feedback Anda!");
    } catch (error) {
      console.error("Feedback error:", error);
    }
  };

  // Pastikan produk dari history/wishlist juga punya affiliate_url
  const ensureAffiliateUrl = (product: Product): Product => {
    if (!product.affiliate_url) {
      return { ...product, affiliate_url: generateShopeeAffiliateLink(product.name) };
    }
    return product;
  };

  const renderSkeleton = () => (
    <div className="space-y-8">
      <div className="text-center py-8">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 animate-pulse">{loadingText}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
            <div className="space-y-2 mb-6">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Banner Ad */}
        <AdPlacement placement="top_banner" className="mb-8 h-24 md:h-32" />

        {!user && activeTab !== 'search' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Anda belum login. Login sekarang untuk menyimpan riwayat dan wishlist.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <aside className="w-full lg:w-[300px] lg:sticky lg:top-24 flex-shrink-0 space-y-6">
              <SearchForm onSubmit={handleSearch} isLoading={isLoading} />
              {/* Sidebar Ad */}
              <AdPlacement placement="right_sidebar" className="min-h-[250px]" />
            </aside>

            <div className="flex-1 min-w-0">
              {isLoading ? (
                renderSkeleton()
              ) : result ? (
                <div className="space-y-8">
                  {/* Sponsored Product Ad */}
                  <AdPlacement placement="sponsored" className="mb-8" />

                  {result.budget_warning && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">{result.budget_warning_message}</p>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Ringkasan Rekomendasi</h2>
                        <p className="text-sm text-gray-500 mt-1">Berdasarkan kriteria yang Anda berikan</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort by:</span>
                          <select className="text-xs font-bold text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer">
                            <option>Match Score Tertinggi</option>
                            <option>Harga Terendah</option>
                            <option>Best Value</option>
                          </select>
                        </div>
                        <label className="flex items-center space-x-2 text-xs font-bold text-gray-500 cursor-pointer hover:text-green-600 transition-colors">
                          <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                          <span>Produk Baru Only</span>
                        </label>
                      </div>
                    </div>
                    <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        <Sparkles className="inline-block w-4 h-4 mr-2 text-green-600 mb-1" />
                        {result.summary}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {result.products.map((product, idx) => (
                      <React.Fragment key={idx}>
                        <ProductCard
                          product={product}
                          onCompareToggle={handleCompareToggle}
                          isCompared={compareList.some(p => p.name === product.name)}
                          onWishlistToggle={handleWishlistToggle}
                          isWishlisted={wishlist.some(w => w.product.name === product.name)}
                          onFeedback={handleFeedback}
                        />
                        {/* Inline Ad after 2nd product */}
                        {idx === 1 && (
                          <div className="md:col-span-2 xl:col-span-1">
                            <AdPlacement placement="inline" className="h-full min-h-[300px]" />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 shadow-sm shadow-blue-50">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-black text-blue-900 uppercase tracking-wider text-xs">Tips Pembelian</h3>
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed font-medium">{result.tips}</p>
                    </div>
                    <div className="bg-purple-50/50 rounded-2xl p-6 border border-purple-100 shadow-sm shadow-purple-50">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-black text-purple-900 uppercase tracking-wider text-xs">Alternatif Budget</h3>
                      </div>
                      <p className="text-sm text-purple-800 leading-relaxed font-medium">{result.alternative_suggestion}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-gray-100 border-dashed">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Mulai Pencarian</h3>
                  <p className="text-gray-500 max-w-md">Isi form di sebelah kiri untuk mendapatkan rekomendasi produk terbaik yang disesuaikan dengan kebutuhan dan budget Anda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && user && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Riwayat Pencarian</h2>
            {history.length === 0 ? (
              <p className="text-gray-500">Belum ada riwayat pencarian.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map(item => (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-green-300 transition-colors"
                    onClick={() => { setResult(item.results); setActiveTab('search'); }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">{item.category}</span>
                      <span className="text-xs text-gray-400">{new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleDateString('id-ID')}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.subcategory}</h3>
                    <p className="text-sm text-gray-500 mb-2">Budget: {item.budget}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{item.results.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && user && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Wishlist Saya</h2>
            {wishlist.length === 0 ? (
              <p className="text-gray-500">Belum ada produk di wishlist.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(item => (
                  <ProductCard
                    key={item.id}
                    product={ensureAffiliateUrl(item.product)}
                    onCompareToggle={handleCompareToggle}
                    isCompared={compareList.some(p => p.name === item.product.name)}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={true}
                    onFeedback={handleFeedback}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-40 animate-in slide-in-from-bottom-full duration-300">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              <div className="flex-shrink-0 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                {compareList.length}
              </div>
              <span className="font-bold text-gray-900 text-sm hidden xs:block">Produk dipilih</span>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {compareList.map(p => (
                  <span key={p.name} className="flex-shrink-0 text-[10px] font-bold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg max-w-[100px] truncate text-gray-600">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setCompareList([])}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCompare}
                disabled={compareList.length < 2}
                className="flex-[2] sm:flex-none px-6 py-2.5 bg-green-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-green-100 transition-all active:scale-95"
              >
                Bandingkan <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Perbandingan Produk</h2>
              <button onClick={() => setShowCompareModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {isComparing ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">Menganalisis perbandingan...</p>
                </div>
              ) : compareResult ? (
                <div className="space-y-8">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                    <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-1">Pemenang Keseluruhan</h3>
                    <p className="text-2xl font-extrabold text-green-900 mb-2">{compareResult.winner}</p>
                    <p className="text-green-700 text-sm">{compareResult.winner_reason}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="p-3 border-b-2 border-gray-200 bg-gray-50 font-semibold text-gray-600">Aspek</th>
                          {compareList.map(p => (
                            <th key={p.name} className="p-3 border-b-2 border-gray-200 bg-gray-50 font-bold text-gray-900 w-1/3">{p.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {compareResult.comparison.map((comp: any, i: number) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-900">{comp.aspect}</td>
                            {compareList.map(p => {
                              const scoreData = comp.scores[p.name] || { score: '-', note: '-' };
                              return (
                                <td key={p.name} className="p-3">
                                  <div className="flex items-center mb-1">
                                    <span className="font-bold text-green-600 mr-2">{scoreData.score}/10</span>
                                  </div>
                                  <p className="text-xs text-gray-600">{scoreData.note}</p>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(compareResult.verdict).map(([productName, verdict]: any) => (
                      <div key={productName} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-1">{productName}</h4>
                        <p className="text-sm text-gray-600">{verdict}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
