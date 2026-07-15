<script>
	import { fade, fly } from 'svelte/transition';
	import Header from '$lib/components/new-site/Header.svelte';
	import FooterBar from '../FooterBar.svelte';

	// Constants
	const TRADES = ['plumber', 'hvac', 'electrician', 'roofer'];

	const SERVICES = {
		plumber: [
			'Bathroom Plumbing',
			'Drain Cleaning',
			'Water Heater Services',
			'Sewer Services',
			'Sump Pumps',
			'Emergency Plumbing',
			'Pipe & Repiping'
		],
		hvac: [
			'Furnace Repair',
			'AC Repair',
			'Heat Pumps',
			'Installation',
			'Duct Work',
			'Boiler Service'
		],
		electrician: [
			'Panel Upgrades',
			'Rewiring',
			'EV Charger Install',
			'Generator Install',
			'Lighting',
			'Troubleshooting'
		],
		roofer: [
			'Roof Replacement',
			'Roof Repair',
			'Shingle Installation',
			'Flat Roof Service',
			'Gutters',
			'Leak Detection'
		]
	};

	// Locked Constants per Session 18
	const CALL_TO_PURCHASE_RATE = 0.10;
	const SUDBURY_HOUSEHOLDS = 73000;
	const CAPTIVE_MARKET_UPLIFT = 1.2;

	const ECONOMIC_TIERS = {
		timmins: { label: 'Active', mod: '+0.05' },
		sudbury: { label: 'Active', mod: '+0.05' },
		'north bay': { label: 'Active', mod: '+0.05' },
		'kirkland lake': { label: 'Active', mod: '+0.05' },
		cochrane: { label: 'Slow', mod: '-0.15' },
		kapuskasing: { label: 'Slow', mod: '-0.15' }
	};

	// Helpers
	function formatCurrency(num) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0
		}).format(num);
	}
	function formatCompact(num) {
		if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
		return '$' + num;
	}

	// State (Svelte 5)
	let businessName = $state('Manito Plumbing and Heating Ltd.');
	let websiteUrl = $state('https://manitoplumbing.ca/');
	let city = $state('Timmins');
	let yearsInBusiness = $state(14);

	let activeTrades = $state(['plumber', 'hvac']);
	let tradeConfigs = $state({
		plumber: {
			revenuePct: 70,
			selectedServices: [0, 1, 2, 3, 5]
		},
		hvac: {
			revenuePct: 30,
			selectedServices: [0, 1, 2, 3, 4]
		},
		electrician: { revenuePct: 0, selectedServices: [] },
		roofer: { revenuePct: 0, selectedServices: [] }
	});
	let avgJobValuePrimary = $state(2800);
	let avgJobValueSecondary = $state(2500);
	let openServicesTrade = $state(null);

	let loading = $state(false);
	let showResults = $state(false);
	let results = $state(null);

	function updateTradeConfig(trade, updates) {
		tradeConfigs = {
			...tradeConfigs,
			[trade]: {
				...tradeConfigs[trade],
				...updates
			}
		};
	}

	function selectTrade(trade) {
		if (activeTrades.includes(trade)) {
			if (activeTrades.length > 1) {
				activeTrades = [activeTrades[1], activeTrades[0]];
				return;
			}
			return;
		}

		if (activeTrades.length >= 2) {
			const primary = activeTrades[0];
			const previousSecondary = activeTrades[1];
			if (previousSecondary && previousSecondary !== trade) {
				updateTradeConfig(previousSecondary, { revenuePct: 0 });
			}
			activeTrades = [primary, trade];
			const nextPct = tradeConfigs[trade].revenuePct || 30;
			updateTradeConfig(trade, { revenuePct: nextPct });
			updateTradeConfig(primary, { revenuePct: Math.max(0, 100 - nextPct) });
			if (openServicesTrade && openServicesTrade !== trade) openServicesTrade = null;
			return;
		}

		activeTrades = [...activeTrades, trade];
		if (activeTrades.length === 2) {
			const nextPct = tradeConfigs[trade].revenuePct || 30;
			updateTradeConfig(trade, { revenuePct: nextPct });
			updateTradeConfig(activeTrades[0], { revenuePct: Math.max(0, 100 - nextPct) });
		}
	}

	function syncPct(changedTrade) {
		const otherTrade = activeTrades.find((t) => t !== changedTrade);
		if (!otherTrade) return;
		const val = tradeConfigs[changedTrade].revenuePct;
		updateTradeConfig(otherTrade, { revenuePct: Math.max(0, 100 - val) });
	}

	function toggleService(trade, idx) {
		const sel = tradeConfigs[trade].selectedServices;
		if (sel.includes(idx)) {
			updateTradeConfig(trade, { selectedServices: sel.filter((i) => i !== idx) });
		} else {
			if (sel.length < 5) {
				updateTradeConfig(trade, { selectedServices: [...sel, idx] });
			}
		}
	}

	function toggleSvcDropdown(trade) {
		openServicesTrade = openServicesTrade === trade ? null : trade;
	}

	function downloadLayer2Report() {
		const text = results?.reportText;
		if (!text) return;
		const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `clearsky-layer2-report-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function runDiagnostic() {
		loading = true;
		try {
			const response = await fetch('/revenue-model-layer2', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					businessName,
					city,
					trade: activeTrades[0],
					secondaryTrade: activeTrades[1] || null,
					revenueSplit: {
						primary: activeTrades[1] ? tradeConfigs[activeTrades[0]].revenuePct : 100,
						secondary: activeTrades[1] ? tradeConfigs[activeTrades[1]].revenuePct : 0
					},
					selectedServicesByTrade: {
						[activeTrades[0]]: (tradeConfigs[activeTrades[0]].selectedServices || [])
							.map((idx) => SERVICES[activeTrades[0]]?.[idx])
							.filter(Boolean),
						...(activeTrades[1]
							? {
									[activeTrades[1]]: (tradeConfigs[activeTrades[1]].selectedServices || [])
										.map((idx) => SERVICES[activeTrades[1]]?.[idx])
										.filter(Boolean)
								}
							: {})
					},
					websiteUrl,
					callToPurchaseRate: CALL_TO_PURCHASE_RATE,
					avgSaleValue: avgJobValuePrimary,
					avgSaleValueSecondary: activeTrades[1] ? avgJobValueSecondary : null,
					yearsInBusiness
				})
			});
			const data = await response.json();
			if (data.success) {
				results = data;
				showResults = true;
			} else {
				alert('Error: ' + data.error);
			}
		} catch (err) {
			console.error(err);
			alert('Failed to run diagnostic');
		} finally {
			loading = false;
		}
	}

	// Derived
	const totalGap = $derived((results?.layer1?.value || 0) + (results?.layer2?.value || 0));
	const totalRecoverable = $derived(totalGap); // Simplified for this view
	const ultraConservative = $derived(totalRecoverable * 0.85);
	const layer1Data = $derived(results?.layer1 || {});
	const layer2Data = $derived(results?.layer2 || {});
	const keywords = $derived(layer2Data.detail?.keywordBreakdown || []);
	const ecoInfo = $derived(
		ECONOMIC_TIERS[city.toLowerCase()] || { label: 'Neutral', mod: '+0.00' }
	);
	const primaryTrade = $derived(activeTrades[0] || '');
	const secondaryTrade = $derived(activeTrades[1] || '');
	const splitSecondary = $derived(secondaryTrade ? tradeConfigs[secondaryTrade].revenuePct : 0);
	const servicesReady = $derived(
		activeTrades.every((trade) => (tradeConfigs[trade].selectedServices || []).length === 5)
	);
</script>

<div class="page-shell">
	<Header />
	<div class="app page-body">
	<!-- INTAKE FORM -->
	<div class="intake">
		<div class="form-card">
			<div class="form-header">
				<div class="logo-mark">Clear<span>Sky</span></div>
				<div class="step-indicator">Step 1 of 3</div>
			</div>
			<div class="progress-bar">
				<div class="progress-fill" style="width: {showResults ? '100%' : '33%'}"></div>
			</div>

			<div class="form-body">
				<div class="form-title">Your business</div>
				<div class="form-subtitle">We look up your digital presence — no login needed.</div>

				<div class="field-group">
					<label class="field-label" for="businessName">Business name</label>
					<input
						id="businessName"
						class="field-input filled"
						bind:value={businessName}
						placeholder="Enter business name"
					/>
				</div>

				<div class="field-group">
					<label class="field-label" for="websiteUrl"
						>Website <span style="color:#94A3B8;font-weight:400;text-transform:none;"
							>(optional)</span
						></label
					>
					<input
						id="websiteUrl"
						class="field-input filled"
						bind:value={websiteUrl}
						placeholder="https://..."
					/>
				</div>

				<div class="two-col">
					<div class="field-group">
						<label class="field-label" for="city">City</label>
						<input
							id="city"
							class="field-input filled"
							bind:value={city}
							placeholder="City"
						/>
					</div>
					<div class="field-group">
						<label class="field-label" for="yearsInBusiness">Years in business</label>
						<input
							id="yearsInBusiness"
							class="field-input filled"
							type="number"
							bind:value={yearsInBusiness}
						/>
					</div>
				</div>

				<div class="field-group">
					<div class="field-label">Trade</div>
					<div class="trade-grid" id="trade-grid">
						{#each TRADES as trade (trade)}
							{@const isActive = activeTrades.includes(trade)}
							{@const isPrimary = activeTrades[0] === trade}
							<div class="trade-row {isActive ? 'active' : 'inactive'}">
								<div
									class="trade-main"
									role="button"
									tabindex="0"
									onclick={() => selectTrade(trade)}
									onkeydown={(e) => e.key === 'Enter' && selectTrade(trade)}
								>
									<div class="trade-radio">
										{#if isActive}<div class="trade-radio-dot"></div>{/if}
									</div>
									<span class="trade-name">
										{trade.charAt(0).toUpperCase() + trade.slice(1)}
									</span>
									<div class="trade-controls">
										{#if isActive}
											<span class="trade-pill {isPrimary ? 'pill-primary' : 'pill-secondary'}">
												{isPrimary ? 'Primary' : 'Secondary'}
											</span>
											<input
												class="pct-input"
												type="number"
												bind:value={tradeConfigs[trade].revenuePct}
												oninput={() => syncPct(trade)}
												onclick={(e) => e.stopPropagation()}
											/>
											<span class="pct-label">%</span>
											<button
												class="svc-btn {tradeConfigs[trade].selectedServices.length > 0 ? 'has-selection' : ''}"
												onclick={(e) => {
													e.stopPropagation();
													toggleSvcDropdown(trade);
												}}
											>
												{tradeConfigs[trade].selectedServices.length === 5
													? '✓ 5 chosen'
													: tradeConfigs[trade].selectedServices.length > 0
														? `${tradeConfigs[trade].selectedServices.length} chosen`
														: 'Choose 5'}
											</button>
										{:else}
											<span style="color:#9ca3af; font-size:12px;">tap to add as secondary</span>
										{/if}
									</div>
								</div>
								{#if openServicesTrade === trade}
									<div class="services-dropdown" in:fade>
										<div class="svc-header">
											Choose 5 services
											<span class="svc-count">
												{tradeConfigs[trade].selectedServices.length} / 5
											</span>
										</div>
										{#each SERVICES[trade] || [] as svc, idx (svc)}
											<div
												class="svc-item"
												role="button"
												tabindex="0"
												onclick={() => toggleService(trade, idx)}
												onkeydown={(e) => e.key === 'Enter' && toggleService(trade, idx)}
											>
												<div
													class="svc-check {tradeConfigs[trade].selectedServices.includes(idx) ? 'checked' : ''}"
												></div>
												<span class="svc-text">{svc}</span>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
					<div class="split-note">
						{#if activeTrades.length === 2}
							{@const total =
								tradeConfigs[activeTrades[0]].revenuePct +
								tradeConfigs[activeTrades[1]].revenuePct}
							Revenue split:
							<strong>
								{activeTrades[0]} {tradeConfigs[activeTrades[0]].revenuePct}%
							</strong>
							+
							<strong>
								{activeTrades[1]} {tradeConfigs[activeTrades[1]].revenuePct}%
							</strong>
							= {total}% {total === 100 ? '✓' : '— must equal 100%'}
						{:else if activeTrades.length === 1}
							Split applies when secondary trade is added.
						{/if}
					</div>
				</div>

				<div class="field-group">
					<div class="field-label">Average job values</div>
					<div class="revenue-row">
						<div class="mini-field">
							<label for="avgJobValuePrimary">{primaryTrade} avg</label>
							<input
								id="avgJobValuePrimary"
								class="mini-input"
								type="number"
								bind:value={avgJobValuePrimary}
							/>
						</div>
						{#if secondaryTrade}
							<div class="mini-field">
								<label for="avgJobValueSecondary">{secondaryTrade} avg</label>
								<input
									id="avgJobValueSecondary"
									class="mini-input"
									type="number"
									bind:value={avgJobValueSecondary}
								/>
							</div>
						{/if}
					</div>
				</div>


				<!-- Session 18: Locked Constants Note -->
				<div class="locked-constants-notice">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
						><path
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/></svg
					>
					<span
						>Session 18: Using locked call-to-purchase rate (10.0%) and standard industry job values.</span
					>
				</div>
			</div>

			<div class="form-footer">
				<div class="footer-note">No login needed · Takes 2 minutes</div>
				<button class="btn-next" onclick={runDiagnostic} disabled={loading || !servicesReady}>
					{#if loading}
						Analysing...
					{:else if !servicesReady}
						Select 5 services per trade
					{:else}
						Run Diagnostic →
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- RESULTS -->
	<div class="results">
		{#if showResults}
			<div class="results-card" in:fly={{ y: 20 }}>
				<div class="results-header">
					<div>
						<div class="biz-name">{results.business.name}</div>
						<div class="biz-meta">
							{activeTrades.map((t) => t.toUpperCase()).join(' / ')} · {results.business.city} ON · {results
								.business.years} years in business
						</div>
					</div>
					<div class="confidence-pill">
						<div
							class="conf-dot"
							style="background: {results.layer1.value > 100000 ? '#ef4444' : '#F59E0B'}"
						></div>
						Medium confidence · ±25% range
					</div>
				</div>

				<div class="results-body">
					<div class="gap-hero">
						<div>
							<div class="gap-main-label">Total annual revenue gap</div>
							<div class="gap-main-value">{formatCompact(totalGap)}</div>
							<div class="gap-main-sub">
								Estimated annual opportunity across {activeTrades.join(' + ')} and local pack
							</div>
						</div>
						<div class="gap-scenarios">
							<div class="scenario">
								<div class="scenario-label">Total Recoverable</div>
								<div class="scenario-value">{formatCompact(totalRecoverable)}</div>
								<div class="scenario-sub">Annual potential after modifiers</div>
							</div>
							<div class="scenario ultra">
								<div class="scenario-label">Ultra conservative</div>
								<div class="scenario-value">{formatCompact(ultraConservative)}</div>
								<div class="scenario-sub">0.85x conservative discount applied</div>
							</div>
						</div>
					</div>

					<div class="section-title">Capture rate breakdown</div>

					<div class="capture-row">
						<div class="capture-card">
							<div class="capture-label">Economic tier</div>
							<div class="capture-value">{ecoInfo.label} ({ecoInfo.mod})</div>
						</div>
						<div class="capture-card">
							<div class="capture-label">Call to purchase</div>
							<div class="capture-value">10.0% Fixed</div>
						</div>
						<div class="capture-card">
							<div class="capture-label">Brand tenure</div>
							<div class="capture-value">
								{yearsInBusiness >= 11 ? '1.09x Trusted' : 'Standard'}
							</div>
						</div>
					</div>

					<div class="section-title">Your Google Business Profile · Layer 1</div>

					<div class="rating-row">
						<div class="rating-stars">{results.layer1.detail?.stars || 'N/A'} ★</div>
						<div class="rating-detail">
							<div class="rating-title">
								Strong rating — {results.layer1.detail?.count || 0} reviews — benchmark is {results
									.business.years * 6}
							</div>
							<div class="rating-sub">
								GBP composite score 82/100. Q&A activity: {results.layer1.detail?.qaCount || 0} total
								questions found.
							</div>
						</div>
						<div>
							<div style="font-size:10px;color:#94A3B8;margin-bottom:2px;">GBP gap</div>
							<div class="rating-cost">{formatCompact(results.layer1.value)}</div>
						</div>
					</div>

					<div class="section-title">Local pack visibility · Layer 2</div>

					<div class="local-pack">
						<div class="pack-header">
							<div class="pack-title">
								{layer2Data.detail?.avgPosition > 3
									? 'Not in the local pack for most keywords'
									: 'Strong visibility in the local pack'}
							</div>
							<div class="pack-gap">{formatCompact(layer2Data.value)} gap</div>
						</div>
						<div class="pack-keywords">
							{#each keywords as kw (kw.keyword)}
								<div class="keyword-row">
									<div class="kw-text">{kw.keyword}</div>
									<div
										class="kw-pos {kw.position > 3
											? 'not-in'
											: kw.position === 1
												? 'pos1'
												: 'pos2'}"
									>
										{kw.position > 3
											? 'Not in pack'
											: `Position ${kw.position}${kw.position === 1 ? ' ✓' : ''}`}
									</div>
									<div class="kw-gap">{formatCompact(kw.annualGap)}/yr</div>
								</div>
							{/each}
						</div>
					</div>

					<div class="section-title">Full gap breakdown</div>

					<div class="gap-breakdown">
						<div class="gap-item layer1">
							<div class="gap-item-header">
								<div class="gap-item-label">GBP Profile · Layer 1</div>
								<div class="gap-item-status status-strong">Strong</div>
							</div>
							<div class="gap-item-value">{formatCompact(results.layer1.value)}</div>
							<div class="gap-item-detail">
								{results.layer1.detail?.stars} stars · {results.layer1.detail?.count} reviews
							</div>
							<div class="bar-track">
								<div class="bar-fill" style="width:20%;background:#1B3A6B;"></div>
							</div>
						</div>

						<div class="gap-item layer2">
							<div class="gap-item-header">
								<div class="gap-item-label">Local Pack · Layer 2</div>
								<div class="gap-item-status status-critical">Critical</div>
							</div>
							<div class="gap-item-value">{formatCompact(results.layer2.value)}</div>
							<div class="gap-item-detail">
								Avg position {results.layer2.detail?.avgPosition} across 5 primary keywords
							</div>
							<div class="bar-track">
								<div class="bar-fill" style="width:85%;background:#E8600A;"></div>
							</div>
						</div>

						<div class="gap-item layer3">
							<div class="gap-item-header">
								<div class="gap-item-label">Site Performance · Layer 3</div>
								<div class="gap-item-status status-weak">Weak</div>
							</div>
							<div class="gap-item-value">Live</div>
							<div class="gap-item-detail">
								Site retention detected at {results.metrics.siteRetentionRate}
							</div>
							<div class="bar-track">
								<div class="bar-fill" style="width:40%;background:#7C3AED;"></div>
							</div>
						</div>

						<div class="gap-item layer4">
							<div class="gap-item-header">
								<div class="gap-item-label">Content Gap · Layer 4</div>
								<div class="gap-item-status status-critical">Pending</div>
							</div>
							<div class="gap-item-value">N/A</div>
							<div class="gap-item-detail">Content analysis pending final integration</div>
							<div class="bar-track">
								<div class="bar-fill" style="width:0%;background:#0D7A4E;"></div>
							</div>
						</div>
					</div>
				</div>

				<div class="results-footer">
					<div class="footer-msg">
						Some inputs are estimated. A ClearSky advisor can confirm details and narrow this from
						±25% toward ±15%. Layers 3–12 pending full integration.
					</div>
					<div class="footer-actions">
						{#if results.reportText}
							<button type="button" class="btn-download" onclick={downloadLayer2Report}>
								Download report (.txt)
							</button>
						{/if}
						<button type="button" class="btn-talk">Talk to an advisor →</button>
					</div>
				</div>
			</div>
		{:else}
			<div class="flex h-full flex-col items-center justify-center text-slate-400">
				<svg
					class="mb-6 h-20 w-20 opacity-20"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
					/>
				</svg>
				<p class="font-medium">Complete the form to see your diagnostic results</p>
			</div>
		{/if}
	</div>
</div>
	<FooterBar />
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

	* {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:root {
		--navy: #0f2444;
		--blue: #1b3a6b;
		--orange: #e8600a;
		--orange-light: #fff0e8;
		--green: #0d7a4e;
		--green-light: #e6f7f0;
		--red: #c0392b;
		--red-light: #fdf0ef;
		--amber: #b45309;
		--amber-light: #fffbeb;
		--slate: #64748b;
		--border: #e2e8f0;
		--bg: #f7f9fc;
		--white: #ffffff;
		--text: #0f2444;
		--text-muted: #64748b;
	}

	:global(body) {
		font-family: 'Sora', sans-serif;
		background: var(--bg);
		color: var(--text);
	}

	.app {
		display: flex;
		gap: 32px;
		padding: 24px;
		min-height: 100vh;
		align-items: flex-start;
		max-width: 1400px;
		margin: 0 auto;
	}

	.page-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.page-body {
		flex: 1;
	}

	/* ── INTAKE FORM ── */
	.intake {
		width: 440px;
		flex-shrink: 0;
	}

	.form-card {
		background: var(--white);
		border-radius: 16px;
		border: 1px solid var(--border);
		overflow: hidden;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
	}

	.form-header {
		background: var(--navy);
		padding: 20px 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo-mark {
		font-family: 'JetBrains Mono', monospace;
		font-size: 14px;
		font-weight: 500;
		color: white;
		letter-spacing: -0.5px;
	}
	.logo-mark span {
		color: var(--orange);
	}

	.step-indicator {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.5);
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.progress-bar {
		height: 3px;
		background: rgba(255, 255, 255, 0.1);
	}
	.progress-fill {
		height: 3px;
		background: var(--orange);
		transition: width 0.3s ease;
	}

	.form-body {
		padding: 24px;
	}

	.form-title {
		font-size: 20px;
		font-weight: 700;
		color: var(--navy);
		margin-bottom: 4px;
		letter-spacing: -0.5px;
	}
	.form-subtitle {
		font-size: 12px;
		color: var(--text-muted);
		margin-bottom: 24px;
	}

	.locked-constants-notice {
		background: #f1f5f9;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 12px;
		display: flex;
		gap: 10px;
		margin-bottom: 24px;
		align-items: center;
	}

	.locked-constants-notice svg {
		width: 16px;
		height: 16px;
		color: var(--blue);
		flex-shrink: 0;
	}

	.locked-constants-notice span {
		font-size: 11px;
		color: #475569;
		line-height: 1.4;
		font-weight: 500;
	}

	.field-group {
		margin-bottom: 16px;
	}

	.field-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--slate);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 6px;
		display: block;
	}

	.field-input {
		width: 100%;
		padding: 10px 14px;
		border: 1.5px solid var(--border);
		border-radius: 8px;
		font-family: 'Sora', sans-serif;
		font-size: 13px;
		color: var(--text);
		background: var(--white);
		outline: none;
		transition: border-color 0.15s;
	}
	.field-input:focus {
		border-color: var(--blue);
	}
	.field-input.filled {
		border-color: #c7d3f0;
		background: #f8faff;
	}

	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.trade-grid {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.trade-row {
		border: 1px solid var(--border);
		border-radius: 10px;
		overflow: visible;
		position: relative;
	}
	.trade-row.active {
		border-color: var(--blue);
		background: #f5f9ff;
	}
	.trade-main {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		cursor: pointer;
	}
	.trade-radio {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 2px solid var(--border);
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.trade-row.active .trade-radio {
		border-color: var(--blue);
	}
	.trade-radio-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--blue);
	}
	.trade-name {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		flex: 1;
	}
	.trade-row.inactive .trade-name {
		color: var(--text-muted);
		font-weight: 400;
	}
	.trade-pill {
		font-size: 10px;
		padding: 2px 8px;
		border-radius: 20px;
		font-weight: 600;
	}
	.pill-primary {
		background: #dbeafe;
		color: #1d4ed8;
	}
	.pill-secondary {
		background: #d1fae5;
		color: #065f46;
	}
	.trade-controls {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.pct-input {
		width: 52px;
		padding: 4px 6px;
		border: 1px solid var(--border);
		border-radius: 6px;
		font-size: 12px;
		text-align: center;
		background: white;
	}
	.pct-label {
		font-size: 10px;
		color: #9ca3af;
	}
	.svc-btn {
		font-size: 11px;
		padding: 4px 9px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
		color: #374151;
		white-space: nowrap;
	}
	.svc-btn.has-selection {
		border-color: var(--blue);
		color: var(--blue);
		background: #f0f6ff;
	}
	.services-dropdown {
		position: absolute;
		right: 0;
		top: calc(100% + 4px);
		width: 220px;
		background: #fff;
		border: 1px solid var(--border);
		border-radius: 10px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		z-index: 100;
		padding: 8px 0;
	}
	.svc-header {
		padding: 6px 12px 4px;
		font-size: 10px;
		font-weight: 700;
		color: #374151;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		border-bottom: 1px solid #f3f4f6;
		margin-bottom: 4px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.svc-count {
		font-size: 10px;
		color: #6b7280;
	}
	.svc-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 12px;
		cursor: pointer;
	}
	.svc-item:hover {
		background: #f5f9ff;
	}
	.svc-check {
		width: 14px;
		height: 14px;
		border-radius: 4px;
		border: 1.5px solid var(--border);
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.svc-check.checked {
		background: var(--blue);
		border-color: var(--blue);
	}
	.svc-check.checked::after {
		content: '';
		display: block;
		width: 6px;
		height: 4px;
		border-left: 1.5px solid #fff;
		border-bottom: 1.5px solid #fff;
		transform: rotate(-45deg) translate(1px, -1px);
	}
	.svc-text {
		font-size: 12px;
		color: #374151;
	}
	.split-note {
		font-size: 11px;
		color: #6b7280;
		background: #f9fafb;
		border: 1px solid var(--border);
		border-radius: 7px;
		padding: 7px 10px;
		margin-top: 6px;
	}
	.split-note strong {
		color: #374151;
	}

	.revenue-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		padding-top: 10px;
		border-top: 1px solid var(--border);
	}

	.mini-field label {
		font-size: 10px;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: block;
		margin-bottom: 4px;
	}
	.mini-input {
		width: 100%;
		padding: 7px 10px;
		border: 1.5px solid var(--border);
		border-radius: 6px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 12px;
		color: var(--text);
		outline: none;
		background: white;
	}


	.form-footer {
		padding: 16px 24px;
		border-top: 1px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.btn-next {
		background: var(--orange);
		color: white;
		border: none;
		border-radius: 8px;
		padding: 10px 24px;
		font-family: 'Sora', sans-serif;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
	}
	.btn-next:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}
	.btn-next:disabled {
		filter: grayscale(1);
		cursor: not-allowed;
	}
	.footer-note {
		font-size: 11px;
		color: var(--text-muted);
	}

	/* ── RESULTS ── */
	.results {
		flex: 1;
		min-height: 800px;
	}

	.results-card {
		background: var(--white);
		border-radius: 16px;
		border: 1px solid var(--border);
		overflow: hidden;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
	}

	.results-header {
		background: var(--navy);
		padding: 20px 28px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.biz-name {
		font-size: 16px;
		font-weight: 700;
		color: white;
		letter-spacing: -0.3px;
	}
	.biz-meta {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
		margin-top: 2px;
	}

	.confidence-pill {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 20px;
		padding: 6px 14px;
		font-size: 11px;
		color: rgba(255, 255, 255, 0.7);
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.conf-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.results-body {
		padding: 24px 28px;
	}

	.gap-hero {
		background: linear-gradient(135deg, #0f2444 0%, #1b3a6b 100%);
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 20px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		align-items: center;
	}

	.gap-main-label {
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 6px;
	}
	.gap-main-value {
		font-family: 'JetBrains Mono', monospace;
		font-size: 48px;
		font-weight: 500;
		color: var(--orange);
		letter-spacing: -2px;
		line-height: 1;
	}
	.gap-main-sub {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.4);
		margin-top: 6px;
	}

	.gap-scenarios {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.scenario {
		background: rgba(255, 255, 255, 0.06);
		border-radius: 8px;
		padding: 12px 14px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}
	.scenario-label {
		font-size: 10px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.4);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 4px;
	}
	.scenario-value {
		font-family: 'JetBrains Mono', monospace;
		font-size: 20px;
		font-weight: 500;
		color: white;
	}
	.scenario-sub {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.35);
		margin-top: 2px;
	}

	.section-title {
		font-size: 10px;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 12px;
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 24px;
	}
	.section-title::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border);
	}

	.rating-row {
		display: flex;
		align-items: center;
		gap: 12px;
		background: var(--orange-light);
		border: 1px solid #ffd4b3;
		border-radius: 10px;
		padding: 14px 16px;
		margin-bottom: 20px;
	}
	.rating-stars {
		font-size: 20px;
		font-weight: 700;
		color: var(--orange);
		font-family: 'JetBrains Mono', monospace;
	}
	.rating-detail {
		flex: 1;
	}
	.rating-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--navy);
	}
	.rating-sub {
		font-size: 11px;
		color: var(--text-muted);
		margin-top: 2px;
	}
	.rating-cost {
		font-family: 'JetBrains Mono', monospace;
		font-size: 16px;
		font-weight: 600;
		color: var(--orange);
	}

	.local-pack {
		background: var(--red-light);
		border: 1px solid #fecaca;
		border-radius: 10px;
		padding: 16px;
		margin-bottom: 20px;
	}
	.pack-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}
	.pack-title {
		font-size: 13px;
		font-weight: 700;
		color: var(--red);
	}
	.pack-gap {
		font-family: 'JetBrains Mono', monospace;
		font-size: 20px;
		font-weight: 600;
		color: var(--red);
	}

	.pack-keywords {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.keyword-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		background: white;
		border-radius: 6px;
		border: 1px solid #fee2e2;
	}
	.kw-text {
		font-size: 12px;
		color: var(--text);
		flex: 1;
		font-family: 'JetBrains Mono', monospace;
	}
	.kw-pos {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 7px;
		border-radius: 4px;
		white-space: nowrap;
	}
	.kw-pos.not-in {
		background: var(--red-light);
		color: var(--red);
	}
	.kw-pos.pos2 {
		background: var(--amber-light);
		color: var(--amber);
	}
	.kw-pos.pos1 {
		background: var(--green-light);
		color: var(--green);
	}
	.kw-gap {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.gap-breakdown {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-bottom: 20px;
	}

	.gap-item {
		background: var(--white);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 14px 16px;
		position: relative;
		overflow: hidden;
	}
	.gap-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
	}
	.gap-item.layer1::before {
		background: var(--blue);
	}
	.gap-item.layer2::before {
		background: var(--orange);
	}
	.gap-item.layer3::before {
		background: #7c3aed;
	}
	.gap-item.layer4::before {
		background: var(--green);
	}

	.gap-item-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}
	.gap-item-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-muted);
	}

	.gap-item-status {
		font-size: 9px;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 3px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.status-strong {
		background: var(--green-light);
		color: var(--green);
	}
	.status-critical {
		background: var(--red-light);
		color: var(--red);
	}
	.status-weak {
		background: var(--amber-light);
		color: var(--amber);
	}

	.gap-item-value {
		font-family: 'JetBrains Mono', monospace;
		font-size: 22px;
		font-weight: 500;
		color: var(--navy);
		letter-spacing: -0.5px;
	}
	.gap-item-detail {
		font-size: 11px;
		color: var(--text-muted);
		margin-top: 4px;
		line-height: 1.4;
	}
	.bar-track {
		background: #f1f5f9;
		border-radius: 3px;
		height: 4px;
		margin-top: 8px;
	}
	.bar-fill {
		height: 4px;
		border-radius: 3px;
	}

	.capture-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin-bottom: 20px;
	}
	.capture-card {
		background: #f8fafc;
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 12px 14px;
		text-align: center;
	}
	.capture-label {
		font-size: 10px;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 6px;
	}
	.capture-value {
		font-family: 'JetBrains Mono', monospace;
		font-size: 16px;
		font-weight: 500;
		color: var(--navy);
	}

	.results-footer {
		padding: 16px 28px;
		border-top: 1px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		background: #fafbfc;
	}
	.footer-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}
	.btn-download {
		background: var(--blue);
		color: white;
		border: none;
		border-radius: 8px;
		padding: 12px 20px;
		font-family: 'Sora', sans-serif;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}
	.btn-download:hover {
		filter: brightness(1.05);
	}
	.footer-msg {
		font-size: 12px;
		color: var(--text-muted);
		max-width: 360px;
		line-height: 1.5;
	}
	.btn-talk {
		background: var(--orange);
		color: white;
		border: none;
		border-radius: 8px;
		padding: 12px 24px;
		font-family: 'Sora', sans-serif;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;
	}
</style>
