<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel, extractFormIdentity } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    let days = $state(12);
    let hours = $state(8);
    let minutes = $state(34);

    let aptName = $state('');
    let aptPhone = $state('');
    let aptFormEl: HTMLElement | null = null;
    let selectedOffer = $state('Spring Prep Package — $195');

    onMount(() => {
        firePixel('page_load', 'Page Visited - Specials', 6, 'comparison');

        const target = new Date('2026-05-31T23:59:59');
        const updateCountdown = () => {
            const now = new Date();
            const diff = Math.max(0, target.getTime() - now.getTime());
            days = Math.floor(diff / (1000 * 60 * 60 * 24));
            hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        };
        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    });

    function claimOffer(offerName: string) {
        firePixel('spl_claim_click', 'Specials: claim clicked — ' + offerName, 12, 'active');
        selectedOffer = offerName;
        document.getElementById('aptForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function submitApt() {
        if (!aptName || !aptPhone) {
            alert('Please provide your name and phone number.');
            return;
        }
        captureIdentity('spl_apt_submit', 'Specials: appointment booked', 20, 'active', { phone: aptPhone, name: aptName });
        alert('Booked — confirmed within 2 hours ✓');
    }
</script>

<svelte:head>
  <title>Specials &amp; Seasonal Offers — RightFlush Plumbing Timmins</title>
  <meta name="description" content="Current plumbing specials from RightFlush Plumbing in Timmins. Seasonal offers on water heaters, maintenance packages, and bathroom renovations. Book to claim.">
</svelte:head>

<section class="spl-hero">
    <div class="spl-hero-texture"></div>
    <div class="spl-hero-inner">
      <div class="reveal">
        <div class="spl-hero-label">Specials &amp; Seasonal Offers</div>
        <h1 class="spl-hero-headline">Current offers<br>for Timmins<br>homeowners.</h1>
        <p class="spl-hero-sub">Seasonal offers on the jobs we're already scheduling in volume. No inflated original prices, no fine print that swallows the deal. Book before the offer expires and save on real work.</p>
      </div>
      <div class="reveal reveal-delay-2">
        <div class="spl-urgency-card">
          <div class="spl-urgency-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Featured offer ending</div>
          <div class="spl-urgency-title">Spring Prep Package</div>
          <div class="spl-urgency-sub">Annual plumbing inspection + water heater flush + anode rod check. Usually $280 — on special for $195 through the end of May.</div>
          <div class="spl-countdown">
            <div class="spl-countdown-unit"><div class="spl-countdown-num">{days.toString().padStart(2, '0')}</div><div class="spl-countdown-label">Days</div></div>
            <div class="spl-countdown-unit"><div class="spl-countdown-num">{hours.toString().padStart(2, '0')}</div><div class="spl-countdown-label">Hours</div></div>
            <div class="spl-countdown-unit"><div class="spl-countdown-num">{minutes.toString().padStart(2, '0')}</div><div class="spl-countdown-label">Minutes</div></div>
          </div>
          <button class="spl-claim-btn" onclick={() => claimOffer('Spring Prep Package — $195')}>Claim this offer — book now</button>
        </div>
      </div>
    </div>
</section>

<div class="spl-main">
    <div class="spl-main-inner">
      <div class="spl-grid">
        <div class="spl-card featured reveal visible">
          <div class="spl-card-header">
            <span class="spl-card-tag gold">⭐ Featured offer</span>
            <span class="spl-card-expires"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Expires May 31, 2026</span>
          </div>
          <div class="spl-card-body">
            <div class="spl-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
            <div class="spl-card-content">
              <div class="spl-card-title">Spring Prep Package</div>
              <p class="spl-card-desc">Full plumbing inspection of all visible supply lines, drain connections, and fixtures. Water heater sediment flush and anode rod inspection. Written report with any recommended action items.</p>
              <div class="spl-card-savings"><span class="spl-card-saving-num">$195</span><span class="spl-card-saving-label">Regular price $280 · Save $85</span></div>
              <button class="spl-card-claim" onclick={() => claimOffer('Spring Prep Package — $195')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Book to claim this offer</button>
            </div>
          </div>
        </div>

        <div class="spl-card reveal visible">
          <div class="spl-card-header">
            <span class="spl-card-tag green">Hot Water</span>
            <span class="spl-card-expires"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Expires June 30, 2026</span>
          </div>
          <div class="spl-card-body">
            <div class="spl-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
            <div class="spl-card-content">
              <div class="spl-card-title">Tank replacement discount — $150 off</div>
              <p class="spl-card-desc">$150 off any 40-gallon or 50-gallon natural gas water heater replacement. We supply and install — includes removal and disposal of your old unit.</p>
              <div class="spl-card-savings"><span class="spl-card-saving-num">$150 off</span><span class="spl-card-saving-label">Applied at time of booking</span></div>
              <button class="spl-card-claim" onclick={() => claimOffer('Hot Water Tank — $150 off')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Book to claim this offer</button>
            </div>
          </div>
        </div>

        <div class="spl-card reveal visible">
          <div class="spl-card-header">
            <span class="spl-card-tag rust">Referral</span>
            <span class="spl-card-expires">Ongoing — no expiry</span>
          </div>
          <div class="spl-card-body">
            <div class="spl-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
            <div class="spl-card-content">
              <div class="spl-card-title">Refer a neighbour — $50 credit each</div>
              <p class="spl-card-desc">Refer a friend or family member who books and completes a job. Both receive a $50 credit toward your next service call.</p>
              <div class="spl-card-savings"><span class="spl-card-saving-num">$50</span><span class="spl-card-saving-label">Credit for you and your referral</span></div>
              <button class="spl-card-claim" onclick={() => claimOffer('Referral Credit — $50 each')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>Share and claim</button>
            </div>
          </div>
        </div>
      </div>

      <div class="spl-sidebar reveal reveal-delay-1 visible">
        <div class="spl-apt-card" id="aptForm">
          <div class="spl-apt-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span class="spl-apt-header-text">Book to claim</span>
          </div>
          <div class="spl-apt-body">
            <div class="spl-apt-title">Claim your offer</div>
            <p class="spl-apt-sub">Select the offer, enter your details, and we'll confirm within 2 hours. Offer is locked when you book.</p>
            <div class="spl-apt-field">
              <label class="spl-apt-label">Offer</label>
              <select class="spl-apt-select" bind:value={selectedOffer}>
                <option>Spring Prep Package — $195</option>
                <option>Hot Water Tank — $150 off</option>
                <option>Bathroom Reno Priority Booking</option>
                <option>Referral Credit — $50 each</option>
              </select>
            </div>
            <div class="spl-apt-field">
              <label class="spl-apt-label">Name</label>
              <input class="spl-apt-input" type="text" placeholder="Your name" bind:value={aptName}>
            </div>
            <div class="spl-apt-field">
              <label class="spl-apt-label">Phone</label>
              <input class="spl-apt-input" type="tel" placeholder="(705) 000-0000" bind:value={aptPhone}>
            </div>
            <button class="spl-apt-btn" onclick={submitApt}>Book and claim offer</button>
            <div class="spl-apt-note">Confirmed within 2 hours · Offer locked on booking</div>
          </div>
        </div>
        <div class="spl-trust-card">
          <div class="spl-trust-title">The fine print — plainly</div>
          {#each [
            'Flat-rate pricing always applies.',
            'No pressure on decisions.',
            'Workmanship guarantee applies.'
          ] as tip}
            <div class="spl-trust-item">
                <div class="spl-trust-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                <div class="spl-trust-text">{tip}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
</div>

<style>
.spl-hero { background: var(--gold); padding: 56px 24px 48px; position: relative; overflow: hidden; }
.spl-hero-texture { position: absolute; inset: 0; background-image: linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px); background-size: 40px 40px; }
.spl-hero-inner { position: relative; z-index: 1; max-width: var(--col); margin: 0 auto; display: grid; grid-template-columns: 1fr 400px; gap: 64px; align-items: center; }
.spl-hero-label { font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.4); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
.spl-hero-label::before { content: ''; display: block; width: 20px; height: 2px; background: rgba(0,0,0,0.3); }
.spl-hero-headline { font-family: var(--cond); font-weight: 900; font-size: clamp(44px, 6vw, 80px); line-height: 0.9; text-transform: uppercase; color: var(--ink); margin-bottom: 20px; }
.spl-hero-sub { font-size: 16px; font-weight: 300; color: rgba(0,0,0,0.6); line-height: 1.7; max-width: 480px; }

.spl-urgency-card { background: var(--ink); border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
.spl-urgency-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--rust); color: #fff; font-family: var(--cond); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; margin-bottom: 16px; }
.spl-urgency-badge svg { width: 12px; height: 12px; stroke: currentColor; }
.spl-urgency-title { font-family: var(--cond); font-weight: 800; font-size: 24px; color: #fff; text-transform: uppercase; margin-bottom: 8px; }
.spl-urgency-sub { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 24px; line-height: 1.5; }
.spl-countdown { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
.spl-countdown-unit { background: rgba(255,255,255,0.06); border-radius: 12px; padding: 16px 8px; text-align: center; }
.spl-countdown-num { font-family: var(--cond); font-weight: 900; font-size: 32px; color: #fff; line-height: 1; }
.spl-countdown-label { font-size: 10px; color: rgba(255,255,255,0.3); text-transform: uppercase; margin-top: 4px; letter-spacing: 0.04em; }
.spl-claim-btn { width: 100%; background: var(--gold); color: var(--ink); border: none; border-radius: var(--radius); padding: 14px; font-family: var(--cond); font-weight: 800; font-size: 16px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
.spl-claim-btn:hover { background: #fff; }

.spl-main { padding: 64px 24px 80px; background: var(--white); }
.spl-main-inner { max-width: var(--col); margin: 0 auto; display: grid; grid-template-columns: 1fr 360px; gap: 48px; align-items: start; }
.spl-grid { display: flex; flex-direction: column; gap: 20px; }

.spl-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: all 0.2s; }
.spl-card:hover { border-color: var(--green); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.06); }
.spl-card.featured { border-color: var(--gold); background: var(--gold-lt); }
.spl-card-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 0; }
.spl-card-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; letter-spacing: 0.06em; }
.spl-card-tag.gold { background: var(--gold); color: var(--ink); }
.spl-card-tag.green { background: var(--green-lt); color: var(--green); }
.spl-card-tag.rust { background: var(--rust-lt); color: var(--rust); }
.spl-card-expires { font-size: 11px; color: var(--text3); display: flex; align-items: center; gap: 6px; }
.spl-card-expires svg { width: 12px; height: 12px; stroke: currentColor; }
.spl-card-body { padding: 24px; display: flex; align-items: flex-start; gap: 24px; }
.spl-card-icon { width: 56px; height: 56px; border-radius: 12px; background: var(--surface); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.spl-card-icon svg { width: 28px; height: 28px; stroke: var(--green); }
.spl-card.featured .spl-card-icon { background: rgba(245, 124, 34, 0.15); }
.spl-card.featured .spl-card-icon svg { stroke: var(--gold); }
.spl-card-content { flex: 1; }
.spl-card-title { font-family: var(--cond); font-weight: 800; font-size: 24px; color: var(--ink); text-transform: uppercase; margin-bottom: 8px; }
.spl-card-desc { font-size: 14px; color: var(--text2); line-height: 1.6; margin-bottom: 20px; }
.spl-card-savings { display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px; }
.spl-card-saving-num { font-family: var(--cond); font-weight: 900; font-size: 40px; color: var(--green); line-height: 1; }
.spl-card.featured .spl-card-saving-num { color: var(--gold); }
.spl-card-saving-label { font-size: 13px; color: var(--text3); }
.spl-card-claim { display: inline-flex; align-items: center; gap: 8px; background: var(--green); color: #fff; font-family: var(--cond); font-weight: 700; font-size: 15px; text-transform: uppercase; padding: 12px 24px; border-radius: var(--radius); border: none; cursor: pointer; transition: background 0.2s; }
.spl-card-claim:hover { background: var(--green-mid); }
.spl-card-claim svg { width: 16px; height: 16px; stroke: currentColor; }
.spl-card.featured .spl-card-claim { background: var(--gold); color: var(--ink); }

.spl-sidebar { position: sticky; top: calc(var(--trust-h) + var(--nav-h) + 24px); display: flex; flex-direction: column; gap: 16px; }
.spl-apt-card { background: var(--ink); border-radius: 16px; overflow: hidden; }
.spl-apt-header { background: var(--green); padding: 16px 20px; display: flex; align-items: center; gap: 10px; }
.spl-apt-header svg { width: 18px; height: 18px; stroke: #fff; }
.spl-apt-header-text { font-family: var(--cond); font-size: 15px; font-weight: 700; color: #fff; text-transform: uppercase; }
.spl-apt-body { padding: 28px; }
.spl-apt-title { font-family: var(--cond); font-size: 22px; font-weight: 700; color: #fff; text-transform: uppercase; margin-bottom: 8px; }
.spl-apt-sub { font-size: 12px; color: rgba(255,255,255,0.45); margin-bottom: 20px; line-height: 1.5; }
.spl-apt-field { margin-bottom: 12px; }
.spl-apt-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; margin-bottom: 6px; display: block; }
.spl-apt-input, .spl-apt-select { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius); padding: 12px 14px; font-size: 14px; font-family: inherit; color: #fff; outline: none; transition: border-color 0.2s; }
.spl-apt-btn { width: 100%; background: var(--green); color: #fff; border: none; border-radius: var(--radius); padding: 14px; font-family: var(--cond); font-weight: 700; font-size: 16px; text-transform: uppercase; cursor: pointer; transition: background 0.2s; margin-top: 8px; }
.spl-apt-note { font-size: 11px; color: rgba(255,255,255,0.25); text-align: center; margin-top: 12px; }

.spl-trust-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; }
.spl-trust-title { font-family: var(--cond); font-size: 13px; font-weight: 700; color: var(--text3); text-transform: uppercase; margin-bottom: 16px; }
.spl-trust-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.spl-trust-item:last-child { margin-bottom: 0; }
.spl-trust-icon svg { width: 14px; height: 14px; stroke: var(--green); }
.spl-trust-text { font-size: 13px; color: var(--text2); line-height: 1.5; }

@media (max-width: 1024px) {
    .spl-hero-inner { grid-template-columns: 1fr; gap: 48px; }
    .spl-main-inner { grid-template-columns: 1fr; }
    .spl-sidebar { position: static; }
}
@media (max-width: 768px) {
    .spl-card-body { flex-direction: column; gap: 16px; }
}
</style>
