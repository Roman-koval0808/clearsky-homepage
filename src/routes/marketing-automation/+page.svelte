<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    onMount(() => {
        // Any page-specific initialization
    });
</script>

<svelte:head>
  <title>RightFlush Plumbing — Timmins ON | Licensed Plumber | 24/7 Emergency</title>
  <meta name="description" content="RightFlush Plumbing — Timmins' most trusted licensed plumber. 4.7 stars, 64 reviews, 6 years serving Timmins and surrounding area. 24/7 emergency response. Free estimates.">
</svelte:head>

<section class="hero">
  <div class="hero-pattern"></div>
  <div class="hero-grid"></div>
  <div class="hero-content">
    <div class="hero-badge reveal">
      <div class="hero-badge-dot"></div>
      Plumber online now · 24/7 Response
    </div>
    <h1 class="hero-headline reveal reveal-delay-1">
      Timmins' Most<br><em>Trusted</em> Plumber<br><span class="line2">Since 2018</span>
    </h1>
    <p class="hero-sub reveal reveal-delay-2">
      From burst pipes at 3 AM to full bathroom renovations, RightFlush provides licensed, insured, and guaranteed plumbing across Timmins and Northern Ontario.
    </p>
    <div class="hero-actions reveal reveal-delay-3">
      <a href="/marketing-automation/emergency" class="hero-btn-primary" onclick={() => firePixel('hero_emergency', 'Hero: Emergency', 15, 'emergency')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 15z"/></svg>
        Emergency Call
      </a>
      <a href="/marketing-automation/contact" class="hero-btn-secondary" onclick={() => firePixel('hero_book', 'Hero: Book Now', 10, 'active')}>
        Get Free Estimate
      </a>
    </div>

    <div class="hero-stats reveal reveal-delay-4">
      <div class="hero-stat">
        <div class="hero-stat-num">4.7<span>★</span></div>
        <div class="hero-stat-label">Google Rating</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-num">24<span>/7</span></div>
        <div class="hero-stat-label">Response Time</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-num">100<span>%</span></div>
        <div class="hero-stat-label">Guaranteed</div>
      </div>
    </div>
  </div>

  <div class="scroll-indicator">
    <span>Scroll to explore</span>
    <div class="scroll-arrow"></div>
  </div>
</section>

<div class="trust-strip">
  <div class="trust-strip-inner">
    <div class="trust-strip-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      TSSA Certified Gas Techs
    </div>
    <div class="trust-strip-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      Red Seal Licensed Plumbers
    </div>
    <div class="trust-strip-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      Locally Owned &amp; Operated
    </div>
  </div>
</div>

<section class="section services-section" data-pixel-event="services_view" data-pixel-label="Services visible" data-pixel-delta="5" data-pixel-bucket="research">
  <div class="section-inner">
    <div class="section-label">Plumbing Services</div>
    <h2 class="section-headline">What we do <em>better</em></h2>
    <p class="section-sub">We handle every aspect of modern plumbing, from preventative maintenance to critical emergency repairs.</p>

    <div class="services-grid">
      <a href="/marketing-automation/hot-water" class="service-card">
        <div class="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
        <div class="service-name">Hot Water</div>
        <div class="service-desc">Repair and installation of gas, electric, and tankless water heaters.</div>
        <div class="service-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
      </a>
      <a href="/marketing-automation/blocked-drains" class="service-card">
        <div class="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12m0 0C12 7 7 4 7 4s1 4 5 8zm0 0c0-5 5-8 5-8s-1 4-5 8z"/></svg></div>
        <div class="service-name">Blocked Drains</div>
        <div class="service-desc">CCTV inspection and high-pressure jetting for stubborn blockages.</div>
        <div class="service-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
      </a>
      <a href="/marketing-automation/emergency" class="service-card emergency-card">
        <div class="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
        <div class="service-name">Emergency</div>
        <div class="service-desc">24/7 rapid response for burst pipes, flooding, and gas leaks.</div>
        <div class="service-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
      </a>
      <a href="/marketing-automation/bathroom-renovations" class="service-card">
        <div class="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="11" width="20" height="8" rx="2"/><path d="M6 11V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7"/></svg></div>
        <div class="service-name">Renovations</div>
        <div class="service-desc">Expert rough-in and finish work for modern bathroom remodels.</div>
        <div class="service-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
      </a>
    </div>
  </div>
</section>

<style>
/* ── HERO ── */
.hero {
  min-height: calc(100vh - var(--trust-h) - var(--nav-h));
  background: var(--ink);
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; justify-content: center;
}
.hero-pattern {
  position: absolute; inset: 0;
  background-image:
    radial-gradient(circle at 70% 50%, rgba(47,89,152,0.25) 0%, transparent 60%),
    radial-gradient(circle at 20% 80%, rgba(47,89,152,0.1) 0%, transparent 40%);
}
.hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}
.hero-content {
  position: relative; z-index: 2;
  max-width: var(--col); margin: 0 auto; width: 100%;
  padding: 80px 24px;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(47,89,152,0.3); border: 1px solid rgba(47,89,152,0.5);
  border-radius: 100px; padding: 6px 14px;
  font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.8);
  letter-spacing: 0.06em; text-transform: uppercase;
  margin-bottom: 28px;
}
.hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

.hero-headline {
  font-family: var(--cond); font-weight: 900;
  font-size: clamp(56px, 8vw, 108px);
  line-height: 0.9; text-transform: uppercase;
  color: #fff; letter-spacing: -0.01em;
  margin-bottom: 24px;
}
.hero-headline em { font-style: normal; color: var(--gold); }
.hero-headline .line2 { color: rgba(255,255,255,0.35); }

.hero-sub {
  font-size: 18px; font-weight: 300; color: rgba(255,255,255,0.6);
  line-height: 1.65; max-width: 520px; margin-bottom: 40px;
}

.hero-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 60px; }
.hero-btn-primary {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--rust); color: #fff;
  font-family: var(--cond); font-weight: 700; font-size: 17px;
  letter-spacing: 0.06em; text-transform: uppercase;
  padding: 16px 32px; border-radius: var(--radius);
  border: none; transition: all 0.2s; text-decoration: none;
}
.hero-btn-primary:hover { background: #d66a1a; transform: translateY(-1px); }
.hero-btn-primary svg { width: 18px; height: 18px; stroke: currentColor; }
.hero-btn-secondary {
  display: inline-flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.15);
  font-size: 15px; font-weight: 500;
  padding: 16px 28px; border-radius: var(--radius);
  transition: all 0.2s; text-decoration: none;
}
.hero-btn-secondary:hover { background: rgba(255,255,255,0.14); color: #fff; }

/* HERO STATS */
.hero-stats {
  display: flex; align-items: stretch; gap: 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 40px;
}
.hero-stat {
  flex: 1; padding-right: 32px; margin-right: 32px;
  border-right: 1px solid rgba(255,255,255,0.08);
}
.hero-stat:last-child { border-right: none; margin-right: 0; padding-right: 0; }
.hero-stat-num {
  font-family: var(--cond); font-weight: 800; font-size: 42px;
  color: #fff; line-height: 1; margin-bottom: 4px;
}
.hero-stat-num span { color: var(--gold); }
.hero-stat-label { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }

/* SCROLL INDICATOR */
.scroll-indicator {
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  z-index: 2;
}
.scroll-indicator span { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.3); }
.scroll-arrow { width: 1px; height: 40px; background: rgba(255,255,255,0.1); position: relative; overflow: hidden; }
.scroll-arrow::after { content: ''; position: absolute; top: -100%; left: 0; width: 100%; height: 100%; background: var(--gold); animation: scrollDown 1.8s infinite; }
@keyframes scrollDown { 0%{top:-100%} 100%{top:100%} }

/* ── TRUST STRIP ── */
.trust-strip {
  background: var(--green); padding: 20px 24px;
}
.trust-strip-inner {
  max-width: var(--col); margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  flex-wrap: wrap;
}
.trust-strip-item {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.85);
}
.trust-strip-item svg { width: 18px; height: 18px; stroke: rgba(255,255,255,0.6); flex-shrink: 0; }

/* ── SERVICES GRID ── */
.services-section { background: var(--surface); }
.services-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px;
}
.service-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 28px 24px;
  cursor: pointer; transition: all 0.25s; text-decoration: none;
  display: flex; flex-direction: column; gap: 0;
  position: relative; overflow: hidden;
}
.service-card::before {
  content: ''; position: absolute; bottom: 0; left: 0;
  width: 0; height: 3px; background: var(--green);
  transition: width 0.3s;
}
.service-card:hover { border-color: var(--green); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
.service-card:hover::before { width: 100%; }
.service-card:hover .service-icon { background: var(--green-lt); }
.service-card:hover .service-icon svg { stroke: var(--green); }
.service-icon {
  width: 48px; height: 48px; border-radius: 10px;
  background: var(--surface); display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px; transition: background 0.25s; flex-shrink: 0;
}
.service-icon svg { width: 26px; height: 26px; stroke: var(--text2); transition: stroke 0.25s; }
.service-card.emergency-card { border-color: rgba(245,124,34,0.2); }
.service-card.emergency-card .service-icon { background: var(--rust-lt); }
.service-card.emergency-card .service-icon svg { stroke: var(--rust); }
.service-card.emergency-card:hover { border-color: var(--rust); }
.service-card.emergency-card::before { background: var(--rust); }
.service-name {
  font-family: var(--cond); font-weight: 700; font-size: 18px;
  color: var(--ink); text-transform: uppercase; letter-spacing: 0.02em;
  margin-bottom: 8px;
}
.service-desc { font-size: 13px; color: var(--text2); line-height: 1.6; flex: 1; }
.service-arrow {
  display: flex; align-items: center; justify-content: flex-end;
  margin-top: 16px;
}
.service-arrow svg { width: 16px; height: 16px; stroke: var(--text3); transition: all 0.2s; }
.service-card:hover .service-arrow svg { stroke: var(--green); transform: translateX(3px); }
.service-card.emergency-card:hover .service-arrow svg { stroke: var(--rust); }

@media (max-width: 768px) {
    .hero-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 16px 0; margin-right: 0; }
    .hero-stats { flex-direction: column; }
}
</style>
