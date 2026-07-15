<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import WelcomeOverlay from '$lib/components/WelcomeOverlay.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<WelcomeOverlay />
{@render children()}
