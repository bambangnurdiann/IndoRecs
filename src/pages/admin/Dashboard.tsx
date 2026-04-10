import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { LayoutDashboard, Megaphone, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byPlacement: {
      right_sidebar: 0,
      top_banner: 0,
      inline: 0,
      sponsored: 0
    }
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const adsRef = collection(db, 'ads');
    const snapshot = await getDocs(adsRef);
    
    let total = 0;
    let active = 0;
    const byPlacement = {
      right_sidebar: 0,
      top_banner: 0,
      inline: 0,
      sponsored: 0
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      total++;
      if (data.is_active) active++;
      if (data.placement in byPlacement) {
        byPlacement[data.placement as keyof typeof byPlacement]++;
      }
    });

    setStats({ total, active, byPlacement });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-green-600" />
          Admin Dashboard
        </h1>
        <Link 
          to="/admin/ads/create"
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
        >
          Buat Iklan Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Megaphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Iklan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Iklan Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Iklan Non-Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total - stats.active}</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Penempatan Iklan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(stats.byPlacement).map(([placement, count]) => (
          <div key={placement} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
              {placement.replace('_', ' ')}
            </p>
            <p className="text-2xl font-bold text-gray-900">{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link 
          to="/admin/ads"
          className="text-green-600 font-bold hover:underline flex items-center gap-1"
        >
          Lihat Semua Iklan <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
