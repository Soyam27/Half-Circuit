// Simple background search manager to allow searches to continue
// even if the Search page unmounts (navigation elsewhere)

const listeners = new Set();
const activeSearches = new Map(); // key: query => { status, results, error, controller }

let apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export function configureSearchManager({ base }) {
  if (base) apiBase = base;
}

export function subscribeSearch(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(update) {
  for (const l of listeners) {
    try { l(update); } catch (_) {}
  }
}

export function getSearchState(query) {
  return activeSearches.get(query);
}

export async function runSearch({ query, userId, token, limit = 10 }) {
  const trimmed = (query || '').trim();
  if (!trimmed) return;
  const existing = activeSearches.get(trimmed);
  if (existing && existing.status === 'running') return; // avoid duplicate

  const controller = new AbortController();
  const meta = { status: 'running', results: [], error: null, startedAt: Date.now(), controller };
  activeSearches.set(trimmed, meta);
  emit({ query: trimmed, ...meta });

  try {
    const resp = await fetch(`${apiBase}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ query: trimmed, limit, user_id: userId || null }),
      signal: controller.signal
    });

    if (!resp.ok) throw new Error(`Search failed (${resp.status})`);
    const data = await resp.json();
    if (data && typeof data === 'object' && 'status_code' in data && data.status_code !== 200) {
      meta.status = 'error';
      meta.error = data.detail || data.message || `Search failed (code ${data.status_code})`;
      emit({ query: trimmed, ...meta });
      return;
    }
    const mapped = (data.results || [])
      // Client-side safeguard: exclude any wikipedia.org domains
      .filter(r => {
        const rawUrl = (r.url || r.link || '').trim();
        if (!rawUrl) return false;
        try {
          const host = new URL(rawUrl).hostname;
          if (host && host.endsWith('wikipedia.org')) return false;
        } catch {
          // if URL parsing fails, keep it (won't match wikipedia filter)
        }
        return true;
      })
      .map((r, idx) => {
      const rawUrl = (r.url || r.link || '').trim();
      if (!rawUrl) return null;
      let domain;
      try { domain = new URL(rawUrl).hostname; } catch { domain = rawUrl.split('/')[2] || 'unknown'; }
      const publishDate = r.published_date || r.publishDate;
      const rawCategory = r.category || r.content_type || 'resources';
      const normalizedCategory = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
      return {
        id: idx + 1,
        title: r.title || rawUrl,
        description: r.snippet || 'No description available.',
        url: rawUrl,
        domain,
        favicon: r.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        publishDate: publishDate || '—',
        category: normalizedCategory
      };
  }).filter(Boolean);

    meta.status = 'done';
    meta.results = mapped;
    emit({ query: trimmed, ...meta });
  } catch (e) {
    if (e.name === 'AbortError') {
      meta.status = 'cancelled';
      meta.error = 'Search cancelled';
    } else {
      meta.status = 'error';
      meta.error = e.message || 'Search failed';
    }
    emit({ query: trimmed, ...meta });
  }
}

export function cancelSearch(query) {
  const trimmed = (query || '').trim();
  if (!trimmed) return;
  const entry = activeSearches.get(trimmed);
  if (entry && entry.status === 'running' && entry.controller) {
    try { entry.controller.abort(); } catch {}
  }
}

export function cancelAllSearches() {
  for (const [q, meta] of activeSearches.entries()) {
    if (meta.status === 'running' && meta.controller) {
      try { meta.controller.abort(); } catch {}
    }
  }
}

// Completely reset all tracked searches (used for full page Clear/reset)
export function resetSearchManager() {
  activeSearches.clear();
  // Notify listeners so UI can drop any references if desired
  emit({ query: null, status: 'reset', results: [], error: null });
}
