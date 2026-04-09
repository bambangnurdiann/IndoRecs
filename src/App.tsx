import React, { useState } from 'react';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { Search, ShoppingBag, ExternalLink, ThumbsUp, ThumbsDown, Loader2, Tag, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini API lazily to prevent crashes if env var is missing
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.error("Failed to initialize Gemini API", e);
}

interface ProductRec {
  name: string;
  price: string;
  match: string;
  pros: string[];
  cons: string[];
  shopee: string;
  tokopedia: string;
}

interface RecsResponse {
  recs: ProductRec[];
}

export default function App() {
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [needs, setNeeds] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<ProductRec[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !budget || !needs) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setRecommendations([]);

    if (!ai) {
      setError('GEMINI_API_KEY is missing. Please add it to your Vercel Environment Variables.');
      setLoading(false);
      return;
    }

    try {
      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          recs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.STRING },
                match: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                shopee: { type: Type.STRING },
                tokopedia: { type: Type.STRING },
              },
              required: ["name", "price", "match", "pros", "cons", "shopee", "tokopedia"],
            },
          },
        },
        required: ["recs"],
      };

      const prompt = `You are a product recommendation assistant for Indonesian users.
User Input:
- Category: ${category}
- Budget: Rp ${budget}
- Needs: ${needs}

Rules:
- Always return exactly 3 products
- Products must be real, available in Indonesia
- Prices must be realistic and within or near the user's budget
- First product = best value / main recommendation
- Sort by best match first
- Shopee and Tokopedia links must use the actual product name as search keyword (e.g., https://shopee.co.id/search?keyword=PRODUCT+NAME and https://www.tokopedia.com/search?st=product&q=PRODUCT+NAME)
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.7,
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text) as RecsResponse;
        setRecommendations(data.recs);
      } else {
        setError('Failed to generate recommendations. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-emerald-200">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-emerald-600" />
          <h1 className="text-xl font-bold tracking-tight text-gray-900">IndoRecs</h1>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-[350px_1fr] gap-8">
        {/* Sidebar Form */}
        <aside>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              Find Products
            </h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text" 
                  placeholder="e.g. Smartphone, Laptop, Shoes" 
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (IDR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-500">Rp</span>
                  <input 
                    type="text" 
                    placeholder="5.000.000" 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Needs</label>
                <textarea 
                  placeholder="e.g. Good camera for night photography, battery lasts all day" 
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all min-h-[100px] resize-y"
                  value={needs}
                  onChange={e => setNeeds(e.target.value)}
                  required
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Recommendations'}
              </button>
            </form>
          </div>
        </aside>

        {/* Results Area */}
        <div className="space-y-6">
          {!loading && recommendations.length === 0 && !error && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
              <ShoppingBag className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg">Tell us what you need to get started</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-emerald-600">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-lg font-medium animate-pulse">Analyzing the Indonesian market...</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group"
              >
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> BEST MATCH
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 pr-24">{rec.name}</h3>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 font-mono text-sm font-medium">
                      <Tag className="w-3 h-3" /> {rec.price}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="font-semibold text-gray-900">Why it fits:</span> {rec.match}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                      <ThumbsUp className="w-4 h-4 text-emerald-500" /> Pros
                    </h4>
                    <ul className="space-y-1.5">
                      {rec.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                      <ThumbsDown className="w-4 h-4 text-red-400" /> Cons
                    </h4>
                    <ul className="space-y-1.5">
                      {rec.cons.map((con, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span> {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <a 
                    href={rec.tokopedia} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#00AA5B] hover:bg-[#008f4c] text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Tokopedia <ExternalLink className="w-4 h-4" />
                  </a>
                  <a 
                    href={rec.shopee} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#EE4D2D] hover:bg-[#d74224] text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Shopee <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
