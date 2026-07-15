<script lang="ts">
	import Header from '$lib/components/new-site/Header.svelte';
	import Hero from '$lib/components/new-site/Hero.svelte';
	import Partners from '$lib/components/new-site/Partners.svelte';
	import Stats from '$lib/components/new-site/Stats.svelte';
	import CustomerJourney from '$lib/components/new-site/CustomerJourney.svelte';
	import BuiltFor from '$lib/components/new-site/BuiltFor.svelte';
	import GrowthEngine from '$lib/components/new-site/GrowthEngine.svelte';
	import Ecosystem from '$lib/components/new-site/Ecosystem.svelte';
	import RevenueLifts from './RevenueLifts.svelte';
	import CapacityModel from './CapacityModel.svelte';
	import FoundersProgram from './FoundersProgram.svelte';
	import FooterBar from './FooterBar.svelte';
	import { onMount } from 'svelte';

	// Optimization: Intersection Observer for smooth reveal on scroll
	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('reveal-active');
					}
				});
			},
			{ threshold: 0.1 }
		);

		document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
	});
</script>

<svelte:head>
	<title>ClearSky Analytics | Modern AI Conversational Platforms</title>
	<meta
		name="description"
		content="Turn conversations into booked work with ClearSky Analytics' AI-driven operational engines and growth marketing systems."
	/>
</svelte:head>

<div
	class="min-h-screen overflow-hidden bg-white text-text-dark selection:bg-brand-orange selection:text-white"
>
	<Header />

	<main>
		<div class="reveal">
			<Hero />
		</div>

		<div class="reveal">
			<Partners />
		</div>

		<div class="reveal">
			<Stats />
		</div>
		<div class="reveal">
			<CustomerJourney />
		</div>
		<div class="reveal">
			<BuiltFor />
		</div>
		<div class="reveal">
			<GrowthEngine />
		</div>
		<div class="reveal">
			<Ecosystem />
		</div>
		<div class="reveal">
			<RevenueLifts />
		</div>
		<div class="reveal">
			<CapacityModel />
		</div>
		<div class="reveal">
			<FoundersProgram />
		</div>
	</main>
	<FooterBar />
</div>

<style>
	/* Reveal on Scroll Animations */
	:global(.reveal) {
		opacity: 0;
		transform: translateY(30px);
		transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
	}

	:global(.reveal-active) {
		opacity: 1;
		transform: translateY(0);
	}

	/* Custom Scrollbar for premium feel */
	:global(::-webkit-scrollbar) {
		width: 10px;
	}
	:global(::-webkit-scrollbar-track) {
		background: #f1f1f1;
	}
	:global(::-webkit-scrollbar-thumb) {
		background: var(--color-brand-blue);
		border-radius: 10px;
	}
	:global(::-webkit-scrollbar-thumb:hover) {
		background: var(--color-brand-orange);
	}
</style>
