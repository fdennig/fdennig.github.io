/**
 * sort-publications.js
 * Current behavior (before this fix):
 *  - Sorts .pub-item elements inside #pub-list.
 *  - Default sort = 'importance' (data-cites desc, then date).
 *  - Buttons toggle between importance/date.
 *  - Listens for 'semanticCitationsUpdated' to re-run current sort.
 * Issues:
 *  - The line `if (!list)` had no body (no return) – script would continue and error if #pub-list missing.
 * Minor enhancements added:
 *  - Proper early return if list not found.
 *  - Persist selected sort in localStorage.
 *  - Adds aria-pressed for accessibility.
 *  - Explicit tie‑breakers (date then title) for deterministic ordering.
 */
(function(){
  const list = document.getElementById('pub-list');
  if (!list) return;  // FIX: prevent errors if publications list absent

  const btns = Array.from(document.querySelectorAll('.pub-sort-btn'));
  if (!btns.length) return;

  const STORE_KEY = 'pubSortMode';

  function setActive(target){
    btns.forEach(b=>{
      const on = (b === target);
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function parseCites(v){
    const n = parseInt(v,10);
    return Number.isFinite(n) ? n : 0;
  }

  function sort(mode){
    const items = Array.from(list.querySelectorAll('.pub-item'));
    items.sort((a,b)=>{
      if (mode === 'importance'){
        const ca = parseCites(a.dataset.cites);
        const cb = parseCites(b.dataset.cites);
        if (cb !== ca) return cb - ca;              // cites desc
        // fall through to date tie-break
      }
      // date sort (descending)
      const da = a.dataset.date || '';
      const db = b.dataset.date || '';
      if (db !== da) return db < da ? -1 : 1;
      // final tie-break by title (asc)
      const ta = (a.querySelector('.pub-title')?.textContent || '').toLowerCase();
      const tb = (b.querySelector('.pub-title')?.textContent || '').toLowerCase();
      return ta.localeCompare(tb);
    });
    items.forEach(it => list.appendChild(it));
  }

  // Restore previous mode or default to importance
  const initialMode = localStorage.getItem(STORE_KEY) || 'importance';
  const initialBtn = btns.find(b => b.dataset.sort === initialMode) || btns[0];
  setActive(initialBtn);
  sort(initialBtn.dataset.sort);

  btns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if (btn.classList.contains('active')) return;
      setActive(btn);
      localStorage.setItem(STORE_KEY, btn.dataset.sort);
      sort(btn.dataset.sort);
    });
  });

  // Resort after live citation counts update
  document.addEventListener('semanticCitationsUpdated', ()=>{
    const active = document.querySelector('.pub-sort-btn.active');
    if (active) sort(active.dataset.sort);
  });
})();