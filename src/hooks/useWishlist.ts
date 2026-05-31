import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Product, WishlistItem } from '../types';

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
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchWishlist(); }, [userId]);

  const toggleWishlist = async (product: Product) => {
    if (!userId) return;
    const existing = wishlist.find(w => w.product.name === product.name);
    if (existing) {
      await deleteDoc(doc(db, 'wishlist', existing.id));
      setWishlist(wishlist.filter(w => w.id !== existing.id));
    } else {
      const dr = await addDoc(collection(db, 'wishlist'), { userId, product, savedAt: serverTimestamp() });
      setWishlist([...wishlist, { id: dr.id, userId, product, savedAt: new Date() }]);
    }
  };

  const isWishlisted = (productName: string) => wishlist.some(w => w.product.name === productName);
  return { wishlist, toggleWishlist, isWishlisted };
}
