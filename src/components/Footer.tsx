import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 mt-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <span>&copy; {new Date().getFullYear()} IndoRecs. Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-red-500 dark:text-red-400 fill-current mx-0.5" />
            <span>di Indonesia</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/about" className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Tentang</Link>
            <Link to="/privacy-policy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Privasi</Link>
            <Link to="/terms-of-service" className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Syarat</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
