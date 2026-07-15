<script lang="ts">
	import { onMount } from 'svelte';
	import Dialog from '$lib/components/Dialog.svelte';

	let forms = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Dialog state
	let showDialog = $state(false);
	let dialogTitle = $state('');
	let dialogMessage = $state('');
	let dialogType = $state<'confirm' | 'alert' | 'prompt'>('confirm');
	let dialogInputValue = $state('');
	let dialogOnConfirm = $state<() => void>(() => {});

	function triggerDialog(options: { 
		title: string; 
		message?: string; 
		type?: 'confirm' | 'alert' | 'prompt';
		onConfirm: (val?: string) => void;
	}) {
		dialogTitle = options.title;
		dialogMessage = options.message || '';
		dialogType = options.type || 'confirm';
		dialogInputValue = '';
		dialogOnConfirm = () => options.onConfirm(dialogInputValue);
		showDialog = true;
	}

	async function fetchForms() {
		try {
			const res = await fetch('/api/forms');
			const data = await res.json();
			if (data.success) {
				forms = data.forms;
			} else {
				error = data.error;
			}
		} catch (err) {
			error = String(err);
		} finally {
			loading = false;
		}
	}

	async function createForm() {
		triggerDialog({
			title: 'Create New Form',
			message: 'What should we call this form?',
			type: 'prompt',
			onConfirm: async (title) => {
				if (!title) return;

				try {
					const res = await fetch('/api/forms', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							title,
							config: {
								fields: [
									{ id: 'name', type: 'text', label: 'Name', required: true },
									{ id: 'email', type: 'email', label: 'Email', required: true },
									{ id: 'message', type: 'textarea', label: 'Message', required: true }
								]
							}
						})
					});
					const data = await res.json();
					if (data.success) {
						window.location.href = `/ai-signals/forms/build/${data.id}`;
					} else {
						triggerDialog({
							title: 'Error',
							message: data.error,
							type: 'alert',
							onConfirm: () => {}
						});
					}
				} catch (err) {
					triggerDialog({
						title: 'Error',
						message: String(err),
						type: 'alert',
						onConfirm: () => {}
					});
				}
			}
		});
	}

	function copyEmbed(id: string) {
		const script = `<script src="${window.location.origin}/ai-signals/forms/embed.js" data-form-id="${id}"><\/script>`;
		navigator.clipboard.writeText(script);
		triggerDialog({
			title: 'Copied!',
			message: 'The embed script has been copied to your clipboard.',
			type: 'alert',
			onConfirm: () => {}
		});
	}

	onMount(fetchForms);
</script>

<Dialog 
	bind:show={showDialog} 
	title={dialogTitle} 
	message={dialogMessage} 
	type={dialogType} 
	bind:inputValue={dialogInputValue}
	onConfirm={dialogOnConfirm}
/>

<div class="mx-auto max-w-6xl px-4 py-10">
	<div class="glass rounded-3xl p-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-text-dark">Form Builder</h1>
				<p class="mt-2 text-text-body">Create and manage embedded forms for your website.</p>
			</div>
			<button class="btn-primary" onclick={createForm}>
				Create New Form
			</button>
		</div>

		{#if loading}
			<div class="mt-10 text-center text-sm text-text-body">Loading forms...</div>
		{:else if error}
			<div class="mt-10 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
		{:else if forms.length === 0}
			<div class="mt-10 rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
				<p class="text-text-body">No forms created yet.</p>
				<button class="mt-4 text-brand-blue font-semibold" onclick={createForm}>Create your first form →</button>
			</div>
		{:else}
			<div class="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each forms as form (form.id)}
					<div class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-brand-orange hover:shadow-lg">
						<h3 class="text-lg font-bold text-text-dark">{form.title}</h3>
						<p class="mt-1 text-[10px] text-text-body opacity-60">ID: {form.id}</p>
						
						<div class="mt-4 flex flex-wrap gap-2">
							<a href="/ai-signals/forms/build/{form.id}" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
								Edit Builder
							</a>
							<button 
								class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
								onclick={() => copyEmbed(form.id)}
							>
								Copy Embed
							</button>
						</div>

						<div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
							<span class="text-[10px] text-slate-400">Created {new Date(form.created_at).toLocaleDateString()}</span>
							<a href="/ai-signals/forms/embed/{form.id}" target="_blank" class="text-xs font-semibold text-brand-blue hover:underline">Preview →</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
