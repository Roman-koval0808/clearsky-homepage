<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    let activeFilter = $state('all');
    let sliderPositions = $state([50, 50, 50, 50, 50, 50]);
    let sliderInteracted = $state([false, false, false, false, false, false]);

    const projects = [
        { id: 0, category: 'bathroom', location: 'Timmins, ON', title: 'Full master bathroom renovation', desc: 'Removed original 1970s cast iron tub and tile surround. Installed walk-in shower with linear drain, floating double vanity, and heated floor.', reviewer: 'Derek P.' },
        { id: 1, category: 'hotwater', location: 'South Porcupine, ON', title: 'Tankless hot water upgrade', desc: 'Replaced 40-gallon tank with Navien condensing tankless unit. Recirculation loop added so hot water reaches the master bath in under 8 seconds.', reviewer: 'Linda K.' },
        { id: 2, category: 'pipes', location: 'Cochrane, ON', title: 'Burst pipe and ceiling repair', desc: 'Frozen copper supply line burst inside the wall cavity. Located failure without opening the entire wall. Section replaced with PEX.', reviewer: 'Mark R.' },
        { id: 3, category: 'bathroom', location: 'Timmins, ON', title: 'Ensuite conversion — tub to shower', desc: 'Converted a rarely-used alcove tub into a full walk-in shower. New drain location required opening the subfloor — done in one day.', reviewer: 'Patricia W.' },
        { id: 4, category: 'gas', location: 'Kapuskasing, ON', title: 'Gas line extension — BBQ connection', desc: 'Extended the gas main from the basement to the rear deck for a new permanent BBQ connection. Licensed gas fitting with inspection.', reviewer: 'Tom B.' },
        { id: 5, category: 'filtration', location: 'Iroquois Falls, ON', title: 'Whole-home water softener', desc: 'Installed a whole-home softener with a pre-filter sediment stage. Significant difference in scale buildup and appliance life.', reviewer: 'Sandra N.' }
    ];

    onMount(() => {
        firePixel('page_load', 'Page Visited - Gallery', 4, 'comparison');
    });

    function setPosition(index: number, e: MouseEvent | TouchEvent) {
        const slider = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        let pct = Math.max(5, Math.min(95, ((clientX - slider.left) / slider.width) * 100));
        sliderPositions[index] = pct;
        
        if (!sliderInteracted[index]) {
            sliderInteracted[index] = true;
            firePixel('ba_slider_drag', 'Gallery: before/after slider used', 8, 'comparison');
        }
    }

    const filteredProjects = $derived(
        activeFilter === 'all' ? projects : projects.filter(p => p.category === activeFilter)
    );

    let vrName = $state('');
    let vrPhone = $state('');
    let vrInterests = $state(['Bathroom reno']);

    function toggleVRInterest(interest: string) {
        if (vrInterests.includes(interest)) {
            vrInterests = vrInterests.filter(i => i !== interest);
        } else {
            vrInterests = [...vrInterests, interest];
        }
        firePixel('vr_interest_select', 'ViewRoom: interest selected', 4, 'comparison');
    }

    function enterVR() {
        if (!vrName) {
            alert('Please provide your name.');
            return;
        }
        firePixel('vr_entry', 'ViewRoom: entered from gallery', 10, 'active');
        alert('Connecting — your plumber will join within 2 minutes');
    }
</script>

<svelte:head>
  <title>Before &amp; After Gallery — RightFlush Plumbing Timmins</title>
  <meta name="description" content="See completed RightFlush Plumbing jobs in Timmins and surrounding area. Real before and after photos from bathroom renovations, pipe repairs, and more.">
</svelte:head>

<section class="gal-hero">
    <div class="gal-hero-bg"></div>
    <div class="gal-hero-grid"></div>
    <div class="gal-hero-inner">
      <div class="gal-hero-badge reveal visible">
        <div class="gal-hero-badge-dot"></div>
        Real jobs · Timmins and surrounding area
      </div>
      <h1 class="gal-hero-headline reveal reveal-delay-1 visible">Before.<br><em>After.</em></h1>
      <p class="gal-hero-sub reveal reveal-delay-2 visible">Every job on this page was completed by RightFlush Plumbing in Timmins. Real homes. Real photos. No staging, no stock imagery.</p>
      <div class="gal-hero-stats reveal reveal-delay-3 visible">
        {#each [
            { num: '4.7', label: 'Google Rating', unit: '★' },
            { num: '64', label: 'Verified Reviews' },
            { num: '6', label: 'Years in Business' },
            { num: '0', label: 'Call-out fee', unit: '$' }
        ] as stat}
          <div class="gal-hero-stat">
            <div class="gal-hero-stat-num">{stat.num}{#if stat.unit}<span>{stat.unit}</span>{/if}</div>
            <div class="gal-hero-stat-label">{stat.label}</div>
          </div>
        {/each}
      </div>
    </div>
</section>

<div class="gal-filter">
    <div class="gal-filter-inner">
      <span class="gal-filter-label">Filter by</span>
      {#each [
        { id: 'all', label: 'All jobs' },
        { id: 'bathroom', label: 'Bathroom Renos' },
        { id: 'hotwater', label: 'Hot Water' },
        { id: 'pipes', label: 'Pipe & Drain' },
        { id: 'gas', label: 'Gas' },
        { id: 'filtration', label: 'Filtration' }
      ] as btn}
        <button 
            class="gal-filter-btn" 
            class:active={activeFilter === btn.id}
            onclick={() => { activeFilter = btn.id; firePixel('gallery_filter', 'Gallery: filter — ' + btn.id, 5, 'comparison'); }}
        >{btn.label}</button>
      {/each}
    </div>
</div>

<section class="section gal-section">
    <div class="gal-inner">
      <div class="gal-grid">
        {#each filteredProjects as p}
          <div class="gal-card reveal visible">
            <div 
                class="ba-slider" 
                onmousemove={(e) => e.buttons === 1 && setPosition(p.id, e)}
                onmousedown={(e) => setPosition(p.id, e)}
                ontouchmove={(e) => setPosition(p.id, e)}
            >
              <div class="ba-before">
                <div class="ba-img before-placeholder"></div>
              </div>
              <div class="ba-after" style="clip-path: inset(0 {100 - sliderPositions[p.id]}% 0 0)">
                <div class="ba-img after-placeholder"></div>
              </div>
              <span class="ba-label ba-label-before">Before</span>
              <span class="ba-label ba-label-after">After</span>
              <div class="ba-handle" style="left: {sliderPositions[p.id]}%">
                <div class="ba-handle-line"></div>
                <div class="ba-handle-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="15 18 9 12 15 6"/><polyline points="9 18 3 12 9 6" transform="translate(9,0)"/>
                  </svg>
                </div>
              </div>
              {#if !sliderInteracted[p.id]}
                <div class="ba-drag-hint">← Drag to compare →</div>
              {/if}
            </div>
            <div class="gal-card-body">
              <div class="gal-card-meta">
                <span class="gal-card-tag">{p.category}</span>
                <span class="gal-card-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{p.location}</span>
              </div>
              <div class="gal-card-title">{p.title}</div>
              <p class="gal-card-desc">{p.desc}</p>
              <div class="gal-card-footer">
                <div class="gal-card-review"><span class="gal-card-stars">★★★★★</span><span class="gal-card-reviewer">{p.reviewer}</span></div>
                <a href="/marketing-automation/contact" class="gal-card-cta">Get a quote<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
</section>

<div class="vr-invite" data-pixel-event="vr_invite_view" data-pixel-label="ViewRoom invite section" data-pixel-delta="8" data-pixel-bucket="comparison">
    <div class="vr-invite-inner">
      <div class="vr-invite-text reveal visible">
        <div class="vr-invite-eyebrow">ViewRoom</div>
        <h2 class="vr-invite-headline">Want a virtual tour<br>of a completed job?</h2>
        <p class="vr-invite-sub">Enter ViewRoom and a RightFlush plumber walks you through completed renovations on video. Ask anything. Get a quote in the room.</p>
        <div class="vr-invite-features">
          {#each ['Live video — see the actual finished space', 'Ask about materials, process, cost range', 'Book your estimate directly in the room'] as feature}
            <div class="vr-invite-feature"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>{feature}</div>
          {/each}
        </div>
      </div>

      <div class="reveal reveal-delay-1 visible">
        <div class="vr-entry-card">
          <div class="vr-entry-header">
            <div class="vr-entry-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div>
            <div class="vr-entry-title">Enter ViewRoom</div>
            <div class="vr-entry-status"><div class="vr-entry-dot"></div><span class="vr-entry-status-text">Rep available</span></div>
          </div>

          <div class="vr-project-strip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <div class="vr-project-text">Entering from the gallery — <strong>your plumber will show you completed jobs on video</strong>.</div>
          </div>

          <div class="vr-field">
            <label class="vr-field-label">What are you interested in?</label>
            <div class="vr-project-chips">
              {#each ['Bathroom reno', 'Hot water', 'Pipe work', 'Water filtration', 'Gas work'] as interest}
                <button 
                    class="vr-chip" 
                    class:selected={vrInterests.includes(interest)}
                    onclick={() => toggleVRInterest(interest)}
                >{interest}</button>
              {/each}
            </div>
          </div>

          <div class="vr-field-row">
            <div class="vr-field">
              <label class="vr-field-label">Your name</label>
              <input class="vr-field-input" type="text" placeholder="First name" bind:value={vrName}>
            </div>
            <div class="vr-field">
              <label class="vr-field-label">Phone</label>
              <input class="vr-field-input" type="tel" placeholder="(705) 000-0000" bind:value={vrPhone}>
            </div>
          </div>

          <button class="vr-enter-btn" onclick={enterVR}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            Enter ViewRoom now
          </button>
        </div>
      </div>
    </div>
</div>

<style>
.gal-hero { background: var(--ink); padding: 80px 24px 72px; position: relative; overflow: hidden; }
.gal-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 70% 50%, rgba(27,94,59,0.15) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(245, 124, 34, 0.05) 0%, transparent 40%); }
.gal-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px); background-size: 60px 60px; }
.gal-hero-inner { position: relative; z-index: 2; max-width: var(--col); margin: 0 auto; }
.gal-hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(27,94,59,0.25); border: 1px solid rgba(27,94,59,0.4); border-radius: 100px; padding: 6px 14px; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.75); text-transform: uppercase; margin-bottom: 22px; }
.gal-hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
.gal-hero-headline { font-family: var(--cond); font-weight: 900; font-size: clamp(44px, 6vw, 84px); line-height: 0.9; text-transform: uppercase; color: #fff; margin-bottom: 24px; }
.gal-hero-headline em { font-style: normal; color: var(--gold); }
.gal-hero-sub { font-size: 18px; font-weight: 300; color: rgba(255,255,255,0.55); line-height: 1.65; max-width: 560px; margin-bottom: 40px; }
.gal-hero-stats { display: flex; align-items: center; gap: 48px; flex-wrap: wrap; }
.gal-hero-stat-num { font-family: var(--cond); font-size: 40px; font-weight: 900; color: #fff; line-height: 1; }
.gal-hero-stat-num span { color: var(--gold); }
.gal-hero-stat-label { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; margin-top: 4px; letter-spacing: 0.04em; }

.gal-filter { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 24px; position: sticky; top: calc(var(--trust-h) + var(--nav-h)); z-index: 100; }
.gal-filter-inner { max-width: var(--col); margin: 0 auto; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.gal-filter-label { font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; margin-right: 12px; }
.gal-filter-btn { border: 1.5px solid var(--border); border-radius: 100px; padding: 6px 18px; font-size: 13px; font-weight: 500; color: var(--text2); background: var(--white); cursor: pointer; transition: all 0.2s; font-family: inherit; }
.gal-filter-btn:hover { border-color: var(--green); color: var(--green); }
.gal-filter-btn.active { border-color: var(--green); background: var(--green); color: #fff; }

.gal-section { background: var(--white); padding: 56px 24px 80px; }
.gal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.gal-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: all 0.25s; }
.gal-card:hover { border-color: var(--green); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }

.ba-slider { position: relative; aspect-ratio: 16/9; overflow: hidden; cursor: col-resize; background: #000; }
.ba-before, .ba-after { position: absolute; inset: 0; }
.ba-after { clip-path: inset(0 50% 0 0); z-index: 2; }
.ba-img { width: 100%; height: 100%; object-fit: cover; }
.ba-img.before-placeholder { background: linear-gradient(135deg, #c8b49a 0%, #b8a890 100%); }
.ba-img.after-placeholder { background: linear-gradient(135deg, #1B5E3B 0%, #2D7A52 100%); }
.ba-label { position: absolute; top: 16px; z-index: 10; font-family: var(--cond); font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.04em; }
.ba-label-before { left: 16px; background: rgba(0,0,0,0.5); color: #fff; }
.ba-label-after { right: 16px; background: var(--green); color: #fff; }
.ba-handle { position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; background: #fff; transform: translateX(-50%); z-index: 11; }
.ba-handle-circle { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.ba-handle-circle svg { width: 20px; height: 20px; stroke: var(--green); }
.ba-drag-hint { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); color: #fff; font-size: 10px; padding: 5px 14px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.04em; }

.gal-card-body { padding: 24px; }
.gal-card-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.gal-card-tag { font-size: 10px; font-weight: 700; color: var(--green); background: var(--green-lt); padding: 4px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.04em; }
.gal-card-location { font-size: 12px; color: var(--text3); display: flex; align-items: center; gap: 4px; }
.gal-card-location svg { width: 12px; height: 12px; stroke: currentColor; }
.gal-card-title { font-family: var(--cond); font-size: 20px; font-weight: 800; color: var(--ink); text-transform: uppercase; margin-bottom: 8px; }
.gal-card-desc { font-size: 14px; color: var(--text2); line-height: 1.6; margin-bottom: 24px; }
.gal-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.gal-card-reviewer { font-size: 12px; color: var(--text3); font-weight: 600; margin-left: 8px; }
.gal-card-cta { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--green); text-decoration: none; }

.vr-invite { background: var(--green); padding: 80px 24px; color: #fff; }
.vr-invite-inner { max-width: var(--col); margin: 0 auto; display: grid; grid-template-columns: 1fr 480px; gap: 80px; align-items: center; }
.vr-invite-eyebrow { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.vr-invite-eyebrow::before { content: ''; display: block; width: 24px; height: 2px; background: rgba(255,255,255,0.4); }
.vr-invite-headline { font-family: var(--cond); font-weight: 900; font-size: clamp(36px, 5vw, 60px); line-height: 0.92; text-transform: uppercase; margin-bottom: 24px; }
.vr-invite-sub { font-size: 17px; font-weight: 300; color: rgba(255,255,255,0.75); line-height: 1.65; margin-bottom: 32px; }
.vr-invite-features { display: flex; flex-direction: column; gap: 14px; }
.vr-invite-feature { display: flex; align-items: center; gap: 12px; font-size: 15px; color: rgba(255,255,255,0.85); }
.vr-invite-feature svg { width: 18px; height: 18px; stroke: rgba(255,255,255,0.6); }

.vr-entry-card { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; padding: 40px; backdrop-filter: blur(8px); }
.vr-entry-header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
.vr-entry-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; }
.vr-entry-icon svg { width: 26px; height: 26px; stroke: #fff; }
.vr-entry-title { font-family: var(--cond); font-size: 20px; font-weight: 700; text-transform: uppercase; }
.vr-entry-status { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.vr-entry-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: pulse 1.5s infinite; }
.vr-entry-status-text { font-size: 12px; color: rgba(255,255,255,0.6); }

.vr-project-strip { background: rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 12px; }
.vr-project-strip svg { width: 18px; height: 18px; stroke: rgba(255,255,255,0.5); flex-shrink: 0; margin-top: 2px; }
.vr-project-text { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5; }
.vr-project-text strong { color: #fff; font-weight: 600; }

.vr-field { margin-bottom: 20px; }
.vr-field-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 8px; display: block; }
.vr-project-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.vr-chip { border: 1.5px solid rgba(255,255,255,0.15); border-radius: 100px; padding: 6px 16px; font-size: 12px; color: rgba(255,255,255,0.7); cursor: pointer; transition: all 0.2s; background: none; font-family: inherit; }
.vr-chip:hover { border-color: rgba(255,255,255,0.4); color: #fff; }
.vr-chip.selected { border-color: #fff; background: rgba(255,255,255,0.15); color: #fff; font-weight: 600; }

.vr-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.vr-field-input { width: 100%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: var(--radius); padding: 12px 16px; font-size: 14px; font-family: inherit; color: #fff; outline: none; }

.vr-enter-btn { width: 100%; background: #fff; color: var(--green); border: none; border-radius: var(--radius); padding: 16px; font-family: var(--cond); font-weight: 800; font-size: 17px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
.vr-enter-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

@media (max-width: 1024px) {
    .gal-grid { grid-template-columns: 1fr; }
    .vr-invite-inner { grid-template-columns: 1fr; gap: 48px; }
}
</style>
