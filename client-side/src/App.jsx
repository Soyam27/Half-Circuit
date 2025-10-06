import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import MainPage from './pages/MainPage';
import ContentDetail from './pages/ContentDetail';
import Footer from './components/Footer';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';


const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
  <div className="min-h-app overflow-x-hidden relative" style={{fontFamily: "'Pixelify Sans', 'Inter', sans-serif"}}>
        {/* Scroll to top on route change */}
        <ScrollToTop />
        
        {/* Global Continuous Background */}
        <div className="fixed inset-0 -z-10 bg-slate-950">
          {/* Base animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 animate-bgPan bg-noise" />
          
          {/* Animated overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-purple-900/10 to-green-900/20 animate-gradient" />
          
          {/* Floating Animated Blobs */}
          <div className="blob blob-1 animate-blob-float animate-blob-pulse" />
          <div className="blob blob-2 animate-blob-float animate-blob-pulse" style={{animationDelay: '5s, 1s'}} />
          <div className="blob blob-3 animate-blob-float animate-blob-pulse" style={{animationDelay: '10s, 2s'}} />
          <div className="blob blob-4 animate-blob-float animate-blob-pulse" style={{animationDelay: '15s, 3s'}} />
          <div className="blob blob-5 animate-blob-float animate-blob-pulse" style={{animationDelay: '20s, 4s'}} />
          <div className="blob blob-6 animate-blob-float animate-blob-pulse" style={{animationDelay: '12s, 0.5s'}} />
        </div>
        
        <Navbar />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/main" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
          <Route path="/content/:id" element={<ContentDetail />} />
        </Routes>
        
        <Footer />
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
