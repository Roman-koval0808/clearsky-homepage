<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let formId = page.params.id;
	let form = $state<any>(null);
	let loading = $state(true);
	let submitting = $state(false);
	let success = $state(false);
	let error = $state<string | null>(null);

	let formData = $state<Record<string, any>>({});

	let containerElement = $state<HTMLElement | null>(null);

	async function fetchForm() {
		try {
			const res = await fetch(`/api/forms/${formId}`);
			const data = await res.json();
			if (data.success) {
				form = data.form;
				// Initialize form data
				form.config.fields.forEach((f: any) => {
					formData[f.id] = '';
				});
			} else {
				error = data.error;
			}
		} catch (err) {
			error = String(err);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (containerElement) {
			const resizeObserver = new ResizeObserver((entries) => {
				for (let entry of entries) {
					window.parent.postMessage({
						type: 'clearsky-form-resize',
						height: entry.contentRect.height + 40
					}, '*');
				}
			});
			resizeObserver.observe(containerElement);
			return () => resizeObserver.disconnect();
		}
	});

	async function handleSubmit() {
		submitting = true;
		error = null;
		try {
			const res = await fetch(`/api/forms/${formId}/submit`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});
			const data = await res.json();
			if (data.success) {
				success = true;
			} else {
				error = data.error;
			}
		} catch (err) {
			error = String(err);
		} finally {
			submitting = false;
		}
	}

	onMount(fetchForm);
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="bg-transparent p-4" bind:this={containerElement}>
	{#if loading}
		<div class="flex items-center justify-center py-10">
			<div class="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-brand-orange"></div>
		</div>
	{:else if error}
		<div class="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
			{error}
		</div>
	{:else if success}
		<div class="flex flex-col items-center justify-center py-10 text-center">
			<div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
			</div>
			<h2 class="mt-4 text-xl font-bold text-text-dark">Thank you!</h2>
			<p class="mt-2 text-sm text-text-body">Your response has been received.</p>
			<button class="mt-6 text-xs font-semibold text-brand-blue" onclick={() => { success = false; error = null; }}>Submit another response</button>
		</div>
	{:else}
		<div class="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
			<h2 class="text-xl font-bold text-text-dark">{form.title}</h2>
			{#if form.description}
				<p class="mt-1 text-sm text-text-body">{form.description}</p>
			{/if}

			<form class="mt-6 space-y-4" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
				{#each form.config.fields as field}
					<div>
						<label for={field.id} class="text-xs font-semibold text-text-dark">
							{field.label}{field.required ? ' *' : ''}
						</label>
						{#if field.type === 'textarea'}
							<textarea
								id={field.id}
								required={field.required}
								class="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-all focus:border-brand-orange focus:bg-white focus:outline-none"
								rows="4"
								bind:value={formData[field.id]}
							></textarea>
						{:else}
							<input
								id={field.id}
								type={field.type}
								required={field.required}
								class="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-all focus:border-brand-orange focus:bg-white focus:outline-none"
								bind:value={formData[field.id]}
							/>
						{/if}
					</div>
				{/each}

				<button
					type="submit"
					disabled={submitting}
					class="w-full rounded-xl bg-text-dark py-3 font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
				>
					{submitting ? 'Sending...' : 'Submit Response'}
				</button>
			</form>
			
			<div class="mt-6 flex items-center justify-center gap-1.5 opacity-30 grayscale">
				<span class="text-[10px] font-bold tracking-widest uppercase">Powered by</span>
				<img src="/new-logo.png" alt="ClearSky" class="h-3" />
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		background-color: transparent !important;
	}
</style>
