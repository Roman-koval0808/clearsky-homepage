<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let { 
		show = $bindable(false), 
		title = '', 
		message = '', 
		confirmLabel = 'Confirm', 
		cancelLabel = 'Cancel',
		type = 'confirm', // 'confirm' | 'alert' | 'prompt'
		inputValue = $bindable(''),
		onConfirm = () => {},
		onCancel = () => {}
	} = $props();

	function handleConfirm() {
		onConfirm();
		show = false;
	}

	function handleCancel() {
		onCancel();
		show = false;
	}
</script>

{#if show}
	<div 
		class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={handleCancel}
	>
		<div 
			class="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
			transition:scale={{ duration: 200, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
		>
			<div class="p-8">
				<h3 class="text-xl font-bold text-text-dark">{title}</h3>
				{#if message}
					<p class="mt-3 text-sm text-text-body">{message}</p>
				{/if}

				{#if type === 'prompt'}
					<div class="mt-6">
						<input 
							type="text" 
							class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-brand-orange focus:bg-white focus:outline-none"
							bind:value={inputValue}
							placeholder="Enter text..."
							autofocus
							onkeydown={(e) => e.key === 'Enter' && handleConfirm()}
						/>
					</div>
				{/if}

				<div class="mt-8 flex items-center justify-end gap-3">
					{#if type !== 'alert'}
						<button 
							class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-text-dark transition-colors hover:bg-slate-50"
							onclick={handleCancel}
						>
							{cancelLabel}
						</button>
					{/if}
					<button 
						class="rounded-xl bg-text-dark px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform active:scale-95"
						onclick={handleConfirm}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
