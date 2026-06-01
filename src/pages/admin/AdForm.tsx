import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, Upload, Loader2, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '', target_url: '', placement: 'right_sidebar', start_date: '', end_date: '', is_active: true, priority: 0, image_url: ''
  });

  useEffect(() => { if (isEdit) { fetchAd(); } }, [id]);

  const fetchAd = async () => {
    try {
      const docRef = doc(db, 'ads', id!);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setFormData({ ...data, start_date: data.start_date?.toDate?.().toISOString().split('T')[0] || '', end_date: data.end_date?.toDate?.().toISOString().split('T')[0] || '' } as any);
        setImagePreview(data.image_url);
      }
    } catch (error) { console.error("Error fetching ad:", error); }
    finally { setIsFetching(false); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); const reader = new FileReader(); reader.onloadend = () => { setImagePreview(reader.result as string); }; reader.readAsDataURL(file); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let imageUrl = formData.image_url;
      if (imageFile) { const storageRef = ref(storage, `ads/${Date.now()}_${imageFile.name}`); const uploadResult = await uploadBytes(storageRef, imageFile); imageUrl = await getDownloadURL(uploadResult.ref); }
      const adData = { ...formData, image_url: imageUrl, start_date: Timestamp.fromDate(new Date(formData.start_date)), end_date: Timestamp.fromDate(new Date(formData.end_date)), updated_at: serverTimestamp() };
      if (isEdit) { await updateDoc(doc(db, 'ads', id!), adData); } else { await addDoc(collection(db, 'ads'), { ...adData, created_at: serverTimestamp() }); }
      navigate('/admin/ads');
    } catch (error) { console.error("Error saving ad:", error); alert("Terjadi kesalahan saat menyimpan iklan."); }
    finally { setIsLoading(false); }
  };

  if (isFetching) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-green-600 dark:text-green-400 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/admin/ads" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"><ArrowLeft className="w-4 h-4" />Kembali ke Daftar</Link>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{isEdit ? 'Edit Iklan' : 'Buat Iklan Baru'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200">Gambar Iklan</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                {imagePreview && imageFile ? (
                  <div className="relative w-full aspect-video bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-600">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }} className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-full shadow-sm transition-all"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full min-h-[150px] bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-2" /><span className="text-xs font-medium text-gray-500 dark:text-gray-400">Upload File</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              <div className="flex flex-col justify-center space-y-2">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase text-center">ATAU</span>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">Input Link Gambar Langsung</label>
                  <input type="url" value={formData.image_url} onChange={e => { setFormData({ ...formData, image_url: e.target.value }); setImagePreview(e.target.value); setImageFile(null); }} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all" placeholder="https://example.com/image.jpg" />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">Gunakan ini jika upload error (CORS)</p>
                </div>
              </div>
            </div>
            {imagePreview && !imageFile && (
              <div className="relative w-full aspect-video bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600"><img src={imagePreview} alt="Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" /></div>
            )}
          </div>
          <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Judul Iklan</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" placeholder="Contoh: Promo Laptop Gaming Akhir Tahun" required /></div>
          <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Link Tujuan (Target URL)</label><input type="url" value={formData.target_url} onChange={e => setFormData({ ...formData, target_url: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" placeholder="https://blibli.com/..." required /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Penempatan</label>
              <select value={formData.placement} onChange={e => setFormData({ ...formData, placement: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" required>
                <option value="right_sidebar">Right Sidebar (300x250/600)</option>
                <option value="top_banner">Top Banner (Responsive)</option>
                <option value="inline">Inline Ads (Di sela produk)</option>
                <option value="sponsored">Sponsored Product (Paling atas)</option>
              </select>
            </div>
            <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Prioritas (Opsional)</label><input type="number" value={formData.priority} onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" min="0" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Tanggal Mulai</label><input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" required /></div>
            <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Tanggal Berakhir</label><input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" required /></div>
          </div>
          <div className="flex items-center gap-3 py-2">
            <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-green-600 dark:text-green-500 focus:ring-green-500" />
            <label htmlFor="is_active" className="text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer">Aktifkan Iklan Sekarang</label>
          </div>
          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 dark:bg-green-500 text-white font-black uppercase tracking-widest rounded-xl hover:bg-green-700 dark:hover:bg-green-600 shadow-lg shadow-green-100 dark:shadow-green-900/30 transition-all active:scale-95 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" />Simpan Iklan</>}
          </button>
        </form>
      </div>
    </div>
  );
}
