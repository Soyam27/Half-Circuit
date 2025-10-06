import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Loader2, Eye, EyeOff, Mail, Lock, User, AlertTriangle, Chrome, Sparkles, CheckCircle2, Shield } from 'lucide-react';

const SignUp = () => {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const fieldErrors = useMemo(() => {
    const errors = {};
    if (touched.name && !form.name.trim()) errors.name = 'Name is required';
    if (touched.email && !form.email) errors.email = 'Email is required';
    else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format';
    if (touched.password && !form.password) errors.password = 'Password is required';
    else if (touched.password && form.password.length < 6) errors.password = 'Minimum 6 characters required';
    if (touched.confirm && !form.confirm) errors.confirm = 'Please confirm your password';
    else if (touched.confirm && form.password && form.confirm !== form.password) errors.confirm = 'Passwords do not match';
    return errors;
  }, [form, touched]);

  const passwordStrength = useMemo(() => {
    const { password } = form;
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 5);
  }, [form.password]);

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleGoogleSignUp = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(fieldErrors).length > 0) {
      setError('Please fix the errors above');
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await signUp(form.email, form.password, form.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-16 px-4 min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-95" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="w-full max-w-md glass-effect-ultra relative p-8 z-10">
        {/* Enhanced header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg animate-float">
              <Brain className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">Create Account</h1>
          </div>
          <p className="text-slate-300 text-sm">Join Half<span className="text-gradient">Circuit</span> to personalize your research dashboard</p>
        </div>

        {/* Google Sign Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
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
            <span className="px-4 bg-slate-900/50 text-slate-400">or create with email</span>
          </div>
        </div>

        {/* Enhanced error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Name field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-slate-900/60 border ${fieldErrors.name ? 'border-red-500/60' : 'border-slate-700/60'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-lg pl-11 pr-4 py-3 text-slate-100 outline-none transition-all duration-200`}
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email field */}
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

          {/* Password field with strength indicator */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              Password
              {passwordStrength >= 4 && <Shield size={14} className="text-green-400" />}
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-slate-900/60 border ${fieldErrors.password ? 'border-red-500/60' : 'border-slate-700/60'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-lg pl-11 pr-12 py-3 text-slate-100 outline-none transition-all duration-200`}
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Password strength indicator */}
            {form.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        passwordStrength <= 1 ? 'w-1/5 bg-red-500' :
                        passwordStrength === 2 ? 'w-2/5 bg-orange-500' :
                        passwordStrength === 3 ? 'w-3/5 bg-yellow-500' :
                        passwordStrength === 4 ? 'w-4/5 bg-blue-500' :
                        'w-full bg-green-500'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-slate-400 capitalize">
                    {passwordStrength <= 1 ? 'Weak' :
                     passwordStrength === 2 ? 'Fair' :
                     passwordStrength === 3 ? 'Good' :
                     passwordStrength === 4 ? 'Strong' : 'Excellent'}
                  </span>
                </div>
              </div>
            )}
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm password field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                name="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirm}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-slate-900/60 border ${fieldErrors.confirm ? 'border-red-500/60' : form.confirm && !fieldErrors.confirm ? 'border-green-500/60' : 'border-slate-700/60'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-lg pl-11 pr-12 py-3 text-slate-100 outline-none transition-all duration-200`}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.confirm && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                {fieldErrors.confirm}
              </p>
            )}
            {form.confirm && !fieldErrors.confirm && form.password && (
              <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || Object.keys(fieldErrors).length > 0}
            className="w-full button-premium gradient-primary text-white font-semibold px-6 py-4 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02]"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link 
              to="/signin" 
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
