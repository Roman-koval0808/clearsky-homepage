<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    let activeFilter = $state('all');
    let filterVisible = $state(false);

    const reviews = [
        { cat: 'emergency', name: 'Sarah T.', loc: 'Timmins', platform: 'Google', stars: 5, text: '"Called RightFlush on a Tuesday night for a burst pipe. They were at my door in under 20 minutes. Fixed it, cleaned up, and the price was exactly what they quoted. Won\'t call anyone else."', service: 'Emergency' },
        { cat: 'bathroom', name: 'Derek P.', loc: 'Timmins', platform: 'Google', stars: 5, text: '"Used the Visualizer before we committed to anything. Chose the spa style, showed my wife, and we both knew immediately. RightFlush came in on quote, finished a day ahead of schedule. Bathroom looks exactly like the render."', service: 'Bathroom Reno' },
        { cat: 'hotwater', name: 'Mark R.', loc: 'South Porcupine', platform: 'Google', stars: 5, text: '"No hot water on Christmas morning with four kids in the house. One call and they had it sorted by noon. The owner came himself. That says everything about how they run their business."', service: 'Hot Water' },
        { cat: 'drain', name: 'Greg W.', loc: 'Cochrane', platform: 'Google', stars: 5, text: '"Main line backed up into the basement — nightmare situation. RightFlush was calm, clear about what needed to happen, and had it sorted in one visit. Camera inspection showed exactly what caused it. Couldn\'t recommend them more."', service: 'Blocked Drain' },
        { cat: 'bathroom', name: 'Patricia W.', loc: 'Timmins', platform: 'Google', stars: 5, text: '"Sent a photo through FotoJobber on a Tuesday morning. Had a quote by 11am. Work done by Thursday afternoon. I didn\'t even need to take time off work for the estimate visit. Really well organised."', service: 'Bathroom Reno' },
        { cat: 'pipe', name: 'Tom B.', loc: 'Matheson', platform: 'Google', stars: 5, text: '"Water stain appeared on the ceiling but we couldn\'t find where it was coming from. RightFlush found a pinhole leak in the copper above — opened less than a square foot of drywall. Fixed in an afternoon. Honest about the cost before starting."', service: 'Leak Detection' },
        { cat: 'hotwater', name: 'Janet K.', loc: 'Timmins', platform: 'Google', stars: 5, text: '"14-year-old tank finally gave out. RightFlush came the same afternoon, quoted clearly, and had the new unit running before dinner. No drama, no surprise on the invoice. Exactly what you want when something goes wrong at home."', service: 'Hot Water' },
        { cat: 'gas', name: 'Rick M.', loc: 'Kapuskasing', platform: 'Google', stars: 5, text: '"Extended the gas line from the basement to a new BBQ pad in the backyard. Clean work, proper permit, passed inspection first time. They explained everything clearly before starting and stuck to the quote."', service: 'Gas Plumbing' },
        { cat: 'drain', name: 'Lisa M.', loc: 'Cochrane', platform: 'Google', stars: 5, text: '"Slow drain in the master bath for months. Every product I tried made no difference. RightFlush found a partial root intrusion 6 feet in. Cleared and fixed. No issues since. Straight shooter on the diagnosis — no upsell."', service: 'Blocked Drain' },
        { cat: 'pipe', name: 'Carol S.', loc: 'Iroquois Falls', platform: 'Google', stars: 5, text: '"Dripping tap that two other plumbers said needed a full fixture replacement. RightFlush replaced the cartridge for under $100. Hasn\'t dripped in a year. I appreciate that they told me the truth instead of selling me something I didn\'t need."', service: 'Pipe & Leak' },
        { cat: 'emergency', name: 'Lisa M.', loc: 'Cochrane', platform: 'Google', stars: 5, text: '"Sewage backup on a Saturday afternoon. I called three plumbers before RightFlush — all voicemail. These guys picked up on the second ring. Sorted in three hours. Professional, clean, and the price was fair. Incredible service."', service: 'Emergency' },
        { cat: 'bathroom', name: 'Sandra N.', loc: 'Timmins', platform: 'Google', stars: 5, text: '"Converted a rarely-used tub in our ensuite into a walk-in shower. RightFlush handled all the plumbing — they opened the subfloor, moved the drain, and were done in one day. Coordinated perfectly with our contractor on timing."', service: 'Bathroom Reno' }
    ];

    onMount(() => {
        firePixel('page_load', 'Page Visited - Reviews', 4, 'comparison');
    });

    function setFilter(f: string) {
        activeFilter = f;
        firePixel('review_filter', 'Reviews: filter — ' + f, 5, 'comparison');
    }

    const filteredReviews = $derived(
        activeFilter === 'all' ? reviews : reviews.filter(r => r.cat === activeFilter)
    );
</script>

<svelte:head>
  <title>Reviews &amp; Testimonials — RightFlush Plumbing Timmins | 4.7 Stars · 64 Reviews</title>
  <meta name="description" content="Read verified reviews of RightFlush Plumbing from Timmins homeowners. 4.7 stars, 64 Google reviews. Real experiences from real customers across Northern Ontario.">
</svelte:head>

<section class="rev-hero">
    <div class="rev-hero-bg"></div>
    <div class="rev-hero-grid"></div>
    <div class="rev-hero-inner">
      <div class="reveal">
        <div class="rev-hero-label">Reviews &amp; Testimonials</div>
        <h1 class="rev-hero-headline">64 Timmins homeowners.<br><em>One consistent verdict.</em></h1>
        <p class="rev-hero-sub">Every review on this page was left voluntarily by a real RightFlush customer. We don't filter them and we don't pay for them. 4.7 stars across 64 verified Google reviews.</p>
        <a href="/marketing-automation/contact" class="rev-hero-cta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Book a free estimate
        </a>
      </div>
      <div class="rev-score-card reveal reveal-delay-2">
        <div class="rev-score-big">4.7<em>★</em></div>
        <div class="rev-score-stars">★★★★★</div>
        <div class="rev-score-label">64 verified Google reviews</div>
        <div class="rev-score-breakdown">
          {#each [
            { label: '5 stars', pct: 82, count: 52 },
            { label: '4 stars', pct: 13, count: 8 },
            { label: '3 stars', pct: 3, count: 2 },
            { label: '2 stars', pct: 2, count: 1 },
            { label: '1 star', pct: 2, count: 1 }
          ] as row}
            <div class="rev-score-row">
                <span class="rev-score-stars-label">{row.label}</span>
                <div class="rev-score-bar-wrap"><div class="rev-score-bar" style="width: {row.pct}%"></div></div>
                <span class="rev-score-count">{row.count}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
</section>

<div class="rev-filter">
    <div class="rev-filter-inner">
      <span class="rev-filter-label">Filter by service</span>
      <div class="rev-filter-btns">
        {#each [
            { id: 'all', label: 'All reviews' },
            { id: 'emergency', label: 'Emergency' },
            { id: 'bathroom', label: 'Bathroom Reno' },
            { id: 'hotwater', label: 'Hot Water' },
            { id: 'drain', label: 'Drains' },
            { id: 'pipe', label: 'Pipe & Leak' },
            { id: 'gas', label: 'Gas' }
        ] as btn}
          <button 
            class="rev-filter-btn" 
            class:active={activeFilter === btn.id}
            onclick={() => setFilter(btn.id)}
          >{btn.label}</button>
        {/each}
      </div>
      <a href="https://g.page/r/rightflush" class="rev-write-link" onclick={() => firePixel('write_review_nav', 'Write review nav clicked', 5, 'comparison')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        Write a review
      </a>
    </div>
</div>

<section class="section rev-section">
    <div class="rev-inner">
      <div class="rev-grid">
        {#each filteredReviews as rev}
          <div class="rev-card reveal visible">
            <div class="rev-card-header">
              <div class="rev-card-stars">{'★'.repeat(rev.stars)}</div>
              <span class="rev-card-platform">{rev.platform}</span>
            </div>
            <p class="rev-card-text">{rev.text}</p>
            <div class="rev-card-footer">
              <div class="rev-card-attr">
                <div class="rev-card-dot"></div>
                <span class="rev-card-name">{rev.name} · {rev.loc}</span>
              </div>
              <span class="rev-card-service">{rev.service}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
</section>

<div class="rev-summary">
    <div class="rev-summary-inner">
      <div class="rev-summary-stat reveal visible"><div class="rev-summary-num">4.7<em>★</em></div><div class="rev-summary-label">Google rating</div></div>
      <div class="rev-summary-stat reveal visible"><div class="rev-summary-num">64</div><div class="rev-summary-label">Verified reviews</div></div>
      <div class="rev-summary-stat reveal visible"><div class="rev-summary-num">82<em>%</em></div><div class="rev-summary-label">Five-star reviews</div></div>
      <div class="rev-summary-stat reveal visible"><div class="rev-summary-num">6<em>yr</em></div><div class="rev-summary-label">In business</div></div>
    </div>
</div>

<style>
.rev-hero { background: var(--ink); padding: 80px 24px 72px; position: relative; overflow: hidden; }
.rev-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 70% 50%, rgba(245, 124, 34, 0.1) 0%, transparent 55%); }
.rev-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px); background-size: 60px 60px; }
.rev-hero-inner { position: relative; z-index: 2; max-width: var(--col); margin: 0 auto; display: grid; grid-template-columns: 1fr 400px; gap: 64px; align-items: center; }
.rev-hero-label { font-size: 11px; font-weight: 700; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
.rev-hero-label::before { content: ''; display: block; width: 20px; height: 2px; background: rgba(255, 255, 255, 0.3); }
.rev-hero-headline { font-family: var(--cond); font-weight: 900; font-size: clamp(44px, 6vw, 80px); line-height: 0.9; text-transform: uppercase; color: #fff; margin-bottom: 24px; }
.rev-hero-headline em { font-style: normal; color: var(--gold); }
.rev-hero-sub { font-size: 17px; font-weight: 300; color: rgba(255, 255, 255, 0.6); line-height: 1.65; margin-bottom: 32px; max-width: 520px; }
.rev-hero-cta { display: inline-flex; align-items: center; gap: 10px; background: var(--green); color: #fff; font-family: var(--cond); font-weight: 700; font-size: 16px; letter-spacing: 0.05em; text-transform: uppercase; padding: 14px 28px; border-radius: var(--radius); text-decoration: none; transition: background 0.2s; }
.rev-hero-cta:hover { background: var(--green-mid); }
.rev-hero-cta svg { width: 16px; height: 16px; stroke: currentColor; }

.rev-score-card { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; backdrop-filter: blur(4px); }
.rev-score-big { font-family: var(--cond); font-weight: 900; font-size: 80px; color: #fff; line-height: 1; margin-bottom: 4px; }
.rev-score-big em { font-style: normal; color: var(--gold); }
.rev-score-stars { font-size: 28px; color: var(--gold); letter-spacing: 4px; margin-bottom: 8px; }
.rev-score-label { font-size: 13px; color: rgba(255, 255, 255, 0.4); margin-bottom: 24px; }
.rev-score-breakdown { display: flex; flex-direction: column; gap: 10px; }
.rev-score-row { display: flex; align-items: center; gap: 12px; }
.rev-score-stars-label { font-size: 12px; color: rgba(255, 255, 255, 0.4); width: 52px; flex-shrink: 0; }
.rev-score-bar-wrap { flex: 1; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 100px; overflow: hidden; }
.rev-score-bar { height: 100%; background: var(--gold); border-radius: 100px; }
.rev-score-count { font-size: 12px; color: rgba(255, 255, 255, 0.3); width: 24px; text-align: right; }

.rev-filter { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 24px; position: sticky; top: calc(var(--trust-h) + var(--nav-h)); z-index: 100; }
.rev-filter-inner { max-width: var(--col); margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.rev-filter-btns { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.rev-filter-label { font-size: 11px; font-weight: 700; color: var(--text3); letter-spacing: 0.08em; text-transform: uppercase; margin-right: 12px; }
.rev-filter-btn { border: 1.5px solid var(--border); border-radius: 100px; padding: 6px 16px; font-size: 13px; font-weight: 500; color: var(--text2); background: var(--white); cursor: pointer; transition: all 0.2s; font-family: inherit; }
.rev-filter-btn:hover { border-color: var(--green); color: var(--green); }
.rev-filter-btn.active { border-color: var(--green); background: var(--green); color: #fff; }
.rev-write-link { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--green); text-decoration: none; white-space: nowrap; }
.rev-write-link svg { width: 16px; height: 16px; stroke: currentColor; }

.rev-section { background: var(--white); padding: 56px 24px 80px; }
.rev-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.rev-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px 24px; display: flex; flex-direction: column; transition: all 0.25s; }
.rev-card:hover { border-color: var(--green); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.06); }
.rev-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.rev-card-stars { color: var(--gold); font-size: 14px; letter-spacing: 2px; }
.rev-card-platform { font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; background: var(--surface); padding: 4px 10px; border-radius: 100px; letter-spacing: 0.04em; }
.rev-card-text { font-size: 15px; color: var(--text2); line-height: 1.7; font-style: italic; margin-bottom: 24px; flex: 1; }
.rev-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.rev-card-attr { display: flex; align-items: center; gap: 8px; }
.rev-card-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }
.rev-card-name { font-size: 12px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.04em; }
.rev-card-service { font-size: 11px; font-weight: 700; color: var(--green); background: var(--green-lt); padding: 3px 10px; border-radius: 100px; }

.rev-summary { background: var(--surface); padding: 64px 24px; }
.rev-summary-inner { max-width: var(--col); margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border-radius: var(--radius); overflow: hidden; }
.rev-summary-stat { background: var(--white); padding: 40px 24px; text-align: center; }
.rev-summary-num { font-family: var(--cond); font-weight: 900; font-size: 56px; color: var(--ink); line-height: 1; margin-bottom: 8px; }
.rev-summary-num em { font-style: normal; color: var(--gold); }
.rev-summary-label { font-size: 12px; color: var(--text3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }

@media (max-width: 1024px) {
    .rev-hero-inner { grid-template-columns: 1fr; gap: 48px; }
    .rev-grid { grid-template-columns: 1fr 1fr; }
    .rev-summary-inner { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
    .rev-grid { grid-template-columns: 1fr; }
    .rev-filter-inner { flex-direction: column; align-items: flex-start; gap: 16px; }
    .rev-write-link { margin-left: 0; }
}
</style>
