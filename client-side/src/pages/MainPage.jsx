import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, ExternalLink, Clock, Globe, ArrowRight, Bookmark, Share2, AlertTriangle, Check } from 'lucide-react';
import { runSearch, subscribeSearch, getSearchState, cancelSearch, resetSearchManager } from '../services/searchManager';
import { useAuth } from '../context/AuthContext';

const MainPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  // Per-user storage key (falls back to generic when not authenticated)
  const baseStorageKey = 'hc_last_search';
  const STORAGE_KEY = user ? `${baseStorageKey}_${user.uid}` : baseStorageKey;
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
  // Track last executed query to prevent duplicate searches (e.g. StrictMode double invoke + manual call)
  const lastQueryRef = useRef(null);
  const prevUserRef = useRef(null);

  // Load persisted search (scoped per user) OR run query param
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      if (query !== lastQueryRef.current) {
        lastQueryRef.current = query;
        performSearch(query);
      }
      return;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { query: savedQuery, results } = JSON.parse(saved);
        if (savedQuery) {
          setSearchQuery(savedQuery);
          setSearchResults(results || []);
          setHasSearched(true);
        }
      }
    } catch (err) {
      console.warn('Failed to load saved search', err);
    }
  }, [searchParams, STORAGE_KEY]);

  // Clear only on actual logout; switching users uses a different key naturally
  useEffect(() => {
    const prev = prevUserRef.current;
    if (prev && !user) {
      // logout event
      try { localStorage.removeItem(`${baseStorageKey}_${prev.uid}`); } catch {}
      try { localStorage.removeItem(baseStorageKey); } catch {}
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
      lastQueryRef.current = null;
    }
    prevUserRef.current = user;
  }, [user]);

  // Persist whenever results change after a successful search
  useEffect(() => {
    if (hasSearched && searchQuery.trim() && searchResults.length >= 0) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ query: searchQuery, results: searchResults })); } catch {}
    }
  }, [searchResults, searchQuery, hasSearched, STORAGE_KEY]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    setError(null);
    setIsLoading(true);
    setHasSearched(true);
    let token = null;
    if (user && user.getIdToken) {
      try { token = await user.getIdToken(); } catch {}
    }
    runSearch({ query, userId: user?.uid, token, limit: 10 });
  };

  // Subscribe to background search updates
  useEffect(() => {
    const unsub = subscribeSearch(({ query, status, results, error: err }) => {
      if (query !== searchQuery) return; // only update active query view
      if (status === 'running') {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
      if (err) {
        setError(err);
        setSearchResults([]);
      } else if (results) {
        setError(null);
        setSearchResults(results.map(r => ({ ...r, readTime: r.publishDate })));
      }
    });
    // If there is an ongoing search for current query on mount, hydrate
    const existing = getSearchState(searchQuery);
    if (existing) {
      setHasSearched(true);
      setIsLoading(existing.status === 'running');
      if (existing.error) setError(existing.error);
      else setSearchResults(existing.results || []);
    }
    return unsub;
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Just update the URL; useEffect will trigger performSearch once.
      navigate(`/main?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const [bookmarkingId, setBookmarkingId] = useState(null);
  const [bookmarkSuccess, setBookmarkSuccess] = useState(null);

  const saveSearch = async (result) => {
    if (!user) {
      setError('You must be logged in to bookmark.');
      return;
    }
    setBookmarkingId(result.id);
    setBookmarkSuccess(null);
    try {
      let token = null;
      if (user.getIdToken) {
        try { token = await user.getIdToken(); } catch {}
      }
      const payload = {
        user_id: user.uid,
        result: {
          title: result.title,
          link: result.url,
          snippet: result.description,
          favicon: result.favicon,
          category: result.category,
          site: result.domain
        }
      };
      const resp = await fetch(`${API_BASE}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('Failed to bookmark');
      setBookmarkSuccess(result.id);
      setTimeout(() => setBookmarkSuccess(null), 2000);
    } catch (e) {
      setError(e.message || 'Failed to bookmark');
    } finally {
      setBookmarkingId(null);
    }
  };

  const clearPersisted = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear saved search', err);
    }
    if (searchQuery.trim()) {
      cancelSearch(searchQuery);
    }
    // Reset manager internal state so everything feels fresh
    resetSearchManager();
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    // Remove query param to present a fresh page
    navigate('/main', { replace: true });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Documentation': 'bg-blue-500/20 text-blue-400',
      'Tutorial': 'bg-green-500/20 text-green-400',
      'Examples': 'bg-purple-500/20 text-purple-400',
      'Community': 'bg-orange-500/20 text-orange-400',
      'Resources': 'bg-pink-500/20 text-pink-400'
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400';
  };

  return (
    <div className="container-premium pt-40 pb-12">
      <div className="max-w-6xl mx-auto mt-30">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-4">
            <span className="text-gradient">Search & Discover</span>
          </h1>
          <p className="text-slate-300 text-lg">
            Find comprehensive information on any topic
          </p>
        </div>

  {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 gradient-primary rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="relative dark-glass-effect rounded-2xl p-2 shadow-2xl">
              <div className="flex items-center">
                <div className="flex items-center pl-6 pr-4">
                  <Search size={24} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter your search query..."
                  className="flex-1 bg-transparent text-white text-lg placeholder-slate-400 border-0 outline-0 py-4 pr-4"
                />
                
                <button
                  type="submit"
                  className="button-premium gradient-primary text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!searchQuery.trim() || isLoading}
                >
                  <span>{isLoading ? 'Searching...' : 'Search'}</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Inline error directly under form if present (always show if error) */}
        {error && (
          <div className="mb-6 max-w-2xl mx-auto flex items-start gap-3 bg-red-500/10 border border-red-600/40 text-red-300 px-4 py-3 rounded-lg">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Search Error</p>
              <p className="opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Search Results {searchQuery && `for "${searchQuery}"`}
              </h2>
              <div className="flex items-center gap-4">
                {searchResults.length > 0 && (
                  <span className="text-slate-400">{searchResults.length} results found</span>
                )}
                <button
                  onClick={clearPersisted}
                  className="text-sm text-slate-300 hover:text-white bg-slate-800/30 px-3 py-1 rounded-md transition-colors"
                  title="Clear persisted search"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Error no longer shown here; only displayed under form */}

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="glass-effect p-6 rounded-xl animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-700 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-6 bg-slate-700 rounded mb-2" />
                        <div className="h-4 bg-slate-700 rounded mb-2 w-3/4" />
                        <div className="h-4 bg-slate-700 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {searchResults.map((result) => (
                  <div key={result.id} className="glass-effect p-6 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="flex items-start gap-4">
                      {/* Favicon */}
                      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img 
                          src={result.favicon} 
                          alt={`${result.domain} favicon`}
                          className="w-8 h-8 rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <Globe size={20} className="text-slate-500 hidden" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                            {result.title}
                          </h3>
                          <div className="flex items-center gap-2 ml-4">
                            <button 
                              onClick={() => saveSearch(result)}
                              className="p-2 hover:bg-slate-700 rounded-lg transition-colors relative"
                              title="Save this result"
                              disabled={bookmarkingId === result.id}
                            >
                              {bookmarkSuccess === result.id ? (
                                <Check size={16} className="text-green-400" />
                              ) : bookmarkingId === result.id ? (
                                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Bookmark size={16} className="text-slate-400 hover:text-yellow-400" />
                              )}
                            </button>
                            <button 
                              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Share this result"
                            >
                              <Share2 size={16} className="text-slate-400 hover:text-blue-400" />
                            </button>
                          </div>
                        </div>

                        <p className="text-slate-300 mb-3 line-clamp-2">
                          {result.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Globe size={12} />
                            {result.domain}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {result.publishDate || '—'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(result.category)}`}>
                            {result.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link 
                            to={`/content/${result.id}?url=${encodeURIComponent(result.url)}`}
                            className="button-premium gradient-primary text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
                          >
                            <span>View Content</span>
                            <ArrowRight size={16} />
                          </Link>
                          <a 
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                          >
                            <ExternalLink size={16} />
                            <span>Open Original</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="text-center py-16">
            <Search size={64} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-400 mb-2">Ready to Search</h3>
            <p className="text-slate-500">
              Enter a search query above to find comprehensive information on any topic
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;