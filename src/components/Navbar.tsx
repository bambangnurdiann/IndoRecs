import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, History, Heart, Search, Menu, X, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  activeTab: 'search' | 'history' | 'wishlist';
  setActiveTab: (tab: 'search' | 'history' | 'wishlist') => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user, loginWithGoogle, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = user && (user.email?.toLowerCase() === 'bambangnurdiann@gmail.com');

  const navItems = [
    { id: 'search', label: 'Cari', icon: Search },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/"
            className="flex items-center cursor-pointer group min-w-0" 
            onClick={() => handleTabClick('search')}
          >
            <div className="p-2 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
              <Search className="h-6 w-6 md:h-7 md:w-7 text-green-600" />
            </div>
            <span className="ml-3 text-lg md:text-xl font-black text-gray-900 tracking-tight truncate">
              Indo<span className="text-green-600">Recs</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {!isAdminPage && (
              <div className="flex items-center gap-1 lg:gap-2 mr-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={cn(
                      "flex items-center px-4 py-2.5 rounded-xl text-[14px] lg:text-[15px] font-semibold transition-all duration-200",
                      activeTab === item.id
                        ? "text-green-700 bg-green-50"
                        : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 mr-2", activeTab === item.id ? "text-green-600" : "text-gray-400")} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "flex items-center px-4 py-2.5 rounded-xl text-[14px] lg:text-[15px] font-semibold transition-all duration-200",
                  isAdminPage
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                )}
              >
                <LayoutDashboard className={cn("h-4 w-4 mr-2", isAdminPage ? "text-blue-600" : "text-gray-400")} />
                Admin
              </Link>
            )}

            <div className="h-8 w-[1px] bg-gray-100 mx-2" />

            {user ? (
              <div className="flex items-center gap-3 pl-2">
                <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                  <img 
                    src={user.photoURL || ''} 
                    alt={user.displayName || ''} 
                    className="h-8 w-8 rounded-full border-2 border-white shadow-sm" 
                  />
                  <span className="text-sm font-bold text-gray-700 max-w-[120px] truncate">{user.displayName}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2.5 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center px-6 py-2.5 bg-green-600 text-white text-[14px] font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-50 bg-white animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {!isAdminPage && navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id as any)}
                className={cn(
                  "flex items-center w-full px-4 py-3.5 rounded-xl text-[15px] font-bold transition-all",
                  activeTab === item.id
                    ? "text-green-700 bg-green-50"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn("h-5 w-5 mr-3", activeTab === item.id ? "text-green-600" : "text-gray-400")} />
                {item.label}
              </button>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center w-full px-4 py-3.5 rounded-xl text-[15px] font-bold transition-all",
                  isAdminPage
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-600 hover:bg-blue-50"
                )}
              >
                <LayoutDashboard className={cn("h-5 w-5 mr-3", isAdminPage ? "text-blue-600" : "text-gray-400")} />
                Admin Dashboard
              </Link>
            )}
            
            <div className="pt-4 mt-4 border-t border-gray-50">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <img 
                      src={user.photoURL || ''} 
                      alt={user.displayName || ''} 
                      className="h-10 w-10 rounded-full border-2 border-white shadow-sm" 
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] font-bold text-gray-900 truncate">{user.displayName}</span>
                      <span className="text-xs text-gray-500 truncate">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-3.5 text-[15px] font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Keluar Akun
                  </button>
                </div>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="flex items-center justify-center w-full py-4 px-4 bg-green-600 text-white text-[15px] font-bold rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Masuk dengan Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
