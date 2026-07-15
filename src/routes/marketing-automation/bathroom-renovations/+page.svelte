<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel, captureIdentity } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    let brName = $state('');
    let brPhone = $state('');

    onMount(() => {
        firePixel('page_load', 'Page Visited - Bathroom Renovations', 6, 'comparison');
    });

    function scrollToContact() {
        document.getElementById('br-contact')?.scrollIntoView({ behavior: 'smooth' });
    }
</script>

<svelte:head>
  <title>Bathroom Renovations Timmins — Plumbing | RightFlush Plumbing</title>
  <meta name="description" content="Expert bathroom plumbing renovations in Timmins. Walk-in showers, custom tiling, modern fixtures. Use our Visualizer to design your dream space. Free estimates.">
</svelte:head>

<section class="br-hero">
    <div class="br-hero-bg"></div>
    <div class="br-hero-grid"></div>
    <div class="br-hero-inner">
      <div class="reveal">
        <div class="br-hero-label">Bathroom Renovations</div>
        <h1 class="br-hero-headline">Design your<br>dream space.<br><em>We'll plumb it.</em></h1>
        <p class="br-hero-sub">From simple fixture upgrades to complete ensuite overhauls. We combine expert plumbing with modern design to create bathrooms that function perfectly and look incredible.</p>
        <div class="br-hero-actions">
          <button class="br-hero-cta" onclick={scrollToContact}>Get a renovation quote</button>
          <a href="/marketing-automation/before-after" class="br-hero-cta secondary">View our gallery</a>
        </div>
      </div>
      
      <div class="br-visualizer-teaser reveal reveal-delay-2">
        <div class="br-teaser-header">
          <div class="br-teaser-dot"></div>
          RightFlush Visualizer
        </div>
        <div class="br-teaser-display">
          <div class="br-teaser-img-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Preview your design</span>
          </div>
          <div class="br-teaser-overlay">
            <div class="br-teaser-style">Selected Style: <strong>Modern Spa</strong></div>
            <div class="br-teaser-controls">
              <div class="br-teaser-dot active"></div>
              <div class="br-teaser-dot"></div>
              <div class="br-teaser-dot"></div>
            </div>
          </div>
        </div>
        <div class="br-teaser-footer">
          <p>Try different fixtures, tiles, and layouts in real-time.</p>
          <a href="/marketing-automation/visualizer" class="br-teaser-btn">Launch Visualizer</a>
        </div>
      </div>
    </div>
</section>

<section class="section br-features" data-pixel-event="reno_features" data-pixel-label="Reno features viewed" data-pixel-delta="5" data-pixel-bucket="research">
    <div class="section-inner">
      <div class="section-label reveal">Why choose us</div>
      <h2 class="section-headline reveal">Better results by design</h2>
      
      <div class="br-features-grid">
        <div class="br-feature reveal">
          <div class="br-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <h3 class="br-feature-title">Licensed plumbers first</h3>
          <p class="br-feature-desc">We aren't just handymen. We're licensed Red Seal plumbers who ensure your renovation meets all building codes and functions flawlessly for decades.</p>
        </div>
        <div class="br-feature reveal reveal-delay-1">
          <div class="br-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <h3 class="br-feature-title">3D Visualization</h3>
          <p class="br-feature-desc">See exactly what your new bathroom will look like before a single tile is removed. Our visualizer tool helps you make confident design decisions.</p>
        </div>
        <div class="br-feature reveal reveal-delay-2">
          <div class="br-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/><path d="M12 12l8-8M12 12l-8 8"/></svg></div>
          <h3 class="br-feature-title">Flat-rate pricing</h3>
          <p class="br-feature-desc">No "estimated" costs that balloon during construction. We provide a single, fixed price for your entire plumbing renovation scope.</p>
        </div>
      </div>
    </div>
</section>

<section class="section br-contact-section" id="br-contact">
    <div class="section-inner">
      <div class="br-contact-grid">
        <div class="reveal">
          <div class="section-label">Get Started</div>
          <h2 class="section-headline">Ready to start<br>your renovation?</h2>
          <p class="section-sub">Book a free on-site consultation. We'll walk through your space, discuss your goals, and provide a detailed flat-rate quote.</p>
          <div class="br-contact-info">
            <div class="br-info-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 15z"/></svg>(705) 700-1234</div>
            <div class="br-info-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>info@rightflush.ca</div>
          </div>
        </div>
        <div class="br-contact-form-wrap reveal reveal-delay-1">
          <div class="br-form">
            <div class="br-form-row">
              <div class="br-field"><label class="br-label">Name</label><input class="br-input" type="text" placeholder="Your name" bind:value={brName}></div>
              <div class="br-field"><label class="br-label">Phone</label><input class="br-input" type="tel" placeholder="(705) 000-0000" bind:value={brPhone}></div>
            </div>
            <div class="br-field"><label class="br-label">Project Type</label>
              <select class="br-select">
                <option>Complete ensuite overhaul</option>
                <option>Powder room update</option>
                <option>Shower/tub conversion</option>
                <option>Fixture/tile update only</option>
              </select>
            </div>
            <div class="br-field"><label class="br-label">Message (optional)</label><textarea class="br-textarea" rows="4" placeholder="Tell us about your project..."></textarea></div>
            <button class="br-submit-btn" onclick={() => captureIdentity('reno_form_submit', 'Reno contact form submitted', 20, 'active', { name: brName, phone: brPhone })}>Request consultation</button>
          </div>
        </div>
      </div>
    </div>
</section>

<style>
.br-hero { background: var(--ink); padding: 80px 24px 72px; position: relative; overflow: hidden; display: flex; align-items: center; min-height: 70vh; }
.br-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 60% 40%, rgba(47, 89, 152, 0.2) 0%, transparent 55%), radial-gradient(ellipse at 10% 80%, rgba(245, 124, 34, 0.05) 0%, transparent 40%); }
.br-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px); background-size: 60px 60px; }
.br-hero-inner { position: relative; z-index: 2; max-width: var(--col); margin: 0 auto; display: grid; grid-template-columns: 1fr 420px; gap: 64px; align-items: center; width: 100%; }
.br-hero-label { font-size: 11px; font-weight: 700; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
.br-hero-label::before { content: ''; display: block; width: 20px; height: 2px; background: rgba(255, 255, 255, 0.3); }
.br-hero-headline { font-family: var(--cond); font-weight: 900; font-size: clamp(44px, 6vw, 80px); line-height: 0.9; text-transform: uppercase; color: #fff; margin-bottom: 24px; }
.br-hero-headline em { font-style: normal; color: var(--gold); }
.br-hero-sub { font-size: 17px; font-weight: 300; color: rgba(255, 255, 255, 0.6); line-height: 1.65; margin-bottom: 36px; max-width: 520px; }
.br-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.br-hero-cta { display: inline-flex; align-items: center; gap: 8px; background: var(--green); color: #fff; font-family: var(--cond); font-weight: 700; font-size: 15px; text-transform: uppercase; padding: 13px 24px; border-radius: var(--radius); border: none; cursor: pointer; transition: background 0.2s; }
.br-hero-cta:hover { background: var(--green-mid); }
.br-hero-cta.secondary { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); color: rgba(255, 255, 255, 0.8); text-decoration: none; }

.br-visualizer-teaser { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; backdrop-filter: blur(4px); }
.br-teaser-header { padding: 16px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); font-family: var(--cond); font-size: 13px; font-weight: 700; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
.br-teaser-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }
.br-teaser-display { position: relative; aspect-ratio: 4/3; background: #000; overflow: hidden; }
.br-teaser-img-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: rgba(255, 255, 255, 0.2); }
.br-teaser-img-placeholder svg { width: 48px; height: 48px; }
.br-teaser-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px 20px; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); }
.br-teaser-style { font-size: 12px; color: rgba(255,255,255,0.6); }
.br-teaser-controls { display: flex; gap: 6px; margin-top: 8px; }
.br-teaser-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.2); }
.br-teaser-dot.active { background: var(--gold); }
.br-teaser-footer { padding: 20px; text-align: center; }
.br-teaser-footer p { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 16px; }
.br-teaser-btn { display: block; width: 100%; background: var(--gold); color: var(--ink); font-family: var(--cond); font-weight: 800; font-size: 14px; text-transform: uppercase; padding: 12px; border-radius: var(--radius); text-decoration: none; }

.br-features { background: var(--surface); padding: 80px 24px; }
.br-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 48px; }
.br-feature-icon { width: 48px; height: 48px; border-radius: 12px; background: var(--green-lt); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.br-feature-icon svg { width: 24px; height: 24px; stroke: var(--green); }
.br-feature-title { font-family: var(--cond); font-size: 20px; font-weight: 800; color: var(--ink); text-transform: uppercase; margin-bottom: 12px; }
.br-feature-desc { font-size: 15px; color: var(--text2); line-height: 1.6; }

.br-contact-section { background: var(--white); padding: 80px 24px; }
.br-contact-grid { max-width: var(--col); margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
.br-contact-info { margin-top: 32px; display: flex; flex-direction: column; gap: 16px; }
.br-info-item { display: flex; align-items: center; gap: 12px; font-family: var(--cond); font-size: 18px; font-weight: 700; color: var(--ink); }
.br-info-item svg { width: 20px; height: 20px; stroke: var(--green); }

.br-contact-form-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 40px; }
.br-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.br-field { margin-bottom: 16px; }
.br-label { font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; margin-bottom: 8px; display: block; }
.br-input, .br-select, .br-textarea { width: 100%; border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 16px; font-family: inherit; font-size: 14px; outline: none; background: var(--white); }
.br-submit-btn { width: 100%; background: var(--green); color: #fff; border: none; border-radius: var(--radius); padding: 15px; font-family: var(--cond); font-weight: 700; text-transform: uppercase; cursor: pointer; margin-top: 8px; }

@media (max-width: 1024px) {
    .br-hero-inner { grid-template-columns: 1fr; }
    .br-features-grid { grid-template-columns: 1fr; gap: 40px; }
    .br-contact-grid { grid-template-columns: 1fr; gap: 48px; }
}
</style>
