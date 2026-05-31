import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogIn, LogOut, History, Heart, Search, Menu, X, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  activeTab: 'search' | 'history' | 'wishlist';
  setActiveTab: (tab: 'search' | 'history' | 'wishlist') => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user, loginWithGoogle, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = user && (user.email?.toLowerCase() === 'bambangnurdiann@gmail.com');
  const isAdminPage = location.pathname.startsWith('/admin');

  const navItems = [
    { id: 'search', label: 'Cari', icon: Search },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  const handleTabClick = (tab: any) => { setActiveTab(tab); setIsMenuOpen(false); };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <Link to="/" className="flex items-center cursor-pointer min-w-0" onClick={() => handleTabClick('search')}>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Indo<span className="text-green-600">Recs</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {!isAdminPage && (
              <div className="flex items-center gap-1 mr-4">
                {navItems.map((item) => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === item.id ? "text-green-600 bg-green-50 dark:bg-green-900/30" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800")}>
                    <item.icon className="h-4 w-4" />{item.label}
                  </button>
                ))}
              </div>
            )}
            {isAdmin && (
              <Link to="/admin" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors", isAdminPage ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30" : "text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30")}>
                <LayoutDashboard className="h-4 w-4" />Admin
              </Link>
            )}
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" title={isDark ? 'Mode Terang' : 'Mode Gelap'}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-200 max-w-[120px] truncate">{user.displayName}</span>
                <button onClick={logout} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Logout"><LogOut className="h-4 w-4" /></button>
              </div>
            ) : (
              <button onClick={loginWithGoogle} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">Login</button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg" title={isDark ? 'Mode Terang' : 'Mode Gelap'}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {!isAdminPage && navItems.map((item) => (
              <button key={item.id} onClick={() => handleTabClick(item.id as any)} className={cn("flex items-center w-full gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", activeTab === item.id ? "text-green-600 bg-green-50 dark:bg-green-900/30" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800")}>
                <item.icon className="h-4 w-4" />{item.label}
              </button>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className={cn("flex items-center w-full gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", isAdminPage ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30" : "text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30")}>
                <LayoutDashboard className="h-4 w-4" />Admin Dashboard
              </Link>
            )}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <button onClick={logout} className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><LogOut className="h-4 w-4" />Keluar Akun</button>
              ) : (
                <button onClick={loginWithGoogle} className="w-full px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">Masuk dengan Google</button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
