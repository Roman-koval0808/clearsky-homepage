<script lang="ts">
	import { onMount } from 'svelte';
	import { dashboardState } from '$lib/clearsky/dashboard-state.svelte.ts';

	const PROVIDERS = [
		'clearsky_website_forms', 'telnyx_voice', 'telnyx_sms', 'email_provider',
		'google_business_profile', 'dataforseo', 'matomo_analytics', 'clearsky_viewroom',
		'fotojobber', 'quote_systems', 'booking_systems', 'crms', 'social_media',
		'competitor_intelligence', 'contentradar', 'system_health'
	] as const;

	type Provider = (typeof PROVIDERS)[number];

	type MockSignal = {
		id: string;
		name: string;
		provider: Provider;
		event_type: string;
		unstructured_text: string;
	};

	const MOCK_SIGNALS: MockSignal[] = [
		{
			id: 'gbp_review_4star_minor_complaint',
			name: 'GBP Review: 4★, minor communication complaint',
			provider: 'google_business_profile',
			event_type: 'review_received',
			unstructured_text:
				'Great work on our roof repair. The crew was professional and the job looks good. Only reason I am giving 4 stars is because communication before the appointment was a little slow.'
		},
		{
			id: 'telnyx_sms_quote_request',
			name: 'Telnyx SMS: quote request + timeline',
			provider: 'telnyx_sms',
			event_type: 'sms_received',
			unstructured_text:
				"Hey — can I get a quote for a new water heater? Ours started leaking today. I'd love someone out this week if possible."
		},
		{
			id: 'telnyx_voice_voicemail_urgent',
			name: 'Telnyx Voice: urgent voicemail (water in basement)',
			provider: 'telnyx_voice',
			event_type: 'voicemail_transcribed',
			unstructured_text:
				"Hi, I'm calling because our basement is taking on water and I think the sump pump died. We need help ASAP — please call me back."
		}
	];

	type Tab = 'standard' | 'sms' | 'email' | 'voice';

	type UiState = {
		activeTab: Tab;
		selected_mock_id: string;
		loading: boolean;
		http_status: number | null;
		response_json: unknown | null;
		error: string | null;
	};

	// Forms
	let form = $state({ event_id: '', provider: MOCK_SIGNALS[0].provider as Provider, event_type: MOCK_SIGNALS[0].event_type, unstructured_text: MOCK_SIGNALS[0].unstructured_text });
	let smsForm = $state({ from: '+14155550101', text: 'Hi, I need to schedule an HVAC tune-up.' });
	let emailForm = $state({ from: 'client@example.com', subject: 'Emergency Leak', text: 'Our basement is flooding!' });
	let voiceForm = $state({ from: '+16505551234', status: 'call.hangup' });

	let ui: UiState = $state({
		activeTab: 'standard',
		selected_mock_id: MOCK_SIGNALS[0].id,
		loading: false,
		http_status: null,
		response_json: null,
		error: null
	});

	const extraction = $derived.by(() => {
		const value = ui.response_json as any;
		if (value?.success && value?.extraction) return value.extraction;
		return null;
	});

	function regenerateEventId() {
		form.event_id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
	}

	function loadMock(mockId: string) {
		const mock = MOCK_SIGNALS.find((m) => m.id === mockId);
		if (!mock) return;
		ui.selected_mock_id = mock.id;
		form.provider = mock.provider;
		form.event_type = mock.event_type;
		form.unstructured_text = mock.unstructured_text;
		regenerateEventId();
	}

	async function runFetch(url: string, body: any) {
		ui.loading = true; ui.error = null; ui.http_status = null; ui.response_json = null;
		try {
			const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
			ui.http_status = res.status;
			ui.response_json = await res.json().catch(() => null);
			if (res.ok) setTimeout(() => dashboardState.sync(), 2000);
		} catch (err) {
			ui.error = String(err);
		} finally { ui.loading = false; }
	}

	onMount(regenerateEventId);
</script>

<div class="mx-auto min-h-screen w-full max-w-6xl px-4 py-10">
	<div class="mb-6 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1">
		{#each ['standard', 'sms', 'email', 'voice'] as t}
			<button class={`flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all ${ui.activeTab === t ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`} onclick={() => ui.activeTab = t as Tab}>{t}</button>
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
		<!-- Sidebar Controls -->
		<aside class="lg:col-span-4 space-y-6">
			<section class="glass rounded-3xl p-6">
				<h2 class="text-sm font-bold text-text-dark uppercase tracking-widest">Simulator Settings</h2>
				<p class="mt-2 text-xs text-text-body">Mocking real-world ingestion for <strong>{ui.activeTab.toUpperCase()}</strong> signals.</p>
				
				{#if ui.activeTab === 'standard'}
					<div class="mt-6 flex flex-col gap-3">
						{#each MOCK_SIGNALS as sig}
							<button class={`rounded-xl border p-3 text-left transition-all ${sig.id === ui.selected_mock_id ? 'border-brand-blue bg-blue-50/50' : 'border-slate-200 bg-white'}`} onclick={() => loadMock(sig.id)}>
								<div class="text-xs font-bold">{sig.name}</div>
								<div class="mt-1 text-[10px] opacity-60 uppercase">{sig.provider}</div>
							</button>
						{/each}
					</div>
				{:else}
					<div class="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center">
						<div class="text-xs text-slate-400 font-medium">Webhook endpoint active at:</div>
						<code class="mt-2 block text-[10px] text-brand-blue">/api/signals/{ui.activeTab === 'sms' ? 'telnyx/sms' : ui.activeTab === 'voice' ? 'telnyx/voice' : 'email'}</code>
					</div>
				{/if}
			</section>

			<section class="glass rounded-3xl p-6 bg-slate-900 text-white">
				<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Result Output</h2>
				{#if ui.error}
					<div class="mt-4 text-xs text-red-400 font-mono">{ui.error}</div>
				{:else if ui.http_status}
					<div class="mt-4 flex items-center justify-between">
						<span class="text-xs font-bold">HTTP {ui.http_status}</span>
						<span class="text-[10px] text-slate-400">{ui.loading ? 'WAITING...' : 'COMPLETED'}</span>
					</div>
					<pre class="mt-4 max-h-64 overflow-auto text-[10px] text-green-400 leading-relaxed">{JSON.stringify(ui.response_json, null, 2)}</pre>
				{:else}
					<div class="mt-10 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">Idle — Ready for Input</div>
				{/if}
			</section>
		</aside>

		<!-- Main Input Form -->
		<main class="lg:col-span-8">
			<section class="glass rounded-3xl p-8 min-h-[500px]">
				{#if ui.activeTab === 'standard'}
					<h2 class="text-2xl font-black text-text-dark tracking-tight">Standard Simulation</h2>
					<div class="mt-8 space-y-6">
						<div><label class="text-[10px] font-bold uppercase text-slate-400">Target Provider</label>
						<select class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" bind:value={form.provider}>
							{#each PROVIDERS as p}<option value={p}>{p}</option>{/each}
						</select></div>
						<div><label class="text-[10px] font-bold uppercase text-slate-400">Unstructured Signal Text</label>
						<textarea class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 min-h-[200px] text-sm" bind:value={form.unstructured_text}></textarea></div>
						<button class="btn-primary w-full py-4 text-sm" disabled={ui.loading} onclick={() => runFetch('/api/ai-signals/extract', { event_id: form.event_id, provider: form.provider, event_type: form.event_type, unstructured_text: form.unstructured_text })}>
							{ui.loading ? 'Processing AI...' : 'Run Extraction Pipeline →'}
						</button>
					</div>

				{:else if ui.activeTab === 'sms'}
					<h2 class="text-2xl font-black text-text-dark tracking-tight">Telnyx SMS Simulator</h2>
					<div class="mt-8 space-y-6">
						<div><label class="text-[10px] font-bold uppercase text-slate-400">Sender Number</label>
						<input class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono" bind:value={smsForm.from} /></div>
						<div><label class="text-[10px] font-bold uppercase text-slate-400">Message Content</label>
						<textarea class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 min-h-[150px] text-sm" bind:value={smsForm.text}></textarea></div>
						<button class="btn-primary w-full py-4 text-sm" disabled={ui.loading} onclick={() => runFetch('/api/signals/telnyx/sms', { data: { payload: { from: { phone_number: smsForm.from }, text: smsForm.text } } })}>
							Fire SMS Webhook →
						</button>
					</div>

				{:else if ui.activeTab === 'email'}
					<h2 class="text-2xl font-black text-text-dark tracking-tight">Generic Email Simulator</h2>
					<div class="mt-8 space-y-6">
						<div class="grid grid-cols-2 gap-4">
							<div><label class="text-[10px] font-bold uppercase text-slate-400">From Address</label>
							<input class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" bind:value={emailForm.from} /></div>
							<div><label class="text-[10px] font-bold uppercase text-slate-400">Subject Line</label>
							<input class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" bind:value={emailForm.subject} /></div>
						</div>
						<div><label class="text-[10px] font-bold uppercase text-slate-400">Email Body (Plain Text)</label>
						<textarea class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 min-h-[150px] text-sm" bind:value={emailForm.text}></textarea></div>
						<button class="btn-primary w-full py-4 text-sm" disabled={ui.loading} onclick={() => runFetch('/api/signals/email', { From: emailForm.from, Subject: emailForm.subject, TextBody: emailForm.text })}>
							Fire Email Webhook →
						</button>
					</div>

				{:else if ui.activeTab === 'voice'}
					<h2 class="text-2xl font-black text-text-dark tracking-tight">Telnyx Voice Simulator</h2>
					<div class="mt-8 space-y-6">
						<div><label class="text-[10px] font-bold uppercase text-slate-400">Caller Number</label>
						<input class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono" bind:value={voiceForm.from} /></div>
						<div><label class="text-[10px] font-bold uppercase text-slate-400">Event Type</label>
						<select class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" bind:value={voiceForm.status}>
							<option value="call.answered">call.answered</option>
							<option value="call.hangup">call.hangup</option>
							<option value="call.recording.saved">call.recording.saved</option>
						</select></div>
						<button class="btn-primary w-full py-4 text-sm" disabled={ui.loading} onclick={() => runFetch('/api/signals/telnyx/voice', { data: { event_type: voiceForm.status, payload: { from: voiceForm.from, call_control_id: 'sim_v_' + Date.now() } } })}>
							Fire Voice Webhook →
						</button>
					</div>
				{/if}
			</section>
		</main>
	</div>
</div>
