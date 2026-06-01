import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Product, WishlistItem } from '../types';
import toast from 'react-hot-toast';

export function useWishlist(userId: string | undefined) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const fetchWishlist = async () => {
    if (!userId) { setWishlist([]); return; }
    try {
      const q = query(collection(db, 'wishlist'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const items: WishlistItem[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() } as WishlistItem));
      setWishlist(items);
    } catch (e) {
      console.error('fetchWishlist error:', e);
    }
  };

  useEffect(() => { fetchWishlist(); }, [userId]);

  const toggleWishlist = async (product: Product) => {
    if (!userId) return;
    const existing = wishlist.find(w => w.product.name === product.name);

    if (existing) {
      // Optimistic remove
      setWishlist(prev => prev.filter(w => w.id !== existing.id));
      try {
        await deleteDoc(doc(db, 'wishlist', existing.id));
      } catch (e) {
        // Rollback
        setWishlist(prev => [...prev, existing]);
        toast.error('Gagal menghapus dari wishlist');
        console.error('deleteDoc error:', e);
      }
    } else {
      // Optimistic add dengan temp id
      const tempItem: WishlistItem = { id: '__temp__', userId, product, savedAt: new Date() };
      setWishlist(prev => [...prev, tempItem]);
      try {
        const dr = await addDoc(collection(db, 'wishlist'), {
          userId,
          product,
          savedAt: serverTimestamp(),
        });
        // Ganti temp item dengan id asli dari Firestore
        setWishlist(prev => prev.map(w => w.id === '__temp__' ? { ...w, id: dr.id } : w));
      } catch (e) {
        // Rollback
        setWishlist(prev => prev.filter(w => w.id !== '__temp__'));
        toast.error('Gagal menyimpan ke wishlist');
        console.error('addDoc error:', e);
      }
    }
  };

  const isWishlisted = (productName: string) => wishlist.some(w => w.product.name === productName);

  return { wishlist, toggleWishlist, isWishlisted };
}
