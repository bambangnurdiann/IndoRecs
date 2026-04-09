import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, History, Heart, Search } from 'lucide-react';

interface NavbarProps {
  activeTab: 'search' | 'history' | 'wishlist';
  setActiveTab: (tab: 'search' | 'history' | 'wishlist') => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('search')}>
            <Search className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">IndoRecs</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'search' ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'}`}
            >
              Cari
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'history' ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'}`}
            >
              <History className="h-4 w-4 mr-1" />
              Riwayat
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'wishlist' ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'}`}
            >
              <Heart className="h-4 w-4 mr-1" />
              Wishlist
            </button>

            {user ? (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="h-8 w-8 rounded-full" />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.displayName}</span>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="ml-4 pl-4 border-l border-gray-200">
                <button
                  onClick={loginWithGoogle}
                  className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
