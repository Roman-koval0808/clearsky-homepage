<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    onMount(() => {
      firePixel('page_load', 'Page Visited - Service Areas Hub', 3, 'research');

      const elements = Array.from(document.querySelectorAll('[data-pixel-event]')) as HTMLElement[];
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            const event = el.dataset.pixelEvent;
            if (!event) return;
            firePixel(
              event,
              el.dataset.pixelLabel ?? event,
              Number(el.dataset.pixelDelta ?? '0'),
              el.dataset.pixelBucket ?? undefined
            );
            observer.unobserve(el);
          });
        },
        { threshold: 0.2 }
      );

      elements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    });

    const areas = [
        { name: 'Timmins', dist: 'Primary service area', cat: 'hq', desc: 'Our home base. RightFlush started here in 2018 and the owner still takes jobs in Timmins personally. We know the housing stock in this city inside out.', featured: true, icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
        { name: 'South Porcupine', dist: '~5 km east of Timmins', cat: 'local', desc: 'Within Timmins city limits. Response times are essentially the same as central Timmins. Older single-family homes with same cold-weather plumbing challenges.', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' },
        { name: 'Iroquois Falls', dist: '~45 km east', cat: 'region', desc: 'We serve Iroquois Falls regularly. Older housing stock with galvanised supply lines that benefit from PEX upgrades. Emergency response ~45-60 min.', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' },
        { name: 'Matheson', dist: '~60 km southeast', cat: 'region', desc: 'Matheson and Black River-Matheson Township are part of our regular rotation. We handle well systems, pressure tanks, and filtration.', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' },
        { name: 'Cochrane', dist: '~80 km north', cat: 'region', desc: 'Our northernmost regular area. Sit on the Abitibi River with severe cold snaps. Frozen pipe calls are high here in February. Response ~60-90 min.', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' },
        { name: 'Kirkland Lake', dist: '~140 km south', cat: 'far', desc: 'We serve for scheduled work and urgent situations. For true emergencies, we\'ll dispatch while helping you source local options as parallel backup.', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' },
        { name: 'Kapuskasing', dist: '~140 km west', cat: 'far', desc: 'Regularly scheduled for larger renovations and tank replacements. Emergency response 90-120 min. Honest assessments on timeframe always given.', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }
    ];
</script>

<svelte:head>
  <title>Service Areas — RightFlush Plumbing | Timmins, Cochrane &amp; Northern Ontario</title>
  <meta name="description" content="RightFlush Plumbing serves Timmins, Cochrane, South Porcupine, Iroquois Falls, Kapuskasing, Matheson, and Kirkland Lake. Licensed plumbers across Northeastern Ontario.">
</svelte:head>

<div class="hub-hero">
    <div class="hub-hero-inner">
      <div class="reveal visible">
        <div class="hub-hero-label">Service Areas</div>
        <h1 class="hub-hero-headline">Northern Ontario.<br><em>All of it.</em></h1>
        <p class="hub-hero-sub">RightFlush Plumbing serves Timmins and seven surrounding communities across Northeastern Ontario. Same licensed plumbers, same flat-rate pricing, same 15-minute emergency response commitment.</p>
        <div class="hub-hero-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Not sure if we cover your location? Call us at
          <a class="hub-hero-note-link" href="tel:7057001234" onclick={() => firePixel('notsure_call', 'Service areas: call from note', 15, 'active')}>(705) 700-1234</a>
          — we'll tell you straight.
        </div>
      </div>
      <div class="hub-area-chips reveal reveal-delay-1 visible">
        {#each areas as area (area.name)}
          <div class="hub-area-chip" class:primary={area.featured}>
            <div class="hub-chip-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d={area.icon}/></svg></div>
            <div class="hub-chip-info"><div class="hub-chip-name">{area.name}</div><div class="hub-chip-dist">{area.dist}</div></div>
          </div>
        {/each}
      </div>
    </div>
</div>

<div class="hub-map reveal visible" data-pixel-event="hub_map" data-pixel-label="Service area map viewed" data-pixel-delta="4" data-pixel-bucket="research">
    <div class="hub-map-inner">
      <div class="hub-map-visual">
        <div class="hub-map-grid"></div>
        <div class="hub-map-dots">
          <div class="hub-dot primary" style="top:52%;left:48%"><div class="hub-dot-circle"></div><div class="hub-dot-label">Timmins</div></div>
          <div class="hub-dot" style="top:32%;left:50%"><div class="hub-dot-circle"></div><div class="hub-dot-label">Cochrane</div></div>
          <div class="hub-dot" style="top:54%;left:57%"><div class="hub-dot-circle"></div><div class="hub-dot-label">S. Porcupine</div></div>
          <div class="hub-dot" style="top:55%;left:67%"><div class="hub-dot-circle"></div><div class="hub-dot-label">Iroquois Falls</div></div>
          <div class="hub-dot" style="top:46%;left:20%"><div class="hub-dot-circle"></div><div class="hub-dot-label">Kapuskasing</div></div>
          <div class="hub-dot" style="top:65%;left:60%"><div class="hub-dot-circle"></div><div class="hub-dot-label">Matheson</div></div>
          <div class="hub-dot" style="top:78%;left:56%"><div class="hub-dot-circle"></div><div class="hub-dot-label">Kirkland Lake</div></div>
        </div>
        <div class="hub-map-label">
          <div class="hub-map-label-title">Northeastern Ontario</div>
          <div class="hub-map-label-sub">Service coverage map — approximate</div>
        </div>
      </div>
      <div class="hub-map-sidebar">
        <div class="hub-map-sidebar-title">All service areas</div>
        {#each areas as area (area.name)}
            <button type="button" class="hub-map-area" class:primary={area.featured} onclick={() => firePixel('area_click', 'Area selected: ' + area.name, 6, area.featured ? 'comparison' : 'research')}>
              <div class="hub-map-area-left"><div class="hub-map-area-dot"></div><div><div class="hub-map-area-name">{area.name}</div><div class="hub-map-area-dist">{area.dist}</div></div></div>
              <div class="hub-map-area-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
            </button>
        {/each}
      </div>
    </div>
</div>

<section class="hub-areas" data-pixel-event="hub_areas" data-pixel-label="Area detail cards" data-pixel-delta="5" data-pixel-bucket="comparison">
    <div class="hub-areas-inner">
      <div class="hub-areas-label">Serving your community</div>
      <h2 class="hub-areas-headline reveal visible">Same plumbers.<br>Same standards. Every town.</h2>
      <div class="hub-areas-grid">
        {#each areas as area (area.name)}
          <button type="button" class="hub-area-card reveal visible" class:featured={area.featured} onclick={() => firePixel('area_card_click', 'Area card: ' + area.name, 6, area.featured ? 'comparison' : 'research')}>
            <div class="hub-area-card-header"><div class="hub-area-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d={area.icon}/></svg></div>{#if area.featured}<span class="hub-area-card-badge">Headquarters</span>{/if}</div>
            <div class="hub-area-card-name">{area.name}</div>
            <div class="hub-area-card-region">{area.dist}</div>
            <p class="hub-area-card-desc">{area.desc}</p>
            <div class="hub-area-card-link">Service details<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
          </button>
        {/each}
      </div>
    </div>
</section>

<div class="hub-proof">
    <div class="hub-proof-inner">
      <div class="hub-proof-stat reveal visible"><div class="hub-proof-num">7</div><div class="hub-proof-label">Communities served</div></div>
      <div class="hub-proof-stat reveal visible"><div class="hub-proof-num">4.7<em>★</em></div><div class="hub-proof-label">Google rating</div></div>
      <div class="hub-proof-stat reveal visible"><div class="hub-proof-num">15<em>min</em></div><div class="hub-proof-label">Emergency response</div></div>
      <div class="hub-proof-stat reveal visible"><div class="hub-proof-num">0<em>$</em></div><div class="hub-proof-label">Call-out fee</div></div>
    </div>
</div>

<style>
.hub-hero{background:var(--surface);padding:72px 24px 64px;border-bottom:1px solid var(--border);}
.hub-hero-inner{max-width:var(--col);margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
.hub-hero-label{font-size:11px;font-weight:700;color:var(--green);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
.hub-hero-label::before{content:'';display:block;width:20px;height:2px;background:var(--green);}
.hub-hero-headline{font-family:var(--cond);font-weight:900;font-size:clamp(40px,5.5vw,70px);line-height:0.9;text-transform:uppercase;color:var(--ink);margin-bottom:20px;}
.hub-hero-headline em{font-style:normal;color:var(--green);}
.hub-hero-sub{font-size:16px;font-weight:300;color:var(--text2);line-height:1.7;margin-bottom:28px;}
.hub-hero-note{display:flex;align-items:flex-start;gap:10px;background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;font-size:13px;color:var(--text2);line-height:1.5;}
.hub-hero-note svg{width:16px;height:16px;stroke:var(--green);fill:none;stroke-width:2;flex-shrink:0;margin-top:1px;}
.hub-hero-note-link{color:var(--green);font-weight:700;text-decoration:none;margin:0 4px;white-space:nowrap;}
.hub-hero-note-link:hover{text-decoration:underline;}

.hub-area-chips{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.hub-area-chip{background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:16px 18px;display:flex;align-items:center;gap:12px;text-decoration:none;transition:all 0.2s;}
.hub-area-chip.primary{border-color:var(--green);background:var(--green-lt);}
.hub-chip-icon{width:36px;height:36px;border-radius:50%;background:var(--surface);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.hub-area-chip.primary .hub-chip-icon{background:rgba(27,94,59,0.15);}
.hub-chip-icon svg{width:17px;height:17px;stroke:var(--green);fill:none;stroke-width:2;}
.hub-chip-name{font-family:var(--cond);font-size:15px;font-weight:700;color:var(--ink);text-transform:uppercase;}
.hub-chip-dist{font-size:11px;color:var(--text3);}

.hub-map{background:var(--ink);padding:0;}
.hub-map-inner{max-width:var(--col);margin:0 auto;display:grid;grid-template-columns:1fr 400px;}
.hub-map-visual{aspect-ratio:16/9;background:linear-gradient(135deg,#0D1F14 0%,#1B3A28 40%,#0D2A1C 100%);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
.hub-map-visual::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 45% 45%,rgba(27,94,59,0.25) 0%,transparent 60%);}
.hub-map-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:40px 40px;}
.hub-map-label{position:relative;z-index:1;text-align:center;}
.hub-map-label-title{font-family:var(--cond);font-size:16px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;}
.hub-map-label-sub{font-size:12px;color:rgba(255,255,255,0.2);}
.hub-map-dots{position:absolute;inset:0;}
.hub-dot{position:absolute;display:flex;flex-direction:column;align-items:center;gap:4px;}
.hub-dot-circle{width:10px;height:10px;border-radius:50%;background:var(--green);border:2px solid rgba(255,255,255,0.3);animation:dotPulse 2s ease-in-out infinite;}
.hub-dot.primary .hub-dot-circle{width:14px;height:14px;background:var(--green);border-color:#fff;}
@keyframes dotPulse{0%,100%{box-shadow:0 0 0 0 rgba(47,89,152,0.4)}50%{box-shadow:0 0 0 6px rgba(47,89,152,0)}}
.hub-dot-label{font-size:9px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:0.06em;text-transform:uppercase;white-space:nowrap;}
.hub-dot.primary .hub-dot-label{color:#fff;}

.hub-map-sidebar{padding:40px 32px;display:flex;flex-direction:column;gap:12px;}
.hub-map-sidebar-title{font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;}
.hub-map-area{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:var(--radius);transition:all 0.2s;background:none;border:none;text-align:left;width:100%;cursor:pointer;}
.hub-map-area:hover{background:rgba(255,255,255,0.06);}
.hub-map-area-left{display:flex;align-items:center;gap:10px;}
.hub-map-area-dot{width:8px;height:8px;border-radius:50%;background:var(--green);flex-shrink:0;}
.hub-map-area.primary .hub-map-area-dot{background:var(--green);border:1px solid #fff;}
.hub-map-area-name{font-family:var(--cond);font-size:14px;font-weight:700;color:#fff;text-transform:uppercase;}
.hub-map-area-dist{font-size:11px;color:rgba(255,255,255,0.3);}
.hub-map-area-arrow{width:16px;height:16px;color:rgba(255,255,255,0.2);}
.hub-map-area-arrow svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;}

.hub-areas{padding:64px 24px;background:var(--white);}
.hub-areas-inner{max-width:var(--col);margin:0 auto;}
.hub-areas-label{font-size:11px;font-weight:700;color:var(--green);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
.hub-areas-label::before{content:'';display:block;width:20px;height:2px;background:var(--green);}
.hub-areas-headline{font-family:var(--cond);font-weight:800;font-size:clamp(32px,4vw,48px);line-height:0.95;text-transform:uppercase;color:var(--ink);margin-bottom:48px;}
.hub-areas-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.hub-area-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px;transition:all 0.2s;display:flex;flex-direction:column;text-align:left;width:100%;cursor:pointer;}
.hub-area-card:hover{border-color:var(--green);box-shadow:0 4px 20px rgba(0,0,0,0.07);}
.hub-area-card.featured{background:var(--green-lt);border-color:rgba(47,89,152,0.3);}
.hub-area-card-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;}
.hub-area-card-icon{width:40px;height:40px;border-radius:50%;background:var(--white);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;}
.hub-area-card.featured .hub-area-card-icon{background:var(--green);border-color:var(--green);}
.hub-area-card-icon svg{width:18px;height:18px;stroke:var(--green);fill:none;stroke-width:2;}
.hub-area-card.featured .hub-area-card-icon svg{stroke:#fff;}
.hub-area-card-badge{font-size:10px;font-weight:700;color:var(--green);background:var(--white);border:1px solid rgba(47,89,152,0.2);border-radius:100px;padding:3px 9px;letter-spacing:0.06em;text-transform:uppercase;}
.hub-area-card-name{font-family:var(--cond);font-weight:800;font-size:22px;color:var(--ink);text-transform:uppercase;margin-bottom:4px;}
.hub-area-card-desc{font-size:13px;color:var(--text2);line-height:1.65;flex:1;margin-bottom:16px;}
.hub-area-card-link{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--green);}
.hub-area-card-link svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2.5;}

.hub-proof{background:var(--ink);padding:56px 24px;}
.hub-proof-inner{max-width:var(--col);margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,0.06);}
.hub-proof-stat{background:rgba(255,255,255,0.03);padding:28px;text-align:center;}
.hub-proof-num{font-family:var(--cond);font-weight:900;font-size:44px;color:#fff;line-height:1;margin-bottom:6px;}
.hub-proof-num em{font-style:normal;color:var(--gold);font-size:30px;}
.hub-proof-label{font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.08em;text-transform:uppercase;}

@media(max-width:1024px){.hub-hero-inner{grid-template-columns:1fr;}.hub-map-inner{grid-template-columns:1fr;}.hub-areas-grid{grid-template-columns:1fr 1fr;}.hub-proof-inner{grid-template-columns:1fr 1fr;}}
@media(max-width:768px){.hub-area-chips{grid-template-columns:1fr;}.hub-areas-grid{grid-template-columns:1fr;}}
</style>
