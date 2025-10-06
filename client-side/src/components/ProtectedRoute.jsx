import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Scroll to top when component mounts or location changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Handle redirect for unauthenticated users with delay to prevent flash
  useEffect(() => {
    if (!loading && !user) {
      // Show loading for a brief moment, then redirect
      const timer = setTimeout(() => {
        navigate('/signin', { replace: true, state: { from: location } });
      }, 300); // Small delay to show loading state
      
      return () => clearTimeout(timer);
    }
  }, [loading, user, navigate, location]);

  // Always show loading state while checking auth or for unauthenticated users
  if (loading || !user) {
    const isRedirecting = !loading && !user;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative">
          {/* Ambient Background */}
          <div className="absolute inset-0 -m-8 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20 blur-xl animate-pulse"></div>
          
          {/* Loading Card */}
          <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
            <div className="flex flex-col items-center space-y-4">
              {/* Animated Spinner */}
              <div className="relative">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                <div className="absolute inset-0 h-8 w-8 border-2 border-transparent border-t-cyan-400 border-r-purple-400 rounded-full animate-spin" style={{animationDuration: '0.8s', animationDirection: 'reverse'}}></div>
              </div>
              
              {/* Loading Text - Dynamic based on state */}
              <div className="text-center">
                <p className="text-white/90 font-medium">
                  {isRedirecting ? 'Redirecting...' : 'Loading...'}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  {isRedirecting ? 'Taking you to sign in' : 'Preparing your dashboard'}
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
