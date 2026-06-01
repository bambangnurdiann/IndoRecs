import React from 'react';
import { Sparkles, Target, Cpu, ShoppingCart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tentang IndoRecs</h1>
        </div>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Apa itu IndoRecs?</h2>
            <p>IndoRecs adalah platform rekomendasi produk berbasis AI yang dirancang khusus untuk konsumen Indonesia. Kami membantu Anda menemukan produk terbaik yang sesuai dengan budget, kebutuhan, dan preferensi Anda — tanpa harus menghabiskan waktu berjam-jam riset sendiri.</p>
            <p className="mt-2">Dari smartphone hingga skincare, dari laptop hingga peralatan rumah tangga — IndoRecs memberikan rekomendasi yang cerdas, objektif, dan selalu up-to-date dengan pasar Indonesia.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Bagaimana Cara Kerjanya?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg inline-block mb-2">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-1">1. Pilih Kriteria</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tentukan kategori produk, budget, dan kebutuhan spesifik Anda</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg inline-block mb-2">
                  <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-1">2. AI Bekerja</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Google Gemini AI menganalisis ribuan data produk untuk mencocokkan dengan kebutuhan Anda</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg inline-block mb-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-1">3. Dapatkan Rekomendasi</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Terima 3 rekomendasi terbaik lengkap dengan analisis, langsung beli di marketplace favorit</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Teknologi di Balik IndoRecs</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Google Gemini AI:</strong> Model AI canggih yang menghasilkan rekomendasi produk dalam Bahasa Indonesia dengan pemahaman konteks lokal.</li>
              <li><strong>Firebase:</strong> Infrastruktur Google Cloud untuk autentikasi pengguna, penyimpanan data riwayat dan wishlist.</li>
              <li><strong>React + Tailwind CSS:</strong> Antarmuka modern yang cepat, responsif, dan mendukung mode gelap/terang.</li>
              <li><strong>Accesstrade:</strong> Sistem tautan afiliasi untuk produk Shopee dan Blibli yang memungkinkan kami menghasilkan pendapatan untuk mendukung operasional.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Misi Kami</h2>
            <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
              <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-800 dark:text-green-200">Membantu jutaan konsumen Indonesia membuat keputusan belanja yang lebih cerdas, hemat, dan sesuai kebutuhan — dengan kekuatan kecerdasan buatan.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Dibuat Oleh</h2>
            <p>IndoRecs dikembangkan oleh <strong>Bambang Nurdiansyah</strong>, seorang software engineer yang passionate tentang AI dan teknologi untuk pasar Indonesia. Tujuannya sederhana: membuat pengalaman belanja online di Indonesia lebih cerdas dan efisien.</p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <Link to="/" className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline">← Kembali ke Beranda</Link>
        </div>
      </div>
    </main>
  );
}
