import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { SearchHistory } from '../types';

export function useSearchHistory(userId: string | undefined) {
  const [history, setHistory] = useState<SearchHistory[]>([]);

  const fetchHistory = async () => {
    if (!userId) { setHistory([]); return; }
    try {
      const q = query(collection(db, 'searches'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      const items: SearchHistory[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() } as SearchHistory));
      setHistory(items);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchHistory(); }, [userId]);
  return { history, fetchHistory };
}
