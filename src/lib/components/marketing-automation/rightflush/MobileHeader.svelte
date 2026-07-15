<div class="mobile-header">
  <button class="mobile-hamburger" class:open={isOpen} onclick={() => onToggle()}>
    <span></span><span></span><span></span>
  </button>
  <span class="mobile-logo-name">RightFlush</span>
  <div class="mobile-right">
    <a href="/marketing-automation/emergency" class="mobile-emergency-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      Emergency
    </a>
    <a href="tel:7057001234" class="mobile-call-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 15z"/></svg>
    </a>
  </div>
</div>

<script lang="ts">
    let { onToggle, isOpen } = $props();
</script>

<style>
.mobile-header {
  display: none;
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: 60px; background: var(--white);
  border-bottom: 1px solid var(--border);
  padding: 0 16px;
  align-items: center; justify-content: space-between;
}
.mobile-hamburger {
  width: 40px; height: 40px; border: none; background: none;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
}
.mobile-hamburger span {
  display: block; width: 22px; height: 2px; background: var(--ink);
  transition: all 0.3s; transform-origin: center;
}
.mobile-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.mobile-hamburger.open span:nth-child(2) { opacity: 0; }
.mobile-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
.mobile-logo-name { font-family: var(--cond); font-size: 18px; font-weight: 800; color: var(--ink); text-transform: uppercase; letter-spacing: 0.02em; }
.mobile-right { display: flex; align-items: center; gap: 8px; }
.mobile-emergency-btn {
  display: flex; align-items: center; gap: 5px;
  background: var(--rust); color: #fff;
  font-family: var(--cond); font-size: 13px; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase;
  padding: 7px 12px; border-radius: var(--radius);
  text-decoration: none; border: none;
}
.mobile-emergency-btn svg { width: 13px; height: 13px; stroke: currentColor; }
.mobile-call-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--green); border: none;
  display: flex; align-items: center; justify-content: center;
  text-decoration: none;
}
.mobile-call-btn svg { width: 16px; height: 16px; stroke: #fff; }

@media (max-width: 768px) {
  .mobile-header { display: flex; }
}
</style>
