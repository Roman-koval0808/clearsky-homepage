<script lang="ts">
  import { onMount } from 'svelte';
  import { pixelStore, setPromoFired, firePixel, captureIdentity } from './pixelStore.svelte';
  
  let email = $state('');
  let mounted = $state(false);

  const promos = [
    {
      id: 'discount_20',
      tag: 'Special Offer',
      headline: 'Get 20% off your next service.',
      sub: 'We noticed you\'re exploring your options. Enter your email to lock in a 20% discount on any plumbing service.',
      btn: 'Claim 20% Discount',
      success: 'Promo claimed! We have sent the 20% discount code to '
    },
    {
      id: 'limited_time',
      tag: 'Limited Time Offer',
      headline: 'Free Home Plumbing Inspection.',
      sub: 'Available for the next 24 hours. Sign up now to have one of our Red Seal plumbers perform a comprehensive system check.',
      btn: 'Claim Free Inspection',
      success: 'Offer claimed! We will contact you at '
    },
    {
      id: 'webinar_invite',
      tag: 'Exclusive Invite',
      headline: 'Join our DIY Plumbing Basics Webinar.',
      sub: 'Learn how to handle common household plumbing emergencies before they cause damage. Enter your email for the invite link.',
      btn: 'Send me the invite',
      success: 'Invite sent! Check your inbox at '
    },
    {
      id: 'discount_code',
      tag: 'Flash Sale',
      headline: 'Unlock your $50 off code.',
      sub: 'Ready to fix that leak? Grab a $50 instant discount code applicable to any repair over $150.',
      btn: 'Get my $50 code',
      success: 'Success! Your $50 code has been sent to '
    }
  ];

  let selectedPromoIndex = $state(0);

  onMount(() => {
    mounted = true;
    selectedPromoIndex = Math.floor(Math.random() * promos.length);
  });

  let currentPromo = $derived(promos[selectedPromoIndex]);

  let visitedService = $derived(pixelStore.eventLog.some(e => e.event === 'page_load' && e.label !== 'Session started' && (e.bucket === 'active' || e.bucket === 'comparison') && !e.label.includes('Reviews') && !e.label.includes('Specials') && !e.label.includes('Pricing')));
  let visitedPricing = $derived(pixelStore.eventLog.some(e => e.event === 'page_load' && (e.label.includes('Reviews') || e.label.includes('Specials') || e.label.includes('Pricing'))));
  
  let showPromo = $derived(
    mounted && visitedService && visitedPricing && !pixelStore.promoFired
  );

  let trackedShown = $state(false);
  $effect(() => {
    if (showPromo && !trackedShown) {
      firePixel('promo_shown', `Promo shown: ${currentPromo.id}`, 5, 'active');
      trackedShown = true;
    }
  });

  function submitPromo() {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    captureIdentity('promo_claim_submit', `Dynamic Promo Claimed: ${currentPromo.id}`, 20, 'active', { email });
    setPromoFired();
    alert(currentPromo.success + email);
  }

  function dismissPromo() {
    firePixel('promo_dismissed', 'User closed dynamic promo', 0);
    // Hide it permanently for this session so it's not annoying
    setPromoFired();
  }
</script>

<style>
  .promo-banner {
    position: fixed;
    right: 24px;
    top: 100px; /* Below the nav */
    width: 320px;
    background: #1B5E3B; /* --green */
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.2);
    z-index: 9998;
    color: #fff;
    overflow: hidden;
    font-family: Inter, system-ui, -apple-system;
    animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes slideIn {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .promo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(0,0,0,0.15);
  }

  .promo-title {
    font-weight: 700;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .promo-title-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    animation: pulse 2s infinite;
  }

  .promo-close {
    background: none;
    border: none;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }

  .promo-close:hover {
    color: #fff;
  }

  .promo-body {
    padding: 20px 16px;
  }

  .promo-headline {
    font-size: 20px;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .promo-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.8);
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .promo-input {
    width: 100%;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.1);
    color: #fff;
    font-size: 14px;
    margin-bottom: 12px;
    outline: none;
  }

  .promo-input::placeholder {
    color: rgba(255,255,255,0.5);
  }

  .promo-input:focus {
    border-color: rgba(255,255,255,0.4);
    background: rgba(255,255,255,0.15);
  }

  .promo-btn {
    width: 100%;
    padding: 12px;
    border-radius: 6px;
    border: none;
    background: #fff;
    color: #1B5E3B;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .promo-btn:hover {
    background: #f0f0f0;
  }
</style>

{#if showPromo}
  <div class="promo-banner" role="dialog" aria-label="Special Promotion">
    <div class="promo-header">
      <div class="promo-title"><div class="promo-title-dot"></div> {currentPromo.tag}</div>
      <button class="promo-close" aria-label="Close" on:click={dismissPromo}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="promo-body">
      <div class="promo-headline">{currentPromo.headline}</div>
      <div class="promo-sub">{currentPromo.sub}</div>
      <input type="email" class="promo-input" placeholder="Enter your email address" bind:value={email} />
      <button class="promo-btn" on:click={submitPromo}>{currentPromo.btn}</button>
    </div>
  </div>
{/if}
