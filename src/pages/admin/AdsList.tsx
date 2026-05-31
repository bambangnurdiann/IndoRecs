import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Megaphone, Edit2, Trash2, ExternalLink, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdsList() {
  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchAds(); }, []);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'ads'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const items: any[] = [];
      snapshot.forEach(doc => { items.push({ id: doc.id, ...doc.data() }); });
      setAds(items);
    } catch (error) { console.error("Error fetching ads:", error); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus iklan ini?")) return;
    try { await deleteDoc(doc(db, 'ads', id)); setAds(ads.filter(ad => ad.id !== id)); }
    catch (error) { console.error("Error deleting ad:", error); }
  };

  const toggleStatus = async (ad: any) => {
    try {
      await updateDoc(doc(db, 'ads', ad.id), { is_active: !ad.is_active, updated_at: new Date() });
      setAds(ads.map(item => item.id === ad.id ? { ...item, is_active: !item.is_active } : item));
    } catch (error) { console.error("Error updating status:", error); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Megaphone className="w-6 h-6 text-green-600 dark:text-green-400" />Daftar Iklan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola semua penempatan iklan di website</p>
        </div>
        <Link to="/admin/ads/create" className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg font-bold hover:bg-green-700 dark:hover:bg-green-600 transition-colors"><Plus className="w-4 h-4" />Buat Iklan</Link>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Preview</th>
                <th className="p-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Judul & Penempatan</th>
                <th className="p-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Periode</th>
                <th className="p-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">Memuat data...</td></tr>
              ) : ads.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">Belum ada iklan.</td></tr>
              ) : (
                ads.map(ad => (
                  <tr key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="p-4"><div className="w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden border border-gray-200 dark:border-gray-600"><img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" /></div></td>
                    <td className="p-4"><p className="font-bold text-gray-900 dark:text-white">{ad.title}</p><p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{ad.placement.replace('_', ' ')}</p></td>
                    <td className="p-4">
                      <button onClick={() => toggleStatus(ad)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${ad.is_active ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                        {ad.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{ad.is_active ? 'Aktif' : 'Non-Aktif'}
                      </button>
                    </td>
                    <td className="p-4"><p className="text-xs text-gray-600 dark:text-gray-300">{new Date(ad.start_date?.toDate?.() || ad.start_date).toLocaleDateString('id-ID')} - {new Date(ad.end_date?.toDate?.() || ad.end_date).toLocaleDateString('id-ID')}</p></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/ads/${ad.id}`} className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></Link>
                        <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Buka Link"><ExternalLink className="w-4 h-4" /></a>
                        <button onClick={() => handleDelete(ad.id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
