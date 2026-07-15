<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let showOverlay = $state(false);
	
	onMount(() => {
		// Show overlay every time user visits
		if (browser) {
			showOverlay = true;
		}
	});
	
	function dismissOverlay() {
		showOverlay = false;
	}
	
	$effect(() => {
		if (showOverlay && browser) {
			// Prevent body scroll when overlay is shown
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = '';
			};
		}
	});
</script>

{#if showOverlay}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
		<div class="mx-4 max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
			<h2 class="mb-4 text-2xl font-bold text-[#0F172B]">
				Welcome to ClearSky!
			</h2>
			<p class="mb-6 text-lg text-[#0F172B]">
				Thanks for coming to our website! We're excited to show you how ClearSky can help grow your revenue by 72-118% using our proven playbook.
			</p>
			<p class="mb-6 text-base text-gray-600">
				Click below to explore our platform and discover how AI-powered solutions can transform your business.
			</p>
			<button
				onclick={dismissOverlay}
				class="w-full rounded-lg bg-[#F66922] px-6 py-3 text-lg font-bold text-white transition-transform hover:scale-105"
			>
				Explore Our Platform
			</button>
		</div>
	</div>
{/if}
