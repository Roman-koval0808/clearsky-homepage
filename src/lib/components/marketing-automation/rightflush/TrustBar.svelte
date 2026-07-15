<div class="trust-bar">
  <div class="trust-bar-inner">
    <div class="trust-items">
      <div class="trust-item">
        <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Licensed &amp; Insured
      </div>
      <div class="trust-item">
        <span class="stars">★★★★★</span>
        4.7 · 64 Reviews
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        24/7 Emergency
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        Free Estimates
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Timmins &amp; Area
      </div>
    </div>
    <div class="trust-right">
      <a href="tel:7057001234" class="trust-phone">(705) 700-1234</a>
    </div>
  </div>
</div>

<style>
.trust-bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: var(--trust-h);
  background: var(--ink);
  display: flex; align-items: center;
  padding: 0 24px;
}
.trust-bar-inner {
  max-width: var(--col); margin: 0 auto; width: 100%;
  display: flex; align-items: center; justify-content: space-between;
}
.trust-items { display: flex; align-items: center; gap: 0; }
.trust-item {
  display: flex; align-items: center; gap: 7px;
  font-family: var(--sans); font-size: 12px; font-weight: 500;
  color: rgba(255,255,255,0.75);
  padding: 0 18px;
  border-right: 1px solid rgba(255,255,255,0.1);
}
.trust-item:first-child { padding-left: 0; }
.trust-item:last-child { border-right: none; }
.trust-item svg { width: 13px; height: 13px; stroke: var(--gold); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
.trust-item .stars { color: var(--gold); font-size: 11px; letter-spacing: 1px; }
.trust-right { display: flex; align-items: center; gap: 12px; }
.trust-phone { font-family: var(--cond); font-size: 15px; font-weight: 700; color: #fff; letter-spacing: 0.04em; }

@media (max-width: 768px) {
  .trust-bar { display: none; }
}
</style>
