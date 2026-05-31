import React from 'react';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Syarat Penggunaan</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Terakhir diperbarui: Juni 2026</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">1. Penerimaan Syarat</h2>
            <p>Dengan mengakses dan menggunakan IndoRecs, Anda menyetujui syarat dan ketentuan yang tercantum di halaman ini. Jika Anda tidak menyetujui syarat ini, mohon untuk tidak menggunakan layanan kami.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">2. Deskripsi Layanan</h2>
            <p>IndoRecs adalah platform rekomendasi produk yang menggunakan kecerdasan buatan (AI) untuk membantu pengguna menemukan produk terbaik di pasar Indonesia berdasarkan budget dan kebutuhan spesifik. Layanan mencakup pencarian rekomendasi, perbandingan produk, wishlist, dan riwayat pencarian.</p>
            <p className="mt-2">Rekomendasi yang diberikan bersifat informatif dan bukan merupakan endorsement resmi. Pengguna bertanggung jawab melakukan verifikasi mandiri sebelum membeli.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">3. Akun Pengguna</h2>
            <p>Untuk mengakses fitur tertentu (riwayat pencarian, wishlist), Anda perlu login menggunakan akun Google. Anda bertanggung jawab menjaga kerahasiaan akun Anda dan setuju untuk tidak membagikan akses akun kepada pihak lain.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">4. Batasan Tanggung Jawab</h2>
            <p>IndoRecs menyediakan layanan rekomendasi "sebagaimana adanya" (as-is) tanpa jaminan apapun. Kami tidak bertanggung jawab atas:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Keakuratan harga, ketersediaan stok, atau deskripsi produk yang ditampilkan.</li>
              <li>Transaksi yang dilakukan di platform marketplace eksternal (Tokopedia, Shopee, dll).</li>
              <li>Kerugian atau kerusakan yang timbul dari penggunaan informasi rekomendasi kami.</li>
              <li>Gangguan layanan akibat pemeliharaan server atau force majeure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">5. Hak Kekayaan Intelektual</h2>
            <p>Nama "IndoRecs", logo, desain antarmuka, dan konten orisinal di situs ini adalah milik pengembang. Merek produk, logo marketplace, dan konten pihak ketiga yang ditampilkan adalah milik pemiliknya masing-masing.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">6. Tautan Afiliasi</h2>
            <p>IndoRecs menggunakan tautan afiliasi pada link produk Shopee. Ini berarti kami dapat menerima komisi kecil jika Anda membeli produk melalui tautan tersebut, tanpa biaya tambahan untuk Anda. Komisi ini membantu mendukung operasional platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">7. Perubahan Syarat</h2>
            <p>Kami berhak mengubah syarat penggunaan ini sewaktu-waktu. Perubahan akan diumumkan melalui pembaruan halaman ini. Penggunaan layanan setelah perubahan berarti Anda menyetujui syarat yang diperbarui.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">8. Hukum yang Berlaku</h2>
            <p>Syarat penggunaan ini diatur oleh hukum Republik Indonesia. Setiap sengketa akan diselesaikan melalui musyawarah terlebih dahulu sebelum menempuh jalur hukum.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">9. Kontak</h2>
            <p>Pertanyaan seputar syarat penggunaan dapat dikirim ke <a href="mailto:bambangnurdiann@gmail.com" className="text-green-600 dark:text-green-400 hover:underline">bambangnurdiann@gmail.com</a>.</p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <Link to="/" className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline">← Kembali ke Beranda</Link>
        </div>
      </div>
    </main>
  );
}
