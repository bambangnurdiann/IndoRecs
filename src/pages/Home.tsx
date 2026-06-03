import React, { useState, useEffect } from 'react';
import { SearchForm } from '../components/SearchForm';
import { ProductCard } from '../components/ProductCard';
import { WishlistTab } from '../components/WishlistTab';
import { HistoryTab } from '../components/HistoryTab';
import { SearchResult, Product, WishlistItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, ArrowRight, X } from 'lucide-react';
import { AdPlacement } from '../components/AdPlacement';
import { generateShopeeAffiliateLink } from '../lib/affiliate';
import toast from 'react-hot-toast';

/**
 * Inject Shopee affiliate URLs client-side.
 */
function injectAffiliateUrls(data) {
  return {
    ...data,
    products: data.products.map(function(p) {
      return {
        ...p,
        affiliate_url: generateShopeeAffiliateLink(p.name),
      };
    }),
  };
}

export default function Home(_a) {
  var activeTab=_a.activeTab, setActiveTab=_a.setActiveTab;
  var _b=useAuth(), user=_b.user, loginWithGoogle=_b.loginWithGoogle;
  var _c=useWishlist(user?user.uid:undefined), wishlist=_c.wishlist, toggleWishlist=_c.toggleWishlist, isWishlisted=_c.isWishlisted;
  var _d=useSearchHistory(user?user.uid:undefined), history=_d.history, fetchHistory=_d.fetchHistory;

  var _e=useState(false), isLoading=_e[0], setIsLoading=_e[1];
  var _f=useState('Mencari produk terbaik...'), loadingText=_f[0], setLoadingText=_f[1];
  var _g=useState(null), result=_g[0], setResult=_g[1];
  var _h=useState(null), currentSearchId=_h[0], setCurrentSearchId=_h[1];
  var _i=useState([]), compareList=_i[0], setCompareList=_i[1];
  var _j=useState(false), showCompareModal=_j[0], setShowCompareModal=_j[1];
  var _k=useState(null), compareResult=_k[0], setCompareResult=_k[1];
  var _l=useState(false), isComparing=_l[0], setIsComparing=_l[1];

  useEffect(function(){
    if(!isLoading)return;
    var texts=['Mencari produk terbaik...','Membandingkan harga...','Menyusun rekomendasi...'];
    var i=0;
    var iv=setInterval(function(){i=(i+1)%texts.length;setLoadingText(texts[i])},2000);
    return function(){clearInterval(iv)};
  },[isLoading]);

  var handleSearch = async function(formData) {
    setIsLoading(true);
    setResult(null);
    setCompareList([]);
    try {
      var res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, stream: true }),
      });
      if (!res.ok) {
        var err = await res.json().catch(function() { return {}; });
        throw new Error(err.error || 'Gagal mencari rekomendasi');
      }
      var rawText = await res.text();
      var raw = JSON.parse(rawText);
      var data = injectAffiliateUrls(raw);
      setResult(data);

      if (user) {
        var dr = await addDoc(collection(db, 'searches'), {
          userId: user.uid,
          ...formData,
          results: data,
          createdAt: serverTimestamp(),
        });
        setCurrentSearchId(dr.id);
        fetchHistory();
      } else {
        setCurrentSearchId(null);
      }
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Terjadi kesalahan saat mencari rekomendasi.');
    } finally {
      setIsLoading(false);
    }
  };

  var handleVisualSearch = async function(imageBase64, mimeType) {
    setIsLoading(true);
    setResult(null);
    setCompareList([]);
    try {
      var res = await fetch('/api/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, mimeType: mimeType }),
      });
      if (!res.ok) {
        var err = await res.json().catch(function() { return {}; });
        throw new Error(err.error || 'Gagal memproses gambar');
      }
      var raw = await res.json();
      var data = injectAffiliateUrls(raw);
      setResult(data);

      if (user) {
        var dr = await addDoc(collection(db, 'searches'), {
          userId: user.uid,
          category: 'Visual Search',
          subcategory: 'Gambar',
          budget: '-',
          needs: [],
          detail: 'Pencarian via gambar',
          results: data,
          createdAt: serverTimestamp(),
        });
        setCurrentSearchId(dr.id);
        fetchHistory();
      }
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Gagal memproses gambar');
    } finally {
      setIsLoading(false);
    }
  };

  var handleHistorySelect = function(historyResult) {
    setResult(injectAffiliateUrls(historyResult));
    setActiveTab('search');
  };

  var handleCompareToggle = function(p, sel) {
    if (sel && compareList.length >= 3) { toast.error('Maksimal membandingkan 3 produk'); return; }
    setCompareList(sel ? [...compareList, p] : compareList.filter(function(x) { return x.name !== p.name; }));
  };

  var handleCompare = async function() {
    if (compareList.length < 2) return;
    setIsComparing(true);
    setShowCompareModal(true);
    setCompareResult(null);
    try {
      var res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productNames: compareList.map(function(p) { return p.name; }) }),
      });
      if (!res.ok) {
        var err = await res.json().catch(function() { return {}; });
        throw new Error(err.error || 'Gagal membandingkan');
      }
      var data = await res.json();
      setCompareResult(data);
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Gagal membandingkan produk');
      setShowCompareModal(false);
    } finally {
      setIsComparing(false);
    }
  };

  var handleFeedback = async function(name, helpful) {
    if (!user) { toast.error('Login untuk memberikan feedback'); return; }
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        searchId: currentSearchId || 'unknown',
        productName: name,
        helpful: helpful,
        createdAt: serverTimestamp(),
      });
      toast.success('Terima kasih atas feedback Anda!');
    } catch (e) {
      console.error(e);
    }
  };

  var renderSkeleton = function() {
    return React.createElement('div', { className: 'space-y-8' },
      React.createElement('div', { className: 'text-center py-12' },
        React.createElement(Loader2, { className: 'w-10 h-10 text-green-600 animate-spin mx-auto mb-4' }),
        React.createElement('p', { className: 'text-base text-gray-500' }, loadingText)
      ),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' },
        [1, 2, 3].map(function(i) {
          return React.createElement('div', { key: i, className: 'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse' },
            React.createElement('div', { className: 'h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4 mb-4' }),
            React.createElement('div', { className: 'h-5 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-2' }),
            React.createElement('div', { className: 'h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-6' }),
            React.createElement('div', { className: 'h-8 bg-gray-100 dark:bg-gray-800 rounded w-full mb-4' }),
            React.createElement('div', { className: 'h-3 bg-gray-100 dark:bg-gray-800 rounded w-full mb-2' }),
            React.createElement('div', { className: 'h-10 bg-gray-100 dark:bg-gray-800 rounded w-full' })
          );
        })
      )
    );
  };

  return React.createElement(React.Fragment, null,
    activeTab === 'search' && React.createElement(SearchForm, { onSubmit: handleSearch, isLoading: isLoading, onVisualSearch: handleVisualSearch }),
    React.createElement('main', { className: 'max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8' },
      React.createElement(AdPlacement, { placement: 'top_banner', className: 'mb-8 h-24 md:h-32' }),
      activeTab === 'search' && React.createElement('div', { className: 'space-y-8' },
        isLoading ? renderSkeleton() : result ? React.createElement('div', { className: 'space-y-8' },
          result.budget_warning && React.createElement('div', { className: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4' },
            React.createElement('p', { className: 'text-sm text-yellow-700 dark:text-yellow-300' }, result.budget_warning_message)
          ),
          React.createElement('div', { className: 'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6' },
            React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-white mb-1' }, 'Ringkasan Rekomendasi'),
            React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, 'Berdasarkan kriteria yang Anda berikan'),
            React.createElement('p', { className: 'text-sm text-gray-700 dark:text-gray-300 leading-relaxed' }, result.summary)
          ),
          React.createElement('div', { className: 'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6' },
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
              React.createElement('div', null,
                React.createElement('h3', { className: 'text-base font-semibold text-gray-900 dark:text-white mb-2' }, 'Tips Pembelian'),
                React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 leading-relaxed' }, result.tips)
              ),
              React.createElement('div', null,
                React.createElement('h3', { className: 'text-base font-semibold text-gray-900 dark:text-white mb-2' }, 'Alternatif Budget'),
                React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 leading-relaxed' }, result.alternative_suggestion)
              )
            )
          ),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' },
            result.products.map(function(product, idx) {
              return React.createElement(ProductCard, {
                key: idx, product: product, onCompareToggle: handleCompareToggle,
                isCompared: compareList.some(function(p) { return p.name === product.name; }),
                onWishlistToggle: toggleWishlist, isWishlisted: isWishlisted(product.name), onFeedback: handleFeedback
              });
            })
          )
        ) : React.createElement('div', { className: 'space-y-6' },
          React.createElement('div', { className: 'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8' },
            React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-white mb-3' }, 'Temukan Produk Terbaik'),
            React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, 'IndoRecs adalah platform rekomendasi produk berbasis AI untuk konsumen Indonesia.')
          )
        )
      ),
      activeTab === 'history' && (user ? React.createElement(HistoryTab, { history: history, onSelect: handleHistorySelect }) : React.createElement('div', { className: 'max-w-md mx-auto text-center py-16' },
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-white mb-2' }, 'Login untuk melihat Riwayat'),
        React.createElement('button', { onClick: loginWithGoogle, className: 'px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700' }, 'Login dengan Google')
      )),
      activeTab === 'wishlist' && (user ? React.createElement(WishlistTab, {
        wishlist: wishlist, compareList: compareList, onCompareToggle: handleCompareToggle, onWishlistToggle: toggleWishlist, onFeedback: handleFeedback
      }) : React.createElement('div', { className: 'max-w-md mx-auto text-center py-16' },
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-white mb-2' }, 'Login untuk melihat Wishlist'),
        React.createElement('button', { onClick: loginWithGoogle, className: 'px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700' }, 'Login dengan Google')
      ))
    ),
    compareList.length > 0 && React.createElement('div', { className: 'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-40' },
      React.createElement('div', { className: 'max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('span', { className: 'text-sm font-semibold text-gray-500 dark:text-gray-400' }, compareList.length + ' produk dipilih'),
          React.createElement('div', { className: 'flex gap-1.5 overflow-x-auto no-scrollbar' },
            compareList.map(function(p) {
              return React.createElement('span', { key: p.name, className: 'text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded max-w-[120px] truncate' }, p.name);
            })
          )
        ),
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('button', { onClick: function() { setCompareList([]); }, className: 'px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200' }, 'Batal'),
          React.createElement('button', {
            onClick: handleCompare, disabled: compareList.length < 2,
            className: 'px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
          }, 'Bandingkan ', React.createElement(ArrowRight, { className: 'w-4 h-4' }))
        )
      )
    ),
    showCompareModal && React.createElement('div', { className: 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4' },
      React.createElement('div', { className: 'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col' },
        React.createElement('div', { className: 'p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center' },
          React.createElement('h2', { className: 'text-xl font-bold text-gray-900 dark:text-white' }, 'Perbandingan Produk'),
          React.createElement('button', { onClick: function() { setShowCompareModal(false); }, className: 'p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800' },
            React.createElement(X, { className: 'w-5 h-5' })
          )
        ),
        React.createElement('div', { className: 'p-6 overflow-y-auto' },
          isComparing ? React.createElement('div', { className: 'text-center py-12' },
            React.createElement(Loader2, { className: 'w-12 h-12 text-green-600 animate-spin mx-auto mb-4' }),
            React.createElement('p', { className: 'text-base text-gray-500 dark:text-gray-400' }, 'Menganalisis perbandingan...')
          ) : compareResult ? React.createElement('div', { className: 'space-y-8' },
            React.createElement('div', { className: 'bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5' },
              React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-1' }, 'Pemenang'),
              React.createElement('p', { className: 'text-xl font-bold text-gray-900 dark:text-white mb-1' }, compareResult.winner),
              React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, compareResult.winner_reason)
            ),
            React.createElement('div', { className: 'overflow-x-auto' },
              React.createElement('table', { className: 'w-full text-left border-collapse' },
                React.createElement('thead', null,
                  React.createElement('tr', null,
                    React.createElement('th', { className: 'p-3 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400' }, 'Aspek'),
                    compareList.map(function(p) {
                      return React.createElement('th', { key: p.name, className: 'p-3 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white' }, p.name);
                    })
                  )
                ),
                React.createElement('tbody', null,
                  (compareResult.comparison || []).map(function(comp, i) {
                    return React.createElement('tr', { key: i, className: 'border-b border-gray-100 dark:border-gray-700' },
                      React.createElement('td', { className: 'p-3 text-sm font-medium text-gray-900 dark:text-white' }, comp.aspect),
                      compareList.map(function(p) {
                        var sd = (comp.scores && comp.scores[p.name]) || { score: '-', note: '-' };
                        var sc = sd.score != null ? sd.score : '-';
                        var nt = sd.note != null ? sd.note : '-';
                        var isN = typeof sc === 'number';
                        return React.createElement('td', { key: p.name, className: 'p-3' },
                          React.createElement('span', { className: 'text-sm font-semibold ' + (isN && sc >= 7 ? 'text-green-600' : isN && sc >= 5 ? 'text-yellow-600' : 'text-red-500') }, isN ? sc + '/10' : sc),
                          React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400 mt-0.5' }, nt)
                        );
                      })
                    );
                  })
                )
              )
            ),
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
              compareList.map(function(p) {
                return React.createElement('div', { key: p.name, className: 'bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4' },
                  React.createElement('h4', { className: 'text-sm font-semibold text-gray-900 dark:text-white mb-1' }, p.name),
                  React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' }, (compareResult.verdict && compareResult.verdict[p.name]) || '-')
                );
              })
            )
          ) : null
        )
      )
    )
  );
}

