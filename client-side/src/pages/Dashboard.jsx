import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, BookOpen, TrendingUp, Star, Calendar, ArrowRight, Trash2, ExternalLink, RefreshCcw, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
  const [stats, setStats] = useState({
    totalSearches: 0,           // total recent searches count
    savedCount: 0,              // number of saved searches (bookmarks)
    recentCount: 0,             // number of recent searches (distinct or total?) using history length
    aiAnalysisCount: 0          // number of AI summaries generated
  });

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [savedResp, recentResp] = await Promise.all([
        fetch(`${API_BASE}/saved/${user.uid}`),
        fetch(`${API_BASE}/recent/${user.uid}`)
      ]);
      if (!savedResp.ok) throw new Error('Failed to load saved searches');
      if (!recentResp.ok) throw new Error('Failed to load recent history');
      const savedJson = await savedResp.json();
      const recentJson = await recentResp.json();

      const saved = (savedJson.saved || savedJson.bookmarks || []).map((b, idx) => ({
        id: b.id || b.link || idx,
        query: b.title || b.link,
        description: b.snippet || '',
        timestamp: b.saved_at || b.timestamp || new Date().toISOString(),
        resultsCount: 1,
        category: b.category || 'General',
        // preserve the original URL if available so Dashboard can open ContentDetail with it
        url: b.link || b.url || ''
      }));
      setSavedSearches(saved);

      const history = (recentJson.recent || []).map((r, idx) => ({
        id: r.id || r.query + idx,
        query: r.query,
        timestamp: r.timestamp,
        clicked: true
      }));
      
      // Remove duplicates, keeping the most recent entry for each query
      const uniqueHistory = history.reduce((acc, current) => {
        const existingIndex = acc.findIndex(item => item.query.toLowerCase() === current.query.toLowerCase());
        if (existingIndex === -1) {
          acc.push(current);
        } else {
          // Keep the one with more recent timestamp
          if (new Date(current.timestamp) > new Date(acc[existingIndex].timestamp)) {
            acc[existingIndex] = current;
          }
        }
        return acc;
      }, []);
      
      // Sort by timestamp descending (most recent first)
      uniqueHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setSearchHistory(uniqueHistory);

      // Load AI analysis count from localStorage
      let aiCount = 0;
      try { aiCount = parseInt(localStorage.getItem('hc_ai_analysis_count') || '0', 10); } catch {}

      setStats({
        totalSearches: history.length,
        savedCount: saved.length,
        recentCount: uniqueHistory.length,
        aiAnalysisCount: aiCount
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const deleteSavedSearch = async (id) => {
    if (!user) return;
    // optimistic UI
    setSavedSearches(prev => prev.filter(search => search.id !== id));
    try {
      await fetch(`${API_BASE}/bookmark/${user.uid}/${id}`, { method: 'DELETE' });
    } catch (e) {
      // reload on failure
      loadData();
    }
  };

  const deleteRecent = async (id) => {
    if (!user) return;
    setSearchHistory(prev => prev.filter(r => r.id !== id));
    try {
      await fetch(`${API_BASE}/recent/${user.uid}/${id}`, { method: 'DELETE' });
    } catch (e) {
      loadData();
    }
  };

  const clearAllRecent = async () => {
    if (!user) return;
    setSearchHistory([]);
    // Clear server-side recent history
    try { await fetch(`${API_BASE}/recent/${user.uid}`, { method: 'DELETE' }); } catch (e) { /* fallback reload below */ }
    // Reset AI analyses counter as requested
    try { localStorage.setItem('hc_ai_analysis_count', '0'); } catch {}
    // Update stats immediately for responsive UI
    setStats(prev => ({
      ...prev,
      totalSearches: 0,
      recentCount: 0,
      aiAnalysisCount: 0
    }));
    // Optionally reload to re-sync saved searches unaffected
    // (kept lightweight; only reload on failure already handled) 
  };

  const clearAllSaved = async () => {
    // Not implemented backend bulk delete for bookmarks; fallback to per-item calls
    const ids = savedSearches.map(s => s.id);
    setSavedSearches([]);
    for (const id of ids) {
      try { await fetch(`${API_BASE}/bookmark/${user.uid}/${id}`, { method: 'DELETE' }); } catch {}
    }
    loadData();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container-premium pt-40 pb-12">
      <div className="max-w-7xl mx-auto mt-30">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-4">
            <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-slate-300 text-lg">
            Track your research progress and manage saved content
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-600/40 text-red-300 px-4 py-3 rounded-lg">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Load Error</p>
              <p className="opacity-80">{error}</p>
            </div>
            <button onClick={loadData} className="ml-auto text-xs px-2 py-1 bg-red-600/30 rounded hover:bg-red-600/40">Retry</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-effect p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <Search className="text-blue-400" size={24} />
              <span className="text-2xl font-bold text-white">{stats.totalSearches}</span>
            </div>
            <h3 className="text-slate-300 font-medium">Total Searches</h3>
          </div>

          <div className="glass-effect p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="text-green-400" size={24} />
              <span className="text-2xl font-bold text-white">{stats.savedCount}</span>
            </div>
            <h3 className="text-slate-300 font-medium">Saved Searches</h3>
          </div>

          <div className="glass-effect p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-purple-400" size={24} />
              <span className="text-2xl font-bold text-white">{stats.recentCount}</span>
            </div>
            <h3 className="text-slate-300 font-medium">Recent Searches</h3>
          </div>

          <div className="glass-effect p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-orange-400" size={24} />
              <span className="text-2xl font-bold text-white">{stats.aiAnalysisCount}</span>
            </div>
            <h3 className="text-slate-300 font-medium">AI Analyses</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Saved Searches */}
          <div className="glass-effect p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Saved Searches</h2>
              <div className="flex items-center gap-3">
                {loading && <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />}
                {savedSearches.length > 0 && (
                  <button onClick={clearAllSaved} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-xs" title="Clear All Saved">
                    <XCircle size={18} className="text-slate-400 hover:text-red-400" />
                  </button>
                )}
                <button onClick={loadData} className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Refresh">
                  <RefreshCcw size={18} className="text-slate-400 hover:text-white" />
                </button>
                <Star className="text-yellow-400" size={24} />
              </div>
            </div>
            
            <div className="space-y-4">
              {savedSearches.length === 0 && !loading && (
                <p className="text-slate-500 text-sm">No saved searches yet.</p>
              )}
              {savedSearches.map((search) => (
                <div key={search.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{search.query}</h3>
                      <p className="text-slate-400 text-sm mb-2">{search.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(search.timestamp)}
                        </span>
                        <span>{search.resultsCount} results</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                          {search.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link 
                        to={`/content/${encodeURIComponent(search.id)}?url=${encodeURIComponent(search.url || '')}`}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="View details"
                      >
                        <ExternalLink size={16} className="text-slate-400 hover:text-white" />
                      </Link>
                      <button 
                        onClick={() => deleteSavedSearch(search.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-slate-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Search History */}
          <div className="glass-effect p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent History</h2>
              <div className="flex items-center gap-3">
                {searchHistory.length > 0 && (
                  <button onClick={clearAllRecent} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-xs" title="Clear All Recent">
                    <XCircle size={18} className="text-slate-400 hover:text-red-400" />
                  </button>
                )}
                <Clock className="text-blue-400" size={24} />
              </div>
            </div>
            
            <div className="space-y-3">
              {searchHistory.length === 0 && !loading && (
                <p className="text-slate-500 text-sm">No recent history.</p>
              )}
              {searchHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.clicked ? 'bg-green-400' : 'bg-slate-500'}`} />
                    <div>
                      <p className="text-white font-medium">{item.query}</p>
                      <p className="text-slate-500 text-sm">{formatDate(item.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/main?q=${encodeURIComponent(item.query)}`}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <ArrowRight size={16} />
                    </Link>
                    <button
                      onClick={() => deleteRecent(item.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Link 
            to="/main"
            className="button-premium gradient-primary text-white font-semibold px-8 py-4 rounded-xl inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Search size={20} />
            New Search
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;