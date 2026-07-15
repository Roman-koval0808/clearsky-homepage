<script lang="ts">
	import Header from '$lib/components/new-site/Header.svelte';
	import FooterBar from '../FooterBar.svelte';
	import ClearSkyIntakeForm from '$lib/components/ClearSkyIntakeForm.svelte';
	import ClearSkyResultsModal from '$lib/components/ClearSkyResultsModal.svelte';

	let modalOpen = $state(false);
	let formOpen = $state(false);
	let diagnosticData = $state(null);

	function handleResults(data) {
		console.log('Diagnostic Results:', data);
		diagnosticData = data;
		modalOpen = true;
	}
</script>

<svelte:head>
	<title>ClearSky Sessions | Digital Health Diagnostic</title>
</svelte:head>

<div
	class="min-h-screen bg-white text-text-dark selection:bg-brand-orange selection:text-white"
>
	<Header />

	<main class="flex min-h-[80vh] flex-col items-center justify-center py-20">
		<div class="container mx-auto px-4 text-center">
			<h1 class="font-inter mb-6 text-4xl font-bold md:text-6xl">
				Digital Health <span class="text-brand-orange">Diagnostic</span>
			</h1>
			<p class="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
				Discover the hidden revenue gaps in your digital presence and unlock
				your business's full potential with our AI-driven analysis.
			</p>
			
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<button 
					class="btn-primary"
					onclick={() => formOpen = true}
				>
					Run Diagnostic Now
				</button>
				<a 
					href="/"
					class="font-inter text-sm font-bold text-brand-blue hover:underline"
				>
					Learn more about our engine →
				</a>
			</div>
		</div>

		<div class="mt-20 w-full bg-brand-blue-light/30 py-16">
			<div class="container mx-auto px-4">
				<div class="grid gap-12 md:grid-cols-3">
					<div class="text-center">
						<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
						<h3 class="font-inter mb-2 text-xl font-bold">Data-Driven</h3>
						<p class="text-slate-600">We analyze 15 different layers of your digital presence to give you an accurate picture.</p>
					</div>
					<div class="text-center">
						<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<h3 class="font-inter mb-2 text-xl font-bold">Real-Time</h3>
						<p class="text-slate-600">Get instant feedback on your recoverable revenue and market opportunity.</p>
					</div>
					<div class="text-center">
						<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04default_api:5cM3 9a9 9 0 0018 0V9a9 9 0 00-18 0v0z" />
							</svg>
						</div>
						<h3 class="font-inter mb-2 text-xl font-bold">Secure</h3>
						<p class="text-slate-600">Your data is handled with the highest level of privacy and security standards.</p>
					</div>
				</div>
			</div>
		</div>
	</main>

	<FooterBar />

	<ClearSkyIntakeForm
		isOpen={formOpen}
		onclose={() => formOpen = false}
		onresults={handleResults}
	/>

	<ClearSkyResultsModal
		isOpen={modalOpen}
		data={diagnosticData}
		onclose={() => modalOpen = false}
	/>
</div>

<style>
	h1 {
		font-family: var(--font-sohne);
	}
</style>
