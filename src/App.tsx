import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AdminDashboard from './pages/admin/Dashboard';
import AdsList from './pages/admin/AdsList';
import AdForm from './pages/admin/AdForm';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-green-600 animate-spin" /></div>;
  const isAdmin = user && (user.email?.toLowerCase() === 'bambangnurdiann@gmail.com');
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'wishlist'>('search');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-white flex flex-col">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home activeTab={activeTab} setActiveTab={setActiveTab} />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/ads" element={<ProtectedRoute><AdsList /></ProtectedRoute>} />
            <Route path="/admin/ads/create" element={<ProtectedRoute><AdForm /></ProtectedRoute>} />
            <Route path="/admin/ads/:id" element={<ProtectedRoute><AdForm /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}
