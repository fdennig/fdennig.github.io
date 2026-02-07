/**
 * semantic-citations.js
 * - Prefills citation badges from front-matter (data-fallback-cites) immediately.
 * - Uses (and caches) Semantic Scholar citation counts by DOI (localStorage, 24h TTL).
 * - Updates article data-cites for sorting; dispatches 'semanticCitationsUpdated' once.
 * - Falls back gracefully on errors (keeps prefilled values).
 */
(function(){
  const badges = Array.from(document.querySelectorAll('.cite-badge[data-doi]'));
  if (!badges.length) return;

  const CACHE_KEY_PREFIX = 'ss_cite_';  // per DOI
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

  function norm(doi){
    return (doi || '').trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i,'').toLowerCase();
  }

  // Prefill from fallback counts so initial sort (importance) has data
  badges.forEach(b => {
    const doi = norm(b.getAttribute('data-doi'));
    if (!doi) return;
    b.dataset.doi = doi;

    const fb = (b.getAttribute('data-fallback-cites') || '').trim();
    let num = 0;
    if (fb && fb.toLowerCase() !== 'n/a' && /^\d+$/.test(fb)) {
      num = parseInt(fb,10);
      b.textContent = `${num} cites`;
    } else {
      b.textContent = 'n/a';
    }
    if (b.dataset.doiUrl && (!b.href || b.getAttribute('href') === '#')) {
      b.href = b.dataset.doiUrl;
    }
    const art = b.closest('.pub-item');
    if (art && (!art.dataset.cites || art.dataset.cites === '0')) {
      art.dataset.cites = num;
    }
    b.title = `Citations (fallback: ${b.textContent})`;
    b.setAttribute('aria-label', `Citations: ${b.textContent}`);
  });

  // Group by DOI (after prefill)
  const groups = new Map();
  badges.forEach(b => {
    const d = b.dataset.doi;
    if (!d) return;
    if (!groups.has(d)) groups.set(d, []);
    groups.get(d).push(b);
  });

  if (!groups.size) {
    document.dispatchEvent(new Event('semanticCitationsUpdated'));
    return;
  }

  // Fetch all (using cache)
  const fetchPromises = [];
  groups.forEach((nodes, doi) => {
    const cached = loadCache(doi);
    if (cached) {
      applyData(nodes, cached.count, cached.url);
    } else {
      fetchPromises.push(
        fetch(`https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}?fields=citationCount,url,paperId`)
          .then(r => {
            if (!r.ok) throw new Error(r.status);
            return r.json();
          })
          .then(data => {
            const count = data.citationCount;
            if (!Number.isFinite(count)) throw new Error('no-count');
            const url = data.url || (data.paperId ? `https://www.semanticscholar.org/paper/${data.paperId}` : null);
            saveCache(doi, count, url);
            applyData(nodes, count, url);
          })
          .catch(() => {
            // Keep fallback already shown; ensure article has numeric cites
            nodes.forEach(b => {
              const art = b.closest('.pub-item');
              if (art && !art.dataset.cites) art.dataset.cites = '0';
            });
          })
      );
    }
  });

  if (!fetchPromises.length) {
    // All cached
    document.dispatchEvent(new Event('semanticCitationsUpdated'));
    return;
  }

  Promise.allSettled(fetchPromises).then(() => {
    document.dispatchEvent(new Event('semanticCitationsUpdated'));
  });

  function applyData(nodes, count, targetUrl){
    nodes.forEach(b => {
      b.textContent = `${count} cites`;
      if (targetUrl) b.href = targetUrl;
      else if (b.dataset.doiUrl) b.href = b.dataset.doiUrl;
      b.title = `Citations: ${count}`;
      b.setAttribute('aria-label', `Citations: ${count}`);
      const art = b.closest('.pub-item');
      if (art) art.dataset.cites = count;
    });
  }

  function loadCache(doi){
    try {
      const raw = localStorage.getItem(CACHE_KEY_PREFIX + doi);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj.t || (Date.now() - obj.t) > CACHE_TTL_MS) return null;
      return obj;
    } catch(e){
      return null;
    }
  }

  function saveCache(doi, count, url){
    try {
      localStorage.setItem(
        CACHE_KEY_PREFIX + doi,
        JSON.stringify({ count, url, t: Date.now() })
      );
    } catch(e){ /* ignore quota */ }
  }
})();