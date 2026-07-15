<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { firePixel, extractFormIdentity } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';
    import { servicesData } from '$lib/components/marketing-automation/rightflush/servicesData';

    let serviceKey = $derived(page.params.service);
    let s = $derived(servicesData[serviceKey] || servicesData['hot-water']);

    let fjNote = $state('');
    let fjName = $state('');
    let fjPhone = $state('');
    let fjFormEl: HTMLElement | null = null;

    let aptName = $state('');
    let aptPhone = $state('');
    let aptFormEl: HTMLElement | null = null;

    const splitOnBreaks = (value?: string) =>
      value ? value.split(/<br\s*\/?>/i).map((line) => line.trim()).filter(Boolean) : [];

    const parseEmphasis = (line: string) => {
      const match = line.match(/<em>(.*?)<\/em>/i);
      return {
        text: match ? match[1].trim() : line.replace(/<\/?em>/gi, '').trim(),
        emphasize: Boolean(match)
      };
    };

    const headlineLines = $derived.by(() => splitOnBreaks(s?.headline).map(parseEmphasis));
    const scopeHeadlineLines = $derived.by(() => splitOnBreaks(s?.scopeHeadline));
    const fjHeadlineLines = $derived.by(() => splitOnBreaks(s?.fjHeadline));
    const howItWorksLines = ['Simple process.', 'Flat-rate price.'];
    const estimateLines = ['Free estimate.', 'Flat-rate price.'];

    onMount(() => {
        if (s) {
            firePixel('page_load', 'Page Visited - ' + s.title, 4, s.pixelBucket);
        }
    });

    function scrollToApt() {
        document.getElementById('aptSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function submitFJ() {
        if (!fjName || !fjPhone) {
            alert('Please provide your name and phone number.');
            return;
        }
        extractFormIdentity(fjFormEl, 'fj_submit', 'FotoJobber: submitted', 15, 'active');
        alert('Received — quote within 2 hours ✓');
    }

    function submitApt() {
        if (!aptName || !aptPhone) {
            alert('Please provide your name and phone number.');
            return;
        }
        extractFormIdentity(aptFormEl, 'apt_submit', 'Appointment: booked', 20, 'active');
        alert('Booked — confirmed within 2 hours ✓');
    }
</script>

<svelte:head>
  <title>{s.title}</title>
  <meta name="description" content={s.desc}>
</svelte:head>

<!-- HERO -->
<section class="svc-hero">
  <div class="svc-hero-bg"></div>
  <div class="svc-hero-grid"></div>
  <div class="svc-hero-inner">
    <div>
      <div class="svc-hero-badge reveal visible"><div class="svc-hero-badge-dot"></div>{s.badge}</div>
      <h1 class="svc-hero-headline reveal reveal-delay-1 visible">
        {#each headlineLines as line, i (i)}
          {#if line.emphasize}
            <em class="line">{line.text}</em>
          {:else}
            <span class="line">{line.text}</span>
          {/if}
        {/each}
      </h1>
      <p class="svc-hero-sub reveal reveal-delay-2 visible">{s.sub}</p>
      <div class="svc-hero-actions reveal reveal-delay-3 visible">
        <button class="svc-hero-cta" onclick={scrollToApt}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Book free estimate
        </button>
        <a href="tel:7057001234" class="svc-hero-cta secondary" onclick={() => firePixel('hero_call', 'Hero: call button', 15, 'active')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 15z"/></svg>
          (705) 700-1234
        </a>
      </div>
    </div>
    <div class="svc-facts-card reveal reveal-delay-1 visible">
      <div class="svc-facts-title">What to know</div>
      <div class="svc-facts-list">
        {#each s.facts as fact (fact)}
          <div class="svc-fact">
            <div class="svc-fact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">{@html fact.icon}</svg></div>
            <div><div class="svc-fact-label">{fact.label}</div><div class="svc-fact-sub">{fact.sub}</div></div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- SCOPE -->
<section class="section section-surface" data-pixel-event="scope_view" data-pixel-label="Scope section viewed" data-pixel-delta="5">
  <div class="section-inner">
    <div class="section-label reveal visible">{s.scopeLabel}</div>
    <h2 class="section-headline reveal visible">
      {#each scopeHeadlineLines as line, i (i)}
        <span class="line">{line}</span>
      {/each}
    </h2>
    <p class="section-sub reveal visible">{s.scopeSub}</p>
    <div class="svc-scope-grid">
      {#each s.scope as item, i (i)}
        <div class="svc-scope-card reveal visible" style="transition-delay: {i * 0.1}s">
          <div class="svc-scope-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">{@html item.icon}</svg></div>
          <div class="svc-scope-name">{item.name}</div>
          <p class="svc-scope-desc">{item.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section">
  <div class="section-inner">
    <div class="section-label reveal visible">How it works</div>
    <h2 class="section-headline reveal visible">
      {#each howItWorksLines as line, i (i)}
        <span class="line">{line}</span>
      {/each}
    </h2>
    <p class="section-sub reveal visible">Four steps from your first contact to a completed job — with the price agreed before we start.</p>
    <div class="svc-steps-grid">
      {#each [
        { num: '01', title: 'Contact us', desc: 'Call, submit a FotoJobber photo, or book online. We respond same day. Emergencies within 15 minutes.' },
        { num: '02', title: 'We assess', desc: 'A licensed plumber visits your home. We look at the job, ask what you need, and give you a flat-rate price before touching anything.' },
        { num: '03', title: 'Work completed', desc: 'We do the job to a professional standard. We clean up after ourselves and explain everything we did.' },
        { num: '04', title: 'Guaranteed', desc: 'Every job is backed by our workmanship guarantee. If something isn\'t right we come back and fix it. No charge.' }
      ] as step, i (i)}
        <div class="svc-step reveal visible" style="transition-delay: {i * 0.1}s">
          <div class="svc-step-num">{step.num}</div>
          <div class="svc-step-content">
            <div class="svc-step-title">{step.title}</div>
            <p class="svc-step-desc">{step.desc}</p>
          </div>
          {#if i < 3}
            <div class="svc-step-arrow"><svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- FOTOJOBBER BAND -->
{#if s.hasFotoJobber}
<div class="fj-band">
  <div class="fj-band-inner">
    <div class="reveal visible">
      <div class="section-label">FotoJobber</div>
      <h2 class="section-headline">
        {#each fjHeadlineLines as line, i (i)}
          <span class="line">{line}</span>
        {/each}
      </h2>
      <p class="section-sub">{s.fjSub}</p>
      <div class="fj-features">
        <div class="fj-feature">
          <div class="fj-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
          <div><div class="fj-feature-title">Photo + annotation</div><div class="fj-feature-desc">Show us exactly what needs attention. Circle the issue, add a note.</div></div>
        </div>
        <div class="fj-feature">
          <div class="fj-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
          <div><div class="fj-feature-title">Quote in 2 hours</div><div class="fj-feature-desc">We review and send back a detailed flat-rate quote. No visit needed.</div></div>
        </div>
      </div>
    </div>
    <div class="reveal reveal-delay-1 visible">
      <div class="fj-band-tool">
        <div class="fj-band-header">
          <div class="fj-band-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
          <div class="fj-band-title">FotoJobber — Send a photo</div>
        </div>
        <div class="fj-band-body" bind:this={fjFormEl}>
          <div class="fj-zone" onclick={() => firePixel('fj_photo_click', 'FotoJobber: photo zone clicked', 10, 'active')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <div class="fj-zone-title">Tap to take or upload a photo</div>
            <div class="fj-zone-sub">Show us what needs attention</div>
          </div>
          <input class="fj-note-input" type="text" placeholder="Describe the issue or what you need done" bind:value={fjNote} onfocus={() => firePixel('fj_note_focus', 'FotoJobber: annotation focused', 6, 'active')}>
          <div class="fj-row">
            <input class="fj-input" type="text" placeholder="Your name" bind:value={fjName} onfocus={() => firePixel('fj_name_focus', 'FotoJobber: name focused', 8, 'active')}>
            <input class="fj-input" type="tel" placeholder="(705) 000-0000" bind:value={fjPhone} onfocus={() => firePixel('fj_phone_focus', 'FotoJobber: phone focused', 12, 'active')}>
          </div>
          <button class="fj-send" onclick={submitFJ}>Send for quote — reply in 2 hours</button>
        </div>
      </div>
    </div>
  </div>
</div>
{/if}

<!-- APPOINTMENT BAND -->
<section class="apt-band" id="aptSection">
  <div class="apt-band-inner">
    <div class="reveal visible">
      <div class="section-label white-op">Book on-site estimate</div>
      <h2 class="section-headline white">
        {#each estimateLines as line, i (i)}
          <span class="line">{line}</span>
        {/each}
      </h2>
      <p class="section-sub white">A licensed RightFlush plumber visits, assesses the job, and gives you a price before starting anything. Confirmed within 2 hours of your request.</p>
      <div class="apt-trust-points">
        <div class="apt-trust-item">
          <div class="apt-trust-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div><div class="apt-trust-title">Free on all jobs over $500</div><div class="apt-trust-desc">No call-out charge for estimates on larger work.</div></div>
        </div>
        <div class="apt-trust-item">
          <div class="apt-trust-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div><div class="apt-trust-title">Workmanship guarantee</div><div class="apt-trust-desc">If something isn't right after we leave, we come back. No charge.</div></div>
        </div>
      </div>
    </div>
    <div class="reveal reveal-delay-1 visible">
      <div class="apt-form" bind:this={aptFormEl}>
        <div class="apt-form-title">Book estimate</div>
        <div class="apt-field">
          <label class="apt-label">Name</label>
          <input class="apt-input" type="text" placeholder="Your name" bind:value={aptName}>
        </div>
        <div class="apt-field">
          <label class="apt-label">Phone</label>
          <input class="apt-input" type="tel" placeholder="(705) 000-0000" bind:value={aptPhone}>
        </div>
        <button class="apt-btn" onclick={submitApt}>Book free estimate</button>
        <div class="apt-note">Confirmed within 2 hours · Free · No obligation</div>
      </div>
    </div>
  </div>
</section>

<!-- PROOF -->
<div class="proof-band" data-pixel-event="proof_view" data-pixel-label="Proof section" data-pixel-delta="5">
  <div class="section-inner">
    <div class="proof-band-inner">
      {#each s.proof as p, i (i)}
        <div class="proof-card reveal visible" style="transition-delay: {i * 0.1}s">
          <div class="proof-stars">{p.stars}</div>
          <p class="proof-text">{p.text}</p>
          <div class="proof-attr"><div class="proof-dot"></div><span class="proof-name">{p.name} · Google Review</span></div>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- EMERGENCY BAND -->
<div class="emg-band">
  <div class="emg-band-inner">
    <div class="emg-band-left">
      <div class="emg-band-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
      <div class="emg-band-text">
        <h3>{s.emgTitle}</h3>
        <p>{s.emgSub}</p>
      </div>
    </div>
    <a href="tel:7057001234" class="emg-band-cta" onclick={() => firePixel('emg_call', 'Emergency band: call', 15, 'emergency')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.94-1.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 15z"/></svg>
      Call (705) 700-1234
    </a>
  </div>
</div>

<!-- RELATED SERVICES -->
<div class="related-section">
  <div class="related-inner">
    <div class="related-label">Related services</div>
    <div class="related-grid">
      {#each s.related as r, i (i)}
        <a href={r.href} class="related-card" onclick={() => firePixel('related_click', 'Related: ' + r.name, 5, 'active')}>
          <div class="related-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">{@html r.icon}</svg></div>
          <div class="related-name">{r.name}</div>
          <div class="related-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
/* ── HERO ── */
.svc-hero { background:var(--ink); position:relative; overflow:hidden; padding:72px 24px 64px; min-height: 60vh; display: flex; align-items: center; }
.svc-hero-bg { position:absolute; inset:0; background:radial-gradient(ellipse at 70% 50%,rgba(27,94,59,0.18) 0%,transparent 60%),radial-gradient(ellipse at 10% 80%,rgba(245,124,34,0.05) 0%,transparent 40%); }
.svc-hero-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px); background-size:60px 60px; }
.svc-hero-inner { position:relative; z-index:2; max-width:var(--col); margin:0 auto; display:grid; grid-template-columns:1fr 400px; gap:56px; align-items:center; width: 100%; }
.svc-hero-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(27,94,59,0.25); border:1px solid rgba(27,94,59,0.4); border-radius:100px; padding:5px 14px; font-size:11px; font-weight:700; color:rgba(255,255,255,0.75); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:20px; }
.svc-hero-badge-dot { width:5px; height:5px; border-radius:50%; background:#4ade80; animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
.svc-hero-headline { font-family:var(--cond); font-weight:900; font-size:clamp(48px,6.5vw,88px); line-height:0.88; text-transform:uppercase; color:#fff; margin-bottom:24px; }
.svc-hero-headline em { font-style:normal; color:var(--gold); display:block; }
.svc-hero-headline .line { display:block; }
.section-headline .line { display:block; }
.svc-hero-sub { font-size:17px; font-weight:300; color:rgba(255,255,255,0.6); line-height:1.65; margin-bottom:36px; max-width:480px; }
.svc-hero-actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.svc-hero-cta { display:inline-flex; align-items:center; gap:8px; background:var(--green); color:#fff; font-family:var(--cond); font-weight:700; font-size:16px; letter-spacing:0.05em; text-transform:uppercase; padding:14px 26px; border-radius:var(--radius); border:none; text-decoration:none; transition:background 0.2s; cursor:pointer; }
.svc-hero-cta:hover { background:var(--green-mid); }
.svc-hero-cta svg { width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2.5; }
.svc-hero-cta.secondary { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:rgba(255,255,255,0.8); }
.svc-hero-cta.secondary:hover { background:rgba(255,255,255,0.14); }

.svc-facts-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:28px; }
.svc-facts-title { font-size:10px; font-weight:700; color:rgba(255,255,255,0.35); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:16px; }
.svc-fact { display:flex; align-items:flex-start; gap:12px; padding:13px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
.svc-fact:last-child { border-bottom:none; padding-bottom:0; }
.svc-fact-icon { width:32px; height:32px; border-radius:8px; background:rgba(27,94,59,0.3); border:1px solid rgba(27,94,59,0.4); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.svc-fact-icon svg { width:16px; height:16px; stroke:#4ade80; }
.svc-fact-label { font-family:var(--cond); font-size:13px; font-weight:700; color:#fff; text-transform:uppercase; letter-spacing:0.03em; margin-bottom:2px; }
.svc-fact-sub { font-size:12px; color:rgba(255,255,255,0.4); line-height:1.4; }

.svc-scope-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.svc-scope-card { background:var(--white); border:1px solid var(--border); border-radius:var(--radius); padding:24px; transition:all 0.2s; }
.svc-scope-card:hover { border-color:var(--green); box-shadow:0 4px 16px rgba(0,0,0,0.06); }
.svc-scope-icon { width:40px; height:40px; border-radius:8px; background:var(--green-lt); display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
.svc-scope-icon svg { width:22px; height:22px; stroke:var(--green); }
.svc-scope-name { font-family:var(--cond); font-size:16px; font-weight:700; color:var(--ink); text-transform:uppercase; margin-bottom:8px; }
.svc-scope-desc { font-size:13px; color:var(--text2); line-height:1.65; }

.svc-steps-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:32px; }
.svc-step { position:relative; }
.svc-step-num { font-family:var(--cond); font-size:60px; font-weight:900; color:var(--green-lt); line-height:1; margin-bottom:-10px; }
.svc-step-title { font-family:var(--cond); font-weight:700; font-size:18px; color:var(--ink); text-transform:uppercase; margin-bottom:8px; }
.svc-step-desc { font-size:13px; color:var(--text2); line-height:1.65; }
.svc-step-arrow { position:absolute; top:30px; right:-16px; width:32px; display:flex; align-items:center; z-index: 2; }
.svc-step-arrow svg { width:20px; height:20px; stroke:var(--border); }

.fj-band { background:var(--surface); padding:72px 24px; }
.fj-band-inner { max-width:var(--col); margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
.fj-features { display:flex; flex-direction:column; gap:16px; }
.fj-feature { display:flex; align-items:flex-start; gap:14px; }
.fj-feature-icon { width:36px; height:36px; border-radius:8px; background:rgba(47,89,152,0.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.fj-feature-icon svg { width:18px; height:18px; stroke:var(--green); }
.fj-feature-title { font-family:var(--cond); font-size:15px; font-weight:700; color:var(--ink); text-transform:uppercase; margin-bottom:4px; }
.fj-feature-desc { font-size:13px; color:var(--text2); line-height:1.6; }

.fj-band-tool { background:var(--white); border:1px solid var(--border); border-radius:12px; overflow:hidden; }
.fj-band-header { background:var(--ink); padding:16px 20px; display:flex; align-items:center; gap:12px; }
.fj-band-icon svg { width:18px; height:18px; stroke:#fff; }
.fj-band-title { font-family:var(--cond); font-size:15px; font-weight:700; color:#fff; text-transform:uppercase; }
.fj-band-body { padding:24px; }
.fj-zone { border:2px dashed var(--border); border-radius:var(--radius); padding:36px 24px; text-align:center; cursor:pointer; transition:all 0.2s; margin-bottom:14px; }
.fj-zone:hover { border-color:var(--green); background:var(--green-lt); }
.fj-zone svg { width:36px; height:36px; stroke:var(--text3); margin:0 auto 12px; }
.fj-zone-title { font-family:var(--cond); font-weight:700; font-size:16px; color:var(--ink); text-transform:uppercase; margin-bottom:4px; }
.fj-zone-sub { font-size:12px; color:var(--text3); }
.fj-note-input { width:100%; border:1px solid var(--border); border-radius:var(--radius); padding:10px 14px; font-size:13px; font-family:inherit; outline:none; margin-bottom:10px; }
.fj-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px; }
.fj-input { border:1px solid var(--border); border-radius:var(--radius); padding:10px 14px; font-size:13px; font-family:inherit; outline:none; }
.fj-send { width:100%; background:var(--green); color:#fff; border:none; border-radius:var(--radius); padding:13px; font-family:var(--cond); font-weight:700; font-size:16px; text-transform:uppercase; cursor:pointer; }

.apt-band { background:var(--ink); padding:72px 24px; }
.apt-band-inner { max-width:var(--col); margin:0 auto; display:grid; grid-template-columns:1fr 440px; gap:64px; align-items:center; }
.white-op { color: rgba(255,255,255,0.4); }
.white-op::before { background: rgba(255,255,255,0.2) !important; }
.apt-trust-points { display:flex; flex-direction:column; gap:20px; margin-top: 32px; }
.apt-trust-item { display:flex; align-items:flex-start; gap:14px; }
.apt-trust-icon { width:38px; height:38px; border-radius:8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.apt-trust-icon svg { width:18px; height:18px; stroke:rgba(255,255,255,0.5); }
.apt-trust-title { font-family:var(--cond); font-size:15px; font-weight:700; color:#fff; text-transform:uppercase; margin-bottom:4px; }
.apt-trust-desc { font-size:13px; color:rgba(255,255,255,0.4); line-height:1.6; }

.apt-form { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:28px; }
.apt-form-title { font-family:var(--cond); font-size:20px; font-weight:700; color:#fff; text-transform:uppercase; margin-bottom:20px; }
.apt-field { margin-bottom: 12px; }
.apt-label { font-size:10px; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; margin-bottom:5px; display:block; }
.apt-input { width:100%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:var(--radius); padding:11px 14px; font-size:13px; font-family:inherit; color:#fff; outline:none; }
.apt-btn { width:100%; background:var(--green); color:#fff; border:none; border-radius:var(--radius); padding:14px; font-family:var(--cond); font-weight:700; font-size:16px; text-transform:uppercase; cursor:pointer; margin-top:8px; }
.apt-note { font-size:11px; color:rgba(255,255,255,0.3); text-align:center; margin-top:12px; }

.proof-band { background:var(--surface); padding:64px 24px; }
.proof-band-inner { max-width:var(--col); margin:0 auto; display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
.proof-card { background:var(--white); border:1px solid var(--border); border-radius:var(--radius); padding:24px; }
.proof-stars { color:var(--gold); font-size:13px; letter-spacing:2px; margin-bottom:12px; }
.proof-text { font-size:14px; color:var(--text2); line-height:1.7; margin-bottom:14px; font-style:italic; }
.proof-attr { display:flex; align-items:center; gap:8px; }
.proof-dot { width:6px; height:6px; border-radius:50%; background:var(--gold); }
.proof-name { font-size:11px; color:var(--text3); font-weight:600; text-transform:uppercase; }

.emg-band { background:var(--rust); padding:36px 24px; }
.emg-band-inner { max-width:var(--col); margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:32px; }
.emg-band-left { display:flex; align-items:center; gap:18px; }
.emg-band-icon { width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.emg-band-icon svg { width:26px; height:26px; stroke:#fff; }
.emg-band-text h3 { font-family:var(--cond); font-weight:800; font-size:28px; color:#fff; text-transform:uppercase; line-height:1; margin-bottom:4px; }
.emg-band-text p { font-size:14px; color:rgba(255,255,255,0.75); }
.emg-band-cta { display:inline-flex; align-items:center; gap:10px; background:#fff; color:var(--rust); font-family:var(--cond); font-weight:800; font-size:16px; text-transform:uppercase; padding:15px 28px; border-radius:var(--radius); text-decoration:none; white-space:nowrap; }

.related-section { background:var(--white); padding:64px 24px; border-top:1px solid var(--border); }
.related-inner { max-width:var(--col); margin:0 auto; }
.related-label { font-size:11px; font-weight:700; color:var(--green); letter-spacing:0.12em; text-transform:uppercase; margin-bottom:24px; display:flex; align-items:center; gap:8px; }
.related-label::before { content:''; display:block; width:20px; height:2px; background:var(--green); }
.related-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.related-card { border:1px solid var(--border); border-radius:var(--radius); padding:20px; display:flex; align-items:center; gap:14px; text-decoration:none; transition:all 0.2s; }
.related-card:hover { border-color:var(--green); background:var(--green-lt); }
.related-icon { width:36px; height:36px; border-radius:8px; background:var(--surface); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.related-icon svg { width:18px; height:18px; stroke:var(--green); }
.related-name { font-family:var(--cond); font-size:15px; font-weight:700; color:var(--ink); text-transform:uppercase; line-height:1.1; }
.related-arrow { margin-left:auto; }
.related-arrow svg { width:14px; height:14px; stroke:var(--text3); }

@media (max-width: 1024px) {
  .svc-hero-inner, .fj-band-inner, .apt-band-inner { grid-template-columns: 1fr; }
  .svc-scope-grid { grid-template-columns: repeat(2, 1fr); }
  .svc-steps-grid { grid-template-columns: repeat(2, 1fr); }
  .proof-band-inner { grid-template-columns: 1fr 1fr; }
  .related-grid { grid-template-columns: repeat(2, 1fr); }
  .emg-band-inner { flex-direction: column; text-align: center; }
  .emg-band-left { flex-direction: column; }
}
@media (max-width: 768px) {
  .svc-scope-grid, .svc-steps-grid, .proof-band-inner, .related-grid { grid-template-columns: 1fr; }
  .fj-row { grid-template-columns: 1fr; }
}
</style>
