import React from 'react';
import { Shield, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kebijakan Privasi</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Terakhir diperbarui: Juni 2026</p>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">1. Informasi yang Kami Kumpulkan</h2>
            <p>IndoRecs mengumpulkan informasi berikut saat Anda menggunakan layanan kami:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Informasi Akun Google:</strong> Nama, email, dan foto profil saat Anda login melalui Google. Data ini digunakan untuk mengidentifikasi akun Anda dan menyimpan riwayat pencarian serta wishlist pribadi.</li>
              <li><strong>Riwayat Pencarian:</strong> Kategori produk, subkategori, budget, kebutuhan, dan hasil rekomendasi yang Anda cari disimpan di server kami (Firebase Firestore) agar dapat diakses kembali.</li>
              <li><strong>Feedback:</strong> Respons thumbs up/down yang Anda berikan pada produk digunakan untuk meningkatkan kualitas rekomendasi.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">2. Penggunaan Data</h2>
            <p>Data Anda digunakan untuk:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Menyediakan rekomendasi produk yang dipersonalisasi menggunakan AI (Google Gemini).</li>
              <li>Menyimpan dan menampilkan riwayat pencarian serta wishlist Anda.</li>
              <li>Meningkatkan kualitas layanan berdasarkan feedback.</li>
            </ul>
            <p className="mt-2">Kami <strong>tidak</strong> menjual, membagikan, atau menyewakan data pribadi Anda kepada pihak ketiga.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">3. Cookies</h2>
            <p>IndoRecs menggunakan cookies untuk:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Menyimpan preferensi tema (mode gelap/terang) pada browser Anda.</li>
              <li>Mempertahankan sesi login Firebase Authentication.</li>
              <li>Google AdSense dan layanan pihak ketiga mungkin menggunakan cookies untuk menayangkan iklan yang relevan. Silakan lihat kebijakan privasi Google untuk informasi lebih lanjut.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">4. Iklan Pihak Ketiga</h2>
            <p>IndoRecs menampilkan iklan melalui Google AdSense dan platform periklanan lainnya. Penyedia iklan pihak ketiga dapat menggunakan cookies dan teknologi pelacakan serupa untuk menayangkan iklan berdasarkan kunjungan Anda sebelumnya ke situs ini atau situs web lain. Anda dapat menonaktifkan personalisasi iklan melalui <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">Pengaturan Iklan Google</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">5. Keamanan Data</h2>
            <p>Kami menyimpan data Anda di Firebase (Google Cloud) yang dilengkapi dengan enkripsi data in-transit dan at-rest. Akses ke data dibatasi oleh aturan keamanan Firebase (Firestore Rules) yang ketat.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">6. Hak Anda</h2>
            <p>Anda memiliki hak untuk:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Mengakses data yang kami simpan tentang Anda.</li>
              <li>Meminta penghapusan data Anda (riwayat pencarian, wishlist, feedback).</li>
              <li>Logout dan tidak menggunakan layanan kapan saja.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">7. Hubungi Kami</h2>
            <p>Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami di:</p>
            <div className="flex items-center gap-2 mt-2 text-green-600 dark:text-green-400">
              <Mail className="w-4 h-4" />
              <a href="mailto:bambangnurdiann@gmail.com" className="hover:underline">bambangnurdiann@gmail.com</a>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <Link to="/" className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline">← Kembali ke Beranda</Link>
        </div>
      </div>
    </main>
  );
}
