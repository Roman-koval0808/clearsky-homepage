<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel, captureIdentity } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    let clockTime = $state('00:00:00');
    let callbackName = $state('');
    let callbackPhone = $state('');
    let callbackIssue = $state('');
    let callbackFormOpen = $state(false);

    let lgName = $state('');
    let lgPhone = $state('');
    let lgIssue = $state('');

    onMount(() => {
        firePixel('page_load', 'Page Visited - Emergency', 20, 'emergency');

        const updateClock = () => {
            const now = new Date();
            clockTime = now.toLocaleTimeString('en-GB', { hour12: false });
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    });

    function toggleCallbackForm() {
        callbackFormOpen = !callbackFormOpen;
        if (callbackFormOpen) firePixel('callback_form_open', 'Callback form opened', 12, 'emergency');
    }

    function submitCallback() {
        captureIdentity('callback_submit', 'Callback form submitted', 20, 'emergency', { name: callbackName, phone: callbackPhone });
        alert('Request sent — we\'ll call within 15 minutes ✓');
        callbackFormOpen = false;
    }

    function submitLG() {
        firePixel('lg_submit', 'Lead Grabber submitted', 20, 'emergency');
        alert('Received — calling within 15 minutes ✓');
    }
</script>

<svelte:head>
  <title>Emergency Plumber Timmins — 24/7 Response | RightFlush Plumbing</title>
  <meta name="description" content="RightFlush Plumbing — Timmins emergency plumber available 24/7. Burst pipes, flooding, no hot water. 15-minute response commitment. We answer every call. (705) 700-1234.">
</svelte:head>

<div class="live-bar">
    <div class="live-bar-inner">
      <div class="live-indicator">
        <div class="live-dot"></div>
        <span class="live-text">We're available now</span>
      </div>
      <div class="live-divider"></div>
      <span class="live-detail">Emergency line answered within 15 minutes · (705) 700-1234</span>
      <span class="live-clock">{clockTime}</span>
    </div>
</div>

<section class="emg-hero">
    <div class="emg-hero-bg"></div>
    <div class="emg-hero-grid"></div>
    <div class="emg-hero-sweep"></div>
    <div class="emg-hero-inner">
      <div class="emg-hero-left">
        <div class="emg-hero-tag reveal">
          <div class="emg-hero-tag-dot"></div>
          Emergency Plumbing · Timmins, Ontario
        </div>

        <h1 class="emg-hero-headline reveal reveal-delay-1">
          We answer.<br>
          <em>Right now.</em><br>
          <span class="dim">24 hours.</span>
        </h1>

        <p class="emg-hero-sub reveal reveal-delay-2">
          Burst pipe. Flooding. No hot water. No voicemail. A licensed RightFlush plumber answers every emergency call — day or night — and is on their way within 15 minutes.
        </p>

        <div class="emg-call-block reveal reveal-delay-3">
          <div class="emg-call-label">Call now — we pick up</div>
          <div class="emg-call-number">
            <a href="tel:7057001234" class="emg-call-btn" onclick={() => firePixel('hero_call_click', 'Call CTA — hero', 20, 'emergency')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 15z"/></svg>
              (705) 700-1234
            </a>
            <span class="emg-call-or">or</span>
          </div>
        </div>

        <div class="emg-commitment reveal reveal-delay-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <div class="emg-commitment-text">
            <strong>15-minute response commitment.</strong> A licensed plumber is dispatched immediately. No call centre. No answering service. The owner answers emergency calls personally.
          </div>
        </div>

        <button class="emg-callback-link" onclick={toggleCallbackForm}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {callbackFormOpen ? '↑ Hide callback form' : 'Can\'t call right now? Request a callback'}
        </button>

        {#if callbackFormOpen}
            <div class="emg-callback-form open">
              <label class="emg-form-label">Your name</label>
              <input class="emg-form-input" type="text" placeholder="First name" bind:value={callbackName}>
              <label class="emg-form-label">Your phone number</label>
              <input class="emg-form-input" type="tel" placeholder="(705) 000-0000" bind:value={callbackPhone}>
              <label class="emg-form-label">What's the emergency?</label>
              <input class="emg-form-input" type="text" placeholder="e.g. burst pipe, no hot water, flooding" bind:value={callbackIssue}>
              <button class="emg-form-submit" onclick={submitCallback}>Request callback — we'll call within 15 minutes</button>
            </div>
        {/if}
      </div>

      <div class="emg-hero-right reveal">
        <div class="emg-card">
          <div class="emg-card-title">What's the emergency?</div>
          <div class="emg-card-items">
            {#each [
                { id: 'emgBurstPipe', name: 'Burst Pipe', desc: 'Water spraying or flooding — shut off main valve first, then call', icon: 'M12 12H5a4 4 0 0 1 0-8h14 M12 12h7a4 4 0 0 1 0 8H5' },
                { id: 'emgFlooding', name: 'Flooding', desc: 'Active flooding inside the home — we dispatch immediately', icon: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' },
                { id: 'emgHotWater', name: 'No Hot Water', desc: 'Water heater failure — same-day replacement available', icon: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z M12 6v6l4 2' },
                { id: 'emgSewer', name: 'Sewage Backup', desc: 'Raw sewage in the home is a health emergency — call now', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z L12 9v4 L12 17v0.01' },
                { id: 'emgGas', name: 'Gas Leak', desc: 'Leave the building immediately — call 911 first, then us', icon: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' }
            ] as item}
                <a href="tel:7057001234" class="emg-card-item" onclick={() => firePixel('emg_type_click', 'Emergency type: ' + item.name, 20, 'emergency')}>
                  <div class="emg-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d={item.icon}/>
                  </svg></div>
                  <div>
                    <div class="emg-card-name">{item.name}</div>
                    <div class="emg-card-desc">{item.desc}</div>
                  </div>
                </a>
            {/each}
          </div>
          <div class="emg-card-footer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div class="emg-card-footer-text">Every call connects to a <strong>licensed RightFlush plumber</strong> — not a call centre. Available 24 hours.</div>
          </div>
        </div>
      </div>
    </div>
</section>

<section class="emg-proof" data-pixel-event="proof_section" data-pixel-label="Emergency proof section" data-pixel-delta="3" data-pixel-bucket="emergency">
    <div class="emg-proof-inner">
      <div class="emg-proof-grid reveal">
        <div class="emg-proof-stat">
          <div class="emg-proof-num">15<span>min</span></div>
          <div class="emg-proof-label">Response commitment</div>
        </div>
        <div class="emg-proof-stat">
          <div class="emg-proof-num">24<span>/7</span></div>
          <div class="emg-proof-label">Always available</div>
        </div>
        <div class="emg-proof-stat">
          <div class="emg-proof-num">6<span>yr</span></div>
          <div class="emg-proof-label">Serving Timmins</div>
        </div>
        <div class="emg-proof-stat">
          <div class="emg-proof-num">4.7<span>★</span></div>
          <div class="emg-proof-label">64 verified reviews</div>
        </div>
      </div>

      <div class="emg-testimonials">
        <div class="emg-testimonial reveal">
          <div class="emg-testimonial-stars">★★★★★</div>
          <p class="emg-testimonial-text">"Burst pipe at 11pm on a Sunday. Called RightFlush and they were at my door in under 20 minutes. Fixed it, cleaned up, price was exactly what they quoted."</p>
          <div class="emg-testimonial-attr"><div class="emg-testimonial-dot"></div><span class="emg-testimonial-name">Sarah T. · Timmins</span></div>
        </div>
        <div class="emg-testimonial reveal reveal-delay-1">
          <div class="emg-testimonial-stars">★★★★★</div>
          <p class="emg-testimonial-text">"No hot water on Christmas morning. One call and they had it sorted by noon. The owner came himself. That says everything."</p>
          <div class="emg-testimonial-attr"><div class="emg-testimonial-dot"></div><span class="emg-testimonial-name">Mark R. · South Porcupine</span></div>
        </div>
        <div class="emg-testimonial reveal reveal-delay-2">
          <div class="emg-testimonial-stars">★★★★★</div>
          <p class="emg-testimonial-text">"Sewage backup on a Saturday. I called three plumbers before RightFlush — all voicemail. These guys picked up on the second ring."</p>
          <div class="emg-testimonial-attr"><div class="emg-testimonial-dot"></div><span class="emg-testimonial-name">Lisa M. · Cochrane</span></div>
        </div>
      </div>
    </div>
</section>

<section class="section emg-steps" data-pixel-event="steps_section" data-pixel-label="What to do section" data-pixel-delta="2" data-pixel-bucket="emergency">
    <div class="section-inner">
      <div class="section-label rust reveal">While you wait</div>
      <h2 class="section-headline reveal">What to do right now</h2>
      <p class="section-sub reveal">While we're on our way — steps to protect your home in the next 15 minutes.</p>
      <div class="emg-steps-grid">
        <div class="emg-step reveal">
          <div class="emg-step-num">01</div>
          <div class="emg-step-content">
            <div class="emg-step-title">Shut off the water</div>
            <p class="emg-step-desc">Find your main water shutoff valve — usually in the basement near the foundation wall. Turn clockwise to close.</p>
          </div>
          <div class="emg-step-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
        </div>
        <div class="emg-step reveal reveal-delay-1">
          <div class="emg-step-num">02</div>
          <div class="emg-step-content">
            <div class="emg-step-title">Turn off the hot water</div>
            <p class="emg-step-desc">Gas water heater: set dial to Pilot. Electric: switch off the breaker marked Water Heater. Prevents dry burning.</p>
          </div>
          <div class="emg-step-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
        </div>
        <div class="emg-step reveal reveal-delay-2">
          <div class="emg-step-num">03</div>
          <div class="emg-step-content">
            <div class="emg-step-title">Move what you can</div>
            <p class="emg-step-desc">Get valuables, documents, and electronics off the floor. Water spreads fast — save what you can quickly.</p>
          </div>
          <div class="emg-step-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
        </div>
        <div class="emg-step reveal reveal-delay-3">
          <div class="emg-step-num">04</div>
          <div class="emg-step-content">
            <div class="emg-step-title">We're on our way</div>
            <p class="emg-step-desc">A licensed plumber is dispatched the moment you call. They'll confirm their ETA. Keep your phone close.</p>
          </div>
        </div>
      </div>
    </div>
</section>

<style>
.live-bar { background: var(--rust); padding: 10px 24px; }
.live-bar-inner { max-width: var(--col); margin: 0 auto; display: flex; align-items: center; gap: 20px; }
.live-indicator { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; animation: livePulse 1.5s infinite; }
@keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
.live-text { font-family: var(--cond); font-size: 13px; font-weight: 700; color: #fff; text-transform: uppercase; }
.live-divider { width: 1px; height: 16px; background: rgba(255,255,255,0.3); }
.live-detail { font-size: 13px; color: rgba(255,255,255,0.85); }
.live-clock { font-family: var(--cond); font-size: 14px; font-weight: 700; color: #fff; margin-left: auto; }

.emg-hero { background: var(--ink); position: relative; overflow: hidden; min-height: 80vh; display: flex; align-items: center; padding: 64px 24px; }
.emg-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 60% 40%, rgba(194,74,30,0.2) 0%, transparent 55%); }
.emg-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px); background-size: 60px 60px; }
.emg-hero-inner { position: relative; z-index: 2; max-width: var(--col); margin: 0 auto; display: grid; grid-template-columns: 1fr 420px; gap: 64px; align-items: center; }
.emg-hero-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(194,74,30,0.2); border: 1px solid rgba(194,74,30,0.5); border-radius: 100px; padding: 6px 14px; font-size: 12px; font-weight: 700; color: #fff; text-transform: uppercase; margin-bottom: 28px; }
.emg-hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--rust); animation: livePulse 1.2s infinite; }
.emg-hero-headline { font-family: var(--cond); font-weight: 900; font-size: clamp(52px, 7vw, 96px); line-height: 0.88; text-transform: uppercase; color: #fff; margin-bottom: 28px; }
.emg-hero-headline em { font-style: normal; color: var(--rust); }
.emg-hero-headline .dim { color: rgba(255,255,255,0.28); }
.emg-hero-sub { font-size: 18px; font-weight: 300; color: rgba(255,255,255,0.6); line-height: 1.65; max-width: 480px; margin-bottom: 44px; }

.emg-call-btn { display: inline-flex; align-items: center; gap: 12px; background: var(--rust); color: #fff; font-family: var(--cond); font-weight: 900; font-size: clamp(28px, 4vw, 40px); padding: 18px 32px; border-radius: var(--radius); text-decoration: none; box-shadow: 0 8px 32px rgba(194,74,30,0.4); transition: transform 0.2s; }
.emg-call-btn:hover { transform: translateY(-2px); }
.emg-call-btn svg { width: 28px; height: 28px; }
.emg-call-or { font-size: 13px; color: rgba(255,255,255,0.25); margin-left: 16px; }

.emg-commitment { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius); padding: 14px 18px; margin: 32px 0; }
.emg-commitment svg { width: 20px; height: 20px; stroke: var(--gold); }
.emg-commitment-text { font-size: 14px; color: rgba(255,255,255,0.7); }

.emg-callback-link { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(255,255,255,0.45); background: none; border: none; cursor: pointer; transition: color 0.2s; }
.emg-callback-link:hover { color: #fff; }
.emg-callback-form { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius); padding: 20px; margin-top: 16px; }
.emg-form-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; margin-bottom: 8px; display: block; }
.emg-form-input { width: 100%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: var(--radius); padding: 12px 16px; color: #fff; outline: none; margin-bottom: 10px; }
.emg-form-submit { width: 100%; background: var(--rust); color: #fff; border: none; border-radius: var(--radius); padding: 14px; font-family: var(--cond); font-weight: 700; text-transform: uppercase; cursor: pointer; }

.emg-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; backdrop-filter: blur(4px); }
.emg-card-title { font-family: var(--cond); font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 20px; }
.emg-card-item { display: flex; align-items: flex-start; gap: 14px; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.06); text-decoration: none; transition: all 0.2s; }
.emg-card-item:hover { background: rgba(255,255,255,0.02); padding-left: 8px; }
.emg-card-icon { width: 40px; height: 40px; border-radius: 8px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.emg-card-icon svg { width: 20px; height: 20px; stroke: rgba(255,255,255,0.6); }
.emg-card-name { font-family: var(--cond); font-size: 17px; font-weight: 700; color: #fff; text-transform: uppercase; margin-bottom: 4px; }
.emg-card-desc { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.4; }
.emg-card-footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 10px; }
.emg-card-footer svg { width: 16px; height: 16px; stroke: var(--gold); }
.emg-card-footer-text { font-size: 12px; color: rgba(255,255,255,0.4); }

.emg-proof { background: var(--surface); padding: 72px 24px; }
.emg-proof-inner { max-width: var(--col); margin: 0 auto; }
.emg-proof-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 56px; }
.emg-proof-stat { background: var(--white); padding: 32px 28px; text-align: center; }
.emg-proof-num { font-family: var(--cond); font-weight: 900; font-size: 52px; color: var(--ink); line-height: 1; margin-bottom: 6px; }
.emg-proof-num span { color: var(--rust); }
.emg-proof-label { font-size: 12px; color: var(--text3); text-transform: uppercase; font-weight: 600; }

.emg-testimonials { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.emg-testimonial { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; }
.emg-testimonial-stars { color: var(--gold); font-size: 13px; letter-spacing: 2px; margin-bottom: 12px; }
.emg-testimonial-text { font-size: 14px; color: var(--text2); line-height: 1.65; margin-bottom: 16px; font-style: italic; }
.emg-testimonial-attr { display: flex; align-items: center; gap: 8px; }
.emg-testimonial-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--rust); }
.emg-testimonial-name { font-size: 12px; color: var(--text3); font-weight: 600; text-transform: uppercase; }

.section-label.rust { color: var(--rust); }
.section-label.rust::before { background: var(--rust); }
.emg-steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
.emg-step { position: relative; }
.emg-step-num { font-family: var(--cond); font-size: 64px; font-weight: 900; color: var(--rust-lt); line-height: 1; margin-bottom: -12px; }
.emg-step-content { position: relative; z-index: 1; }
.emg-step-title { font-family: var(--cond); font-weight: 700; font-size: 19px; color: var(--ink); text-transform: uppercase; margin-bottom: 8px; }
.emg-step-desc { font-size: 14px; color: var(--text2); line-height: 1.65; }
.emg-step-arrow { position: absolute; top: 32px; right: -16px; width: 32px; display: flex; align-items: center; }
.emg-step-arrow svg { width: 20px; height: 20px; stroke: var(--border); }

@media (max-width: 1024px) {
  .emg-hero-inner { grid-template-columns: 1fr; gap: 48px; }
  .emg-proof-grid { grid-template-columns: repeat(2, 1fr); }
  .emg-testimonials { grid-template-columns: 1fr 1fr; }
  .emg-steps-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
    .emg-testimonials { grid-template-columns: 1fr; }
    .emg-steps-grid { grid-template-columns: 1fr; }
    .live-clock { display: none; }
}
</style>
