import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Loader2, Eye, EyeOff, Mail, Lock, AlertTriangle, Chrome, Sparkles } from 'lucide-react';

const SignIn = () => {
  const { signIn, resetPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  const fieldErrors = useMemo(() => {
    const errors = {};
    if (touched.email && !form.email) errors.email = 'Email is required';
    else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format';
    if (touched.password && !form.password) errors.password = 'Password is required';
    return errors;
  }, [form, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      await signIn(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!form.email) { setError('Enter your email first'); return; }
    try {
      setError(null);
      setMessage(null);
      await resetPassword(form.email);
      setMessage('Password reset email sent');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-16 px-4 min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-95" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="w-full max-w-md glass-effect-ultra relative p-8 z-10">
        {/* Enhanced header with gradient effects */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg animate-float">
              <Brain className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">Welcome Back</h1>
          </div>
          <p className="text-slate-300 text-sm">Access your personalized research dashboard</p>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-6 group relative overflow-hidden bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-3">
            <Chrome size={20} className="text-blue-500" />
            <span>Continue with Google</span>
            <Sparkles size={16} className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/50" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-900/50 text-slate-400">or continue with email</span>
          </div>
        </div>

        {/* Error and success messages with enhanced styling */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400">
            {message}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Email field with icon and validation */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-slate-900/60 border ${fieldErrors.email ? 'border-red-500/60' : 'border-slate-700/60'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-lg pl-11 pr-4 py-3 text-slate-100 outline-none transition-all duration-200`}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password field with show/hide toggle */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-slate-900/60 border ${fieldErrors.password ? 'border-red-500/60' : 'border-slate-700/60'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-lg pl-11 pr-12 py-3 text-slate-100 outline-none transition-all duration-200`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {fieldErrors.password}
              </p>
            )}
            <div className="flex justify-end mt-2">
              <button 
                type="button" 
                onClick={handleReset} 
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || Object.keys(fieldErrors).length > 0}
            className="w-full button-premium gradient-primary text-white font-semibold px-6 py-4 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02]"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
