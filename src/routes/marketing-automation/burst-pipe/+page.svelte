<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel, captureIdentity } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    let clockTime = $state('00:00:00');
    let callbackFormOpen = $state(false);
    let cbName = $state('');
    let cbPhone = $state('');
    let cbIssue = $state('');

    onMount(() => {
        firePixel('page_load', 'Page Visited - Burst Pipe', 20, 'emergency');

        const updateClock = () => {
            const now = new Date();
            clockTime = now.toLocaleTimeString('en-GB', { hour12: false });
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    });

    function toggleCallback() {
        callbackFormOpen = !callbackFormOpen;
        if (callbackFormOpen) firePixel('callback_open', 'Callback form opened', 12, 'emergency');
    }

    function submitCallback() {
        if (!cbName || !cbPhone) {
            alert('Please provide your name and phone number.');
            return;
        }
        captureIdentity('callback_submit', 'Callback submitted', 20, 'emergency', { name: cbName, phone: cbPhone });
        alert('Request sent — we\'ll call within 15 minutes ✓');
        callbackFormOpen = false;
    }
</script>

<svelte:head>
  <title>Burst Pipe &amp; Flooding Timmins — Emergency Plumber | RightFlush Plumbing</title>
  <meta name="description" content="Burst pipe or flooding in Timmins? RightFlush Plumbing responds 24/7. 15-minute response commitment. We answer every call — no voicemail. (705) 700-1234.">
</svelte:head>

<div class="live-bar">
    <div class="live-bar-inner">
      <div class="live-dot"></div>
      <span class="live-text">We're available now</span>
      <div class="live-divider"></div>
      <span class="live-detail">Emergency line — answered within 15 minutes · (705) 700-1234</span>
      <span class="live-clock">{clockTime}</span>
    </div>
</div>

<section class="bp-hero">
    <div class="bp-hero-bg"></div>
    <div class="bp-hero-grid"></div>
    <div class="bp-hero-inner">
      <div>
        <div class="bp-hero-tag reveal visible"><div class="bp-hero-tag-dot"></div>Burst Pipe &amp; Flooding · Timmins, Ontario</div>
        <h1 class="bp-hero-headline reveal reveal-delay-1 visible">
          Water going<br>
          <em>everywhere.</em><br>
          <span class="dim">We stop it.</span>
        </h1>
        <p class="bp-hero-sub reveal reveal-delay-2 visible">Burst pipe, active flooding, water coming through the ceiling — RightFlush Plumbing dispatches immediately. 15-minute response commitment. A licensed plumber — not an answering service.</p>

        <div class="bp-call-label reveal reveal-delay-3 visible">Call now — we pick up</div>
        <a href="tel:7057001234" class="bp-call-btn reveal reveal-delay-3 visible" onclick={() => firePixel('hero_call', 'Call CTA — hero', 20, 'emergency')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 15z"/></svg>
          (705) 700-1234
        </a>

        <div class="bp-commitment reveal reveal-delay-4 visible">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <div class="bp-commitment-text"><strong>15-minute response commitment.</strong> Dispatched the moment you call. The owner answers emergency calls personally. 24 hours a day, 365 days a year.</div>
        </div>

        <button class="bp-callback-toggle reveal reveal-delay-4 visible" onclick={toggleCallback}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {callbackFormOpen ? '↑ Hide callback form' : 'Can\'t call right now? Request a callback'}
        </button>

        {#if callbackFormOpen}
            <div class="bp-callback-form open">
              <label class="bp-form-label">Your name</label>
              <input class="bp-form-input" type="text" placeholder="First name" bind:value={cbName}>
              <label class="bp-form-label">Your phone number</label>
              <input class="bp-form-input" type="tel" placeholder="(705) 000-0000" bind:value={cbPhone}>
              <label class="bp-form-label">What's happening?</label>
              <input class="bp-form-input" type="text" placeholder="e.g. burst pipe in basement, water coming through ceiling" bind:value={cbIssue}>
              <button class="bp-form-submit" onclick={submitCallback}>Request callback — we'll call within 15 minutes</button>
            </div>
        {/if}
      </div>

      <div class="reveal reveal-delay-2 visible">
        <div class="bp-hero-card">
          <div class="bp-card-header"><div class="bp-card-title">What's happening?</div></div>
          <div class="bp-problem-list">
            {#each [
                { name: 'Burst pipe', desc: 'Water spraying or running fast — shut off the main first, then call', icon: 'M12 12H5a4 4 0 0 1 0-8h14 M12 12h7a4 4 0 0 1 0 8H5' },
                { name: 'Flooding inside the home', desc: 'Water accumulating on floors — we dispatch immediately', icon: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' },
                { name: 'Water through the ceiling', desc: 'Leak from upstairs bathroom, roof, or pipe above', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
                { name: 'Frozen or suspected frozen pipe', desc: 'No water flow in winter — thaw carefully or call us first', icon: 'M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07' },
                { name: 'Sewage backup', desc: 'Raw sewage in the home — health emergency, call now', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z L12 9v4 L12 17v0.01' }
            ] as prob (prob.name)}
                <a href="tel:7057001234" class="bp-problem" onclick={() => firePixel('problem_click', 'Problem: ' + prob.name, 20, 'emergency')}>
                  <div class="bp-problem-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d={prob.icon}/></svg></div>
                  <div><div class="bp-problem-name">{prob.name}</div><div class="bp-problem-desc">{prob.desc}</div></div>
                </a>
            {/each}
          </div>
          <div class="bp-card-footer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div class="bp-card-footer-text">Every call connects to a <strong>licensed RightFlush plumber</strong> — not a call centre. The owner answers emergencies personally.</div>
          </div>
        </div>
      </div>
    </div>
</section>

<section class="bp-steps" data-pixel-event="steps_view" data-pixel-label="What to do section" data-pixel-delta="3" data-pixel-bucket="emergency">
    <div class="bp-steps-inner">
      <div class="section-label reveal visible">While we're on the way</div>
      <h2 class="section-headline reveal visible">What to do right now.</h2>
      <p class="section-sub reveal visible">Steps to protect your home in the next 15 minutes while a plumber is dispatched.</p>
      <div class="bp-steps-grid">
        {#each [
            { num: '01', title: 'Shut off the main water valve', desc: 'The main shutoff is usually in the basement near the foundation wall or where the water line enters the house. Turn it clockwise until it stops. This cuts water to the entire home and stops active flooding immediately.', tag: 'Do this first' },
            { num: '02', title: 'Turn off the hot water tank', desc: 'Gas heater: turn the dial to Pilot. Electric: switch off the breaker marked Water Heater. Prevents the tank from running dry and burning out. Takes 30 seconds and saves a costly repair.' },
            { num: '03', title: 'Get valuables off the floor', desc: 'Documents, electronics, furniture, stored boxes — move them up or out of the affected area. Water spreads faster than it looks. Five minutes of moving things now saves hours of dealing with water damage later.' },
            { num: '04', title: 'We\'re on our way', desc: 'A licensed plumber is dispatched the moment you call. They\'ll confirm their ETA and call when they\'re 5 minutes out. Keep your phone close. If the situation changes while we\'re en route, call back immediately.' }
        ] as step, i (i)}
          <div class="bp-step reveal visible" style="transition-delay: {i * 0.1}s">
            <div class="bp-step-num">{step.num}</div>
            <div class="bp-step-content">
              {#if step.tag}<div class="bp-step-urgent">{step.tag}</div>{/if}
              <div class="bp-step-title">{step.title}</div>
              <p class="bp-step-desc">{step.desc}</p>
            </div>
            {#if i < 3}
                <div class="bp-step-arrow"><svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
</section>

<style>
.live-bar { background: var(--rust); padding: 0; }
.live-bar-inner { max-width: var(--col); margin: 0 auto; display: flex; align-items: center; gap: 20px; padding: 10px 24px; flex-wrap: wrap; }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; animation: livePulse 1.5s ease-in-out infinite; flex-shrink: 0; }
@keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
.live-text { font-family: var(--cond); font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 0.1em; text-transform: uppercase; }
.live-divider { width: 1px; height: 16px; background: rgba(255,255,255,0.3); flex-shrink: 0; }
.live-detail { font-size: 13px; color: rgba(255,255,255,0.85); }
.live-clock { font-family: var(--cond); font-size: 14px; font-weight: 700; color: #fff; margin-left: auto; flex-shrink: 0; }

.bp-hero {
  background: var(--ink); position: relative; overflow: hidden;
  min-height: calc(80vh);
  display: flex; flex-direction: column; justify-content: center;
}
.bp-hero-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 65% 40%,rgba(194,74,30,0.22) 0%,transparent 55%),
    radial-gradient(ellipse at 5% 80%,rgba(184,134,42,0.05) 0%,transparent 40%);
}
.bp-hero-grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px);
  background-size: 60px 60px;
}
.bp-hero-inner { position: relative; z-index: 2; max-width: var(--col); margin: 0 auto; width: 100%; padding: 72px 24px; display: grid; grid-template-columns: 1fr 420px; gap: 64px; align-items: center; }

.bp-hero-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(194,74,30,0.2); border: 1px solid rgba(194,74,30,0.5); border-radius: 100px; padding: 6px 14px; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.9); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 28px; }
.bp-hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--rust); animation: livePulse 1.2s infinite; }
.bp-hero-headline { font-family: var(--cond); font-weight: 900; font-size: clamp(52px, 7vw, 96px); line-height: 0.88; text-transform: uppercase; color: #fff; margin-bottom: 28px; }
.bp-hero-headline em { font-style: normal; color: var(--rust); display: block; }
.bp-hero-headline .dim { color: rgba(255,255,255,0.25); }
.bp-hero-sub { font-size: 18px; font-weight: 300; color: rgba(255,255,255,0.6); line-height: 1.65; max-width: 480px; margin-bottom: 40px; }

.bp-call-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.35); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
.bp-call-btn { display: inline-flex; align-items: center; gap: 14px; background: var(--rust); color: #fff; font-family: var(--cond); font-weight: 900; font-size: clamp(28px, 4vw, 42px); letter-spacing: 0.02em; padding: 18px 32px; border-radius: var(--radius); text-decoration: none; transition: all 0.2s; box-shadow: 0 8px 32px rgba(194,74,30,0.4); margin-bottom: 24px; width: fit-content; }
.bp-call-btn:hover { transform: translateY(-2px); }
.bp-call-btn svg { width: 28px; height: 28px; stroke: currentColor; fill: none; stroke-width: 2; flex-shrink: 0; }

.bp-commitment { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius); padding: 14px 18px; margin-bottom: 28px; }
.bp-commitment svg { width: 20px; height: 20px; stroke: var(--gold); fill: none; stroke-width: 2; flex-shrink: 0; }
.bp-commitment-text { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.4; }
.bp-commitment-text strong { color: #fff; }

.bp-callback-toggle { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.4); cursor: pointer; background: none; border: none; padding: 0; transition: color 0.2s; }
.bp-callback-toggle:hover { color: rgba(255,255,255,0.7); }
.bp-callback-toggle svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2; }

.bp-callback-form { margin-top: 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius); padding: 20px; animation: slideDown 0.3s ease; }
@keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
.bp-form-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 7px; display: block; }
.bp-form-input { width: 100%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: var(--radius); padding: 12px 14px; font-size: 14px; font-family: inherit; color: #fff; outline: none; margin-bottom: 10px; }
.bp-form-submit { width: 100%; background: var(--rust); color: #fff; border: none; border-radius: var(--radius); padding: 13px; font-family: var(--cond); font-weight: 700; font-size: 15px; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; }

.bp-hero-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; }
.bp-card-header { padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.bp-card-title { font-family: var(--cond); font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.35); letter-spacing: 0.1em; text-transform: uppercase; }
.bp-problem-list { display: flex; flex-direction: column; }
.bp-problem { display: flex; align-items: flex-start; gap: 14px; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; cursor: pointer; transition: all 0.2s; }
.bp-problem:last-child { border-bottom: none; }
.bp-problem:hover { background: rgba(194,74,30,0.12); padding-left: 24px; }
.bp-problem-icon { width: 38px; height: 38px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
.bp-problem:hover .bp-problem-icon { background: rgba(194,74,30,0.3); border-color: rgba(194,74,30,0.5); }
.bp-problem-icon svg { width: 18px; height: 18px; stroke: rgba(255,255,255,0.5); fill: none; stroke-width: 1.75; }
.bp-problem-name { font-family: var(--cond); font-size: 15px; font-weight: 700; color: #fff; text-transform: uppercase; margin-bottom: 3px; }
.bp-problem-desc { font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.4; }
.bp-card-footer { padding: 14px 20px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 8px; }
.bp-card-footer svg { width: 14px; height: 14px; stroke: var(--gold); fill: none; stroke-width: 2; flex-shrink: 0; }
.bp-card-footer-text { font-size: 11px; color: rgba(255,255,255,0.35); line-height: 1.4; }

.bp-steps { background: var(--white); padding: 80px 24px; }
.bp-steps-inner { max-width: var(--col); margin: 0 auto; }
.section-label { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: var(--rust); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; }
.section-label::before { content: ''; display: block; width: 20px; height: 2px; background: var(--rust); }
.section-headline { font-family: var(--cond); font-weight: 800; font-size: clamp(34px, 4.5vw, 54px); line-height: 0.95; text-transform: uppercase; color: var(--ink); margin-bottom: 16px; }
.section-sub { font-size: 17px; font-weight: 300; color: var(--text2); line-height: 1.7; max-width: 580px; margin-bottom: 48px; }
.bp-steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
.bp-step { position: relative; }
.bp-step-num { font-family: var(--cond); font-size: 60px; font-weight: 900; color: var(--rust-lt); line-height: 1; margin-bottom: -10px; }
.bp-step-content { position: relative; z-index: 1; }
.bp-step-title { font-family: var(--cond); font-weight: 700; font-size: 18px; color: var(--ink); text-transform: uppercase; margin-bottom: 8px; }
.bp-step-desc { font-size: 13px; color: var(--text2); line-height: 1.65; }
.bp-step-urgent { display: inline-block; font-size: 11px; font-weight: 700; color: var(--rust); background: var(--rust-lt); border-radius: 100px; padding: 3px 10px; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
.bp-step-arrow { position: absolute; top: 30px; right: -16px; width: 32px; display: flex; align-items: center; z-index: 2; }
.bp-step-arrow svg { width: 20px; height: 20px; stroke: var(--border); fill: none; stroke-width: 2; stroke-linecap: round; }

@media (max-width: 1024px) {
    .bp-hero-inner { grid-template-columns: 1fr; }
    .bp-steps-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
    .bp-steps-grid { grid-template-columns: 1fr; }
    .live-clock { display: none; }
}
</style>
