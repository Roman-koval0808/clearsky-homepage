<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Dialog from '$lib/components/Dialog.svelte';

	let formId = page.params.id;
	let form = $state<any>(null);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state<string | null>(null);

	// Dialog state
	let showDialog = $state(false);
	let dialogTitle = $state('');
	let dialogMessage = $state('');
	let dialogType = $state<'confirm' | 'alert' | 'prompt'>('confirm');
	let dialogOnConfirm = $state<() => void>(() => {});

	function triggerDialog(options: { 
		title: string; 
		message?: string; 
		type?: 'confirm' | 'alert' | 'prompt';
		onConfirm?: () => void;
	}) {
		dialogTitle = options.title;
		dialogMessage = options.message || '';
		dialogType = options.type || 'confirm';
		dialogOnConfirm = options.onConfirm || (() => {});
		showDialog = true;
	}

	async function fetchForm() {
		try {
			const res = await fetch(`/api/forms/${formId}`);
			const data = await res.json();
			if (data.success) {
				form = data.form;
			} else {
				error = data.error;
			}
		} catch (err) {
			error = String(err);
		} finally {
			loading = false;
		}
	}

	async function saveForm() {
		saving = true;
		try {
			const res = await fetch('/api/forms', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});
			const data = await res.json();
			if (!data.success) {
				triggerDialog({
					title: 'Save Failed',
					message: data.error,
					type: 'alert'
				});
			} else {
				triggerDialog({
					title: 'Saved!',
					message: 'Form changes saved successfully.',
					type: 'alert'
				});
			}
		} catch (err) {
			triggerDialog({
				title: 'Error',
				message: String(err),
				type: 'alert'
			});
		} finally {
			saving = false;
		}
	}

	function addField() {
		form.config.fields = [
			...form.config.fields,
			{ id: `field_${Date.now()}`, type: 'text', label: 'New Field', required: false }
		];
	}

	function removeField(index: number) {
		form.config.fields = form.config.fields.filter((_: any, i: number) => i !== index);
	}

	onMount(fetchForm);
</script>

<Dialog 
	bind:show={showDialog} 
	title={dialogTitle} 
	message={dialogMessage} 
	type={dialogType} 
	onConfirm={dialogOnConfirm}
/>

<div class="mx-auto max-w-6xl px-4 py-10">
	{#if loading}
		<div class="text-center text-sm text-text-body">Loading builder...</div>
	{:else if error}
		<div class="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
	{:else}
		<div class="flex flex-col gap-6 lg:flex-row">
			<!-- Builder Panel -->
			<div class="flex-1">
				<div class="glass rounded-3xl p-8">
					<div class="flex items-center justify-between">
						<h1 class="text-2xl font-bold text-text-dark">Builder: {form.title}</h1>
						<button class="btn-primary" onclick={saveForm} disabled={saving}>
							{saving ? 'Saving...' : 'Save Changes'}
						</button>
					</div>

					<div class="mt-8 space-y-6">
						<div>
							<label class="text-sm font-bold text-text-dark">Form Title</label>
							<input class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-brand-orange focus:outline-none" bind:value={form.title} />
						</div>

						<div class="border-t border-slate-100 pt-6">
							<div class="flex items-center justify-between">
								<h2 class="text-lg font-bold text-text-dark">Fields</h2>
								<button class="text-sm font-semibold text-brand-blue" onclick={addField}>+ Add Field</button>
							</div>

							<div class="mt-4 space-y-4">
								{#each form.config.fields as field, i}
									<div class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
										<div class="grid grid-cols-1 gap-4 md:grid-cols-12">
											<div class="md:col-span-5">
												<label class="text-[10px] font-bold uppercase text-slate-400">Label</label>
												<input class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm" bind:value={field.label} />
											</div>
											<div class="md:col-span-3">
												<label class="text-[10px] font-bold uppercase text-slate-400">Type</label>
												<select class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm" bind:value={field.type}>
													<option value="text">Text</option>
													<option value="email">Email</option>
													<option value="textarea">Long Text</option>
													<option value="number">Number</option>
												</select>
											</div>
											<div class="flex items-end justify-center pb-2 md:col-span-2">
												<label class="flex cursor-pointer items-center gap-2">
													<input type="checkbox" bind:checked={field.required} />
													<span class="text-xs">Required</span>
												</label>
											</div>
											<div class="flex items-end justify-end pb-1 md:col-span-2">
												<button class="text-red-500 hover:text-red-700" onclick={() => removeField(i)}>
													<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Preview Panel -->
			<div class="w-full lg:w-96">
				<div class="glass sticky top-10 rounded-3xl p-6">
					<h2 class="text-sm font-bold uppercase text-slate-400">Live Preview</h2>
					<div class="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
						<h3 class="text-xl font-bold text-text-dark">{form.title}</h3>
						<form class="mt-6 space-y-4" onsubmit={(e) => e.preventDefault()}>
							{#each form.config.fields as field}
								<div>
									<label class="text-xs font-semibold text-text-dark">{field.label}{field.required ? '*' : ''}</label>
									{#if field.type === 'textarea'}
										<textarea class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" rows="3" placeholder="..."></textarea>
									{:else}
										<input type={field.type} class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="..." />
									{/if}
								</div>
							{/each}
							<button class="w-full rounded-xl bg-text-dark py-3 font-bold text-white shadow-md transition-transform active:scale-95">
								Submit
							</button>
						</form>
					</div>
					
					<div class="mt-6 border-t border-slate-100 pt-6">
						<h3 class="text-xs font-bold uppercase text-slate-400">Embed Code</h3>
						<div class="mt-2 rounded-xl bg-slate-900 p-3 font-mono text-[10px] text-slate-300">
							&lt;script src="{typeof window !== 'undefined' ? window.location.origin : ''}/ai-signals/forms/embed.js" data-form-id="{form.id}"&gt;&lt;/script&gt;
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
