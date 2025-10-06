import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Brain, Sparkles, Search, BarChart3, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const frame = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItems = [
    { name: 'Home', to: '/', icon: Sparkles },
    { name: 'Search', to: '/main', icon: Search },
    { name: 'Dashboard', to: '/dashboard', icon: BarChart3, protected: true }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors duration-300 backdrop-blur-md ${
        scrolled ? 'shadow-md' : 'shadow-none'
      } ${open ? 'bg-slate-900/90' : 'bg-slate-900/65'}`}
    >
      <div className="container-premium">
        <div className="flex justify-between items-center h-20 py-3">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Brain size={24} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              Half<span className="text-gradient">Circuit</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 h-full mr-20 xl:mr-32">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className={`flex items-center gap-2 cursor-pointer transition-colors group px-3 py-2 rounded-lg ${
                  isActive(item.to)
                    ? 'text-white bg-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon
                  size={16}
                  className={`transition-colors ${
                    isActive(item.to) ? 'text-blue-400' : 'group-hover:text-blue-400'
                  }`}
                />
                <span className="font-medium">{item.name}</span>
                {/* small glowing dot for active item */}
                {isActive(item.to) && <span className="nav-active-dot ml-3" aria-hidden="true" />}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4 relative">
            {user ? (
              <>
                <button
                  onClick={() => setUserMenu(v => !v)}
                  className="w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-transparent hover:ring-blue-400/40 transition overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500"
                  title={user.displayName || user.email}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display='none'; }}
                    />
                  ) : (
                    <span className="text-xs font-semibold text-white">
                      {user.displayName?.[0]?.toUpperCase() || <User size={16} className="text-white" />}
                    </span>
                  )}
                </button>
                {userMenu && (
                  <div className="absolute right-0 top-14 w-64 glass-effect-strong rounded-xl p-4 border border-slate-700/50 shadow-xl z-50">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-white truncate">{user.displayName || 'User'}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="h-px bg-slate-600/40 my-3" />
                    <button
                      onClick={async () => { await signOut(); setUserMenu(false); navigate('/'); }}
                      className="w-full flex items-center gap-2 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 px-3 py-2 rounded-lg transition"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/signin" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Sign In</Link>
                <Link to="/signup" className="button-premium gradient-primary text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(prev => !prev)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation (auto height inside nav) */}
      {open && (
        <div id="mobile-nav" className="md:hidden">
          <div className="px-4 pt-2 pb-4 space-y-1 glass-effect border-t border-slate-700/50 shadow-lg">
            {navItems.filter(item => !(item.protected && !user)).map((item) => (
              <Link
                key={item.name}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive(item.to)
                    ? 'text-white bg-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon 
                  size={18} 
                  className={isActive(item.to) ? 'text-blue-400' : 'text-slate-400'} 
                />
                <span className="flex items-center justify-between flex-row w-full gap-2">
                  <span>{item.name}</span>
                  {isActive(item.to) && <span className="nav-active-dot ml-2 mobile" aria-hidden="true" />}
                </span>
              </Link>
            ))}
            <div className="border-t border-slate-700/50 pt-3 mt-3">
              {user ? (
                <button
                  onClick={async () => { await signOut(); setOpen(false); navigate('/'); }}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="flex gap-3 px-1">
                  <Link to="/signin" onClick={() => setOpen(false)} className="flex-1 text-center text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg py-2">Sign In</Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 text-center text-xs font-semibold text-white gradient-primary rounded-lg py-2 shadow">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;