import React from 'react';
import { SearchHistory, SearchResult } from '../types';

interface HistoryTabProps {
  history: SearchHistory[];
  onSelect: (result: SearchResult) => void;
}

export function HistoryTab({ history, onSelect }: HistoryTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Pencarian</h2>
      {history.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada riwayat pencarian.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors" onClick={() => onSelect(item.results)}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.category}</span>
                <span className="text-sm text-gray-400 dark:text-gray-500">{new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleDateString('id-ID')}</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{item.subcategory}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Budget: {item.budget}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.results.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
