import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/Dashboard';
import AdsList from './pages/admin/AdsList';
import AdForm from './pages/admin/AdForm';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );
  }

  // Check if user is admin (using the same logic as firestore rules)
  const isAdmin = user && (user.email?.toLowerCase() === 'bambangnurdiann@gmail.com');

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'wishlist'>('search');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <Routes>
          <Route path="/" element={<Home activeTab={activeTab} setActiveTab={setActiveTab} />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/ads" element={
            <ProtectedRoute>
              <AdsList />
            </ProtectedRoute>
          } />
          <Route path="/admin/ads/create" element={
            <ProtectedRoute>
              <AdForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/ads/:id" element={
            <ProtectedRoute>
              <AdForm />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
