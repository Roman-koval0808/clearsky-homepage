<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    onMount(() => {
        firePixel('page_load', 'Page Visited - Our Guarantee', 4, 'comparison');
    });
</script>

<svelte:head>
  <title>Our Guarantee &amp; Standards — RightFlush Plumbing Timmins</title>
  <meta name="description" content="RightFlush Plumbing guarantees every job in Timmins. Workmanship guarantee, flat-rate pricing, licensed and insured, 15-minute emergency response. Read what we commit to before we start.">
</svelte:head>

<section class="guar-hero">
    <div class="guar-hero-bg"></div>
    <div class="guar-hero-grid"></div>
    <div class="guar-hero-inner">
      <div class="reveal visible">
        <div class="guar-hero-label">Our Guarantee &amp; Standards</div>
        <h1 class="guar-hero-headline">What we<br>commit to<br><em>before we start.</em></h1>
        <p class="guar-hero-sub">Flat-rate pricing. Licensed plumbers. A workmanship guarantee you can actually rely on. These aren't marketing claims — they're the standards every RightFlush job is held to, without exception.</p>
        <a href="/marketing-automation/contact" class="guar-hero-cta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Book a free estimate</a>
      </div>
      <div class="reveal reveal-delay-1 visible">
        <div class="guar-shield-card">
          <div class="guar-shield-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div class="guar-shield-title">Guaranteed.</div>
          <div class="guar-shield-sub">Every job. Every plumber. Every time.</div>
          <div class="guar-shield-items">
            {#each [
                'Workmanship guaranteed — 1 year on installations',
                'Flat-rate pricing — quote before we start',
                'Licensed plumbers on every job',
                '15-minute emergency response',
                'No call-out fee on estimates over $500'
            ] as item}
                <div class="guar-shield-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>{item}</span></div>
            {/each}
          </div>
        </div>
      </div>
    </div>
</section>

<section class="guar-section guar-section-surface" data-pixel-event="guar_workmanship" data-pixel-label="Workmanship section" data-pixel-delta="6" data-pixel-bucket="comparison">
    <div class="guar-section-inner">
      <div class="guar-layout">
        <div class="reveal visible">
          <div class="section-label-green">Workmanship guarantee</div>
          <h2 class="section-headline">If it's not right,<br>we come back.</h2>
          <p class="section-sub">Every RightFlush installation is backed by a written workmanship guarantee. If something we installed fails due to our work — we return to fix it. No charge. No questions.</p>
          <p style="font-size:15px;color:var(--text2);line-height:1.7;">This covers defects in workmanship — how we installed something, how we connected it, how we sealed it. It does not cover manufacturer part failure, damage caused after we left, or normal wear and tear.</p>
        </div>
        <div class="reveal reveal-delay-1 visible">
          <div class="guar-detail-card">
            <div class="guar-detail-header">
              <div class="guar-detail-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <div class="guar-detail-title">Workmanship guarantee terms</div>
            </div>
            <div class="guar-detail-body">
              <div class="guar-detail-items">
                {#each [
                    { title: 'Installations — 1 year.', text: 'All plumbing installations including water heaters, fixtures, pipe work, and connections.' },
                    { title: 'Service calls — 90 days.', text: 'Repairs, drain clearing, diagnostics, and service work.' },
                    { title: 'Parts — manufacturer warranty.', text: 'Parts carry the original manufacturer warranty, which we register on your behalf.' },
                    { title: 'No charge callbacks.', text: 'If you call us about a guarantee issue, we diagnose it for free.' }
                ] as term}
                    <div class="guar-detail-item"><div class="guar-detail-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div><div class="guar-detail-text"><strong>{term.title}</strong> {term.text}</div></div>
                {/each}
              </div>
              <div class="guar-detail-note"><strong>The fine print, plainly:</strong> The guarantee covers our work, not parts that fail independently. Call us if you're ever unsure.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
</section>

<section class="guar-section guar-section-white" data-pixel-event="guar_pricing" data-pixel-label="Flat-rate pricing section" data-pixel-delta="6" data-pixel-bucket="comparison">
    <div class="guar-section-inner">
      <div class="guar-layout reverse">
        <div class="reveal visible">
          <div class="section-label-green">Flat-rate pricing</div>
          <h2 class="section-headline">The quote is<br>the invoice.</h2>
          <p class="section-sub">We price the job, not the hour. Before any work starts, you have a flat-rate price in writing. That number does not change unless the scope changes.</p>
        </div>
        <div class="reveal reveal-delay-1 visible">
          <div class="guar-detail-card">
            <div class="guar-detail-header" style="background:var(--ink);">
              <div class="guar-detail-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
              <div class="guar-detail-title">How flat-rate pricing works</div>
            </div>
            <div class="guar-detail-body">
              <div class="guar-detail-items">
                {#each [
                    { title: 'We assess the full job first.', text: 'Before quoting, we confirm what\'s needed and price the complete scope.' },
                    { title: 'You approve before we start.', text: 'The price is presented clearly. You decide whether to proceed.' },
                    { title: 'Scope changes are communicated.', text: 'If we find a problem that changes the scope, we stop and get your approval.' },
                    { title: 'Free estimates over $500.', text: 'The estimate visit costs nothing. No call-out fee.' }
                ] as step}
                    <div class="guar-detail-item"><div class="guar-detail-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div><div class="guar-detail-text"><strong>{step.title}</strong> {step.text}</div></div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</section>

<style>
.guar-hero{background:var(--ink);padding:80px 24px 72px;position:relative;overflow:hidden;}
.guar-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 65% 50%,rgba(27,94,59,0.2) 0%,transparent 55%),radial-gradient(ellipse at 5% 80%,rgba(245,124,34,0.06) 0%,transparent 40%);}
.guar-hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px);background-size:60px 60px;}
.guar-hero-inner{position:relative;z-index:2;max-width:var(--col);margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
.guar-hero-label{font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
.guar-hero-label::before{content:'';display:block;width:20px;height:2px;background:rgba(255,255,255,0.25);}
.guar-hero-headline{font-family:var(--cond);font-weight:900;font-size:clamp(44px,6vw,80px);line-height:0.9;text-transform:uppercase;color:#fff;margin-bottom:20px;}
.guar-hero-headline em{font-style:normal;color:var(--gold);}
.guar-hero-sub{font-size:17px;font-weight:300;color:rgba(255,255,255,0.6);line-height:1.65;margin-bottom:32px;}
.guar-hero-cta{display:inline-flex;align-items:center;gap:8px;background:var(--green);color:#fff;font-family:var(--cond);font-weight:700;font-size:15px;letter-spacing:0.05em;text-transform:uppercase;padding:13px 24px;border-radius:var(--radius);text-decoration:none;transition:background 0.2s;}
.guar-hero-cta:hover{background:var(--green-mid);}
.guar-hero-cta svg{width:15px; height:15px; stroke:currentColor; fill:none; stroke-width:2.5;}

.guar-shield-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:36px;text-align:center;}
.guar-shield-icon{width:80px;height:80px;border-radius:50%;background:rgba(27,94,59,0.3);border:2px solid rgba(27,94,59,0.5);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;}
.guar-shield-icon svg{width:44px;height:44px;stroke:#4ade80;fill:none;stroke-width:1.5;}
.guar-shield-title{font-family:var(--cond);font-weight:900;font-size:32px;color:#fff;text-transform:uppercase;line-height:1;margin-bottom:8px;}
.guar-shield-sub{font-size:14px;color:rgba(255,255,255,0.4);line-height:1.5;margin-bottom:24px;}
.guar-shield-items{display:flex;flex-direction:column;gap:10px;text-align:left;}
.guar-shield-item{display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,0.05);border-radius:var(--radius);}
.guar-shield-item svg{width:16px;height:16px;stroke:#4ade80;fill:none;stroke-width:2.5;flex-shrink:0;}
.guar-shield-item span{font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;}

.guar-section{padding:80px 24px;}
.guar-section-surface{background:var(--surface);}
.guar-section-white{background:var(--white);}
.guar-section-inner{max-width:var(--col);margin:0 auto;}
.section-label-green{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;color:var(--green);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px;}
.section-label-green::before{content:'';display:block;width:20px;height:2px;background:var(--green);}
.section-headline{font-family:var(--cond);font-weight:800;font-size:clamp(34px,4.5vw,54px);line-height:0.95;text-transform:uppercase;color:var(--ink);margin-bottom:16px;}
.section-sub{font-size:17px;font-weight:300;color:var(--text2);line-height:1.7;max-width:580px;margin-bottom:48px;}

.guar-layout{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start;}
.guar-layout.reverse{direction:rtl;}.guar-layout.reverse>*{direction:ltr;}

.guar-detail-card{background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:hidden;}
.guar-detail-header{background:var(--green);padding:20px 24px;display:flex;align-items:center;gap:14px;}
.guar-detail-icon{width:40px;height:40px;border-radius:8px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.guar-detail-icon svg{width:22px;height:22px;stroke:#fff;fill:none;stroke-width:1.75;}
.guar-detail-title{font-family:var(--cond);font-size:18px;font-weight:700;color:#fff;text-transform:uppercase;}
.guar-detail-body{padding:24px;}
.guar-detail-items{display:flex;flex-direction:column;gap:14px;}
.guar-detail-item{display:flex;align-items:flex-start;gap:12px;}
.guar-detail-check{width:20px;height:20px;border-radius:50%;background:var(--green-lt);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
.guar-detail-check svg{width:11px;height:11px;stroke:var(--green);fill:none;stroke-width:3;}
.guar-detail-text{font-size:14px;color:var(--text2);line-height:1.6;}
.guar-detail-text strong{color:var(--text);font-weight:600;}
.guar-detail-note{margin-top:20px;padding:14px;background:var(--gold-lt);border:1px solid rgba(184,134,42,0.2);border-radius:var(--radius);font-size:13px;color:var(--text2);line-height:1.6;}
.guar-detail-note strong{color:var(--gold);font-weight:700;}

@media(max-width:1024px){.guar-hero-inner,.guar-layout{grid-template-columns:1fr;}}
</style>
