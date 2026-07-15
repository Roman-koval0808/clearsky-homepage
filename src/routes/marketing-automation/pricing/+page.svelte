<script lang="ts">
    import { onMount } from 'svelte';
    import { firePixel } from '$lib/components/marketing-automation/rightflush/pixelStore.svelte';

    onMount(() => {
        firePixel('page_load', 'Page Visited - Pricing', 6, 'comparison');
    });

    const pricingTiers = [
        {
            title: "Standard Service Call",
            price: "$129",
            description: "Diagnostic fee & first 30 minutes of labor.",
            features: [
                "Upfront diagnosis",
                "No hidden fees",
                "Fully stocked trucks"
            ]
        },
        {
            title: "Hot Water Install",
            price: "$1,200+",
            description: "Includes standard tank, delivery, and professional installation.",
            features: [
                "Same-day installation available",
                "Old tank removal",
                "10-year warranty"
            ]
        },
        {
            title: "Emergency Response",
            price: "$199",
            description: "Priority dispatch for burst pipes, active leaks, or major blockages.",
            features: [
                "Arrive in under 2 hours",
                "Stop the damage immediately",
                "Available 24/7"
            ]
        }
    ];
</script>

<svelte:head>
  <title>Pricing &amp; Rates — RightFlush Plumbing Timmins</title>
  <meta name="description" content="Upfront, transparent pricing for plumbing services in Timmins. No surprises, no hidden fees.">
</svelte:head>

<section class="pricing-hero">
    <div class="hero-inner">
      <div class="hero-label">Upfront Pricing</div>
      <h1 class="hero-headline">No surprises.<br>No hidden fees.</h1>
      <p class="hero-sub">We believe in transparent pricing before we start any work. You approve the quote, and that's what you pay.</p>
    </div>
</section>

<div class="pricing-main">
    <div class="pricing-main-inner">
      <div class="pricing-grid">
        {#each pricingTiers as tier}
            <div class="pricing-card">
                <h3 class="tier-title">{tier.title}</h3>
                <div class="tier-price">{tier.price}</div>
                <p class="tier-desc">{tier.description}</p>
                <ul class="tier-features">
                    {#each tier.features as feature}
                        <li>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                            {feature}
                        </li>
                    {/each}
                </ul>
            </div>
        {/each}
      </div>
    </div>
</div>

<style>
.pricing-hero {
    background: #101828;
    color: #fff;
    padding: 100px 24px 60px;
    text-align: center;
}
.hero-inner {
    max-width: 800px;
    margin: 0 auto;
}
.hero-label {
    color: #4ade80;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 14px;
    margin-bottom: 16px;
}
.hero-headline {
    font-size: 56px;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 24px;
}
.hero-sub {
    font-size: 18px;
    color: #98a2b3;
    line-height: 1.5;
}
.pricing-main {
    padding: 80px 24px;
    background: #f9fafb;
}
.pricing-main-inner {
    max-width: 1100px;
    margin: 0 auto;
}
.pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
}
.pricing-card {
    background: #fff;
    border: 1px solid #eaecf0;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 6px rgba(16, 24, 40, 0.03);
    transition: transform 0.2s;
}
.pricing-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);
}
.tier-title {
    font-size: 20px;
    font-weight: 700;
    color: #101828;
    margin-bottom: 16px;
}
.tier-price {
    font-size: 40px;
    font-weight: 800;
    color: #1B5E3B;
    margin-bottom: 12px;
}
.tier-desc {
    color: #475467;
    font-size: 15px;
    line-height: 1.5;
    margin-bottom: 24px;
}
.tier-features {
    list-style: none;
    padding: 0;
    margin: 0;
}
.tier-features li {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #344054;
    font-size: 15px;
    margin-bottom: 12px;
}
.tier-features li svg {
    width: 18px;
    height: 18px;
    color: #4ade80;
    flex-shrink: 0;
}
</style>
