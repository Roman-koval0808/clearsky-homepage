<script>
	import { fade, fly, slide } from 'svelte/transition';
	import { formatCurrency } from '$lib/clearsky/clearsky-engine';
	import Header from '$lib/components/new-site/Header.svelte';
	import FooterBar from '../FooterBar.svelte';

	// Constants
	const SERVICES_DATA = {
		plumber: ['Emergency Plumbing','Drain Cleaning','Water Heaters','Pipe Repair','Fixture Installation','Sump Pumps','Water Lines','Gas Lines','Backflow Prevention','Inspections'],
		hvac: ['Heating Systems','Air Conditioning','AC Maintenance','Ductless Systems','Ventilation Services','Indoor Air Quality','Thermostats & Controls','Ductwork Services','Maintenance & Tune-Ups','Emergency HVAC'],
		electrician: ['Panel Upgrades','Wiring','Outlets & Switches','EV Chargers','Lighting','Generator Install','Safety Inspections','Surge Protection','Smart Home','Commercial'],
		roofer: ['Roof Replacement','Roof Repair','Shingles','Flat Roofing','Gutters','Skylights','Ice & Water Shield','Soffits & Fascia','Inspections','Emergency Repair']
	};

	// Navigation State
	let currentStep = $state(0); // 0, 1, 2
	
	// Step 1: Your Business
	let businessName = $state('Manito Plumbing and Heating Ltd.');
	let websiteUrl = $state('https://manitoplumbing.ca/');
	let city = $state('Timmins');
	
	let activeTrades = $state(['plumber', 'hvac']);
	let primaryTrade = $state('plumber');

	let tradeConfigs = $state({
		plumber: { revenuePct: 60, selectedServices: [0, 1, 2, 3, 4] },
		hvac: { revenuePct: 40, selectedServices: [] },
		electrician: { revenuePct: 0, selectedServices: [] },
		roofer: { revenuePct: 0, selectedServices: [] }
	});

	// Step 2: Your Numbers
	let annualRevenue = $state(1200000);
	let avgJobValuePrimary = $state(1500);
	let avgJobValueSecondary = $state(3000);
	let yearsInBusiness = $state(14);
	let marketCondition = $state('active'); // booming, active, slow, depressed

	let loading = $state(false);
	let showResults = $state(false);
	let results = $state(null);
	let openServicesTrade = $state(null); // value of the trade whose services popover is open

	// Helpers
	function formatCompact(val) { return new Intl.NumberFormat('en-US', { notation: 'compact', style: 'currency', currency: 'USD' }).format(val); }

	/** Full USD for review (job values); avoids engine `formatCurrency` $1.5K → $2K rounding. */
	function formatUsdInt(n) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0
		}).format(Number(n) || 0);
	}

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
			activeTrades = [primary, trade];
			const nextPct = tradeConfigs[trade].revenuePct || 30;
			updateTradeConfig(trade, { revenuePct: nextPct });
			updateTradeConfig(primary, { revenuePct: Math.max(0, 100 - nextPct) });
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
		const otherTrade = activeTrades.find(t => t !== changedTrade);
		if (!otherTrade) return;
		const val = tradeConfigs[changedTrade].revenuePct;
		updateTradeConfig(otherTrade, { revenuePct: Math.max(0, 100 - val) });
	}

	function toggleService(trade, idx) {
		const sel = tradeConfigs[trade].selectedServices;
		if (sel.includes(idx)) {
			updateTradeConfig(trade, { selectedServices: sel.filter(i => i !== idx) });
		} else {
			if (sel.length < 5) {
				updateTradeConfig(trade, { selectedServices: [...sel, idx] });
			}
		}
	}

	function toggleSvcDropdown(trade) {
		if (openServicesTrade === trade) openServicesTrade = null;
		else openServicesTrade = trade;
	}

	function goNext() {
		if (currentStep < 2) {
			currentStep++;
		} else {
			runDiagnostic();
		}
	}

	function goBack() {
		if (currentStep > 0) currentStep--;
	}

	async function runDiagnostic() {
		loading = true;
		try {
			const response = await fetch('/revenue-model-layer1', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					businessName, 
					city, 
					trade: activeTrades[0], 
					secondaryTrade: activeTrades[1] || null,
					websiteUrl, 
					yearsInBusiness: Number(yearsInBusiness),
					annualRevenue,
					avgSaleValue: avgJobValuePrimary,
					psiScore: 85
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

	function reset() {
		showResults = false;
		currentStep = 0;
		results = null;
	}

	function downloadLayer1Report() {
		const text = results?.reportText;
		if (!text) return;
		const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `clearsky-layer1-report-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}

	const titles = ['Your business', 'Your numbers', 'Review & run'];
	const subs = ['We will look up your digital presence — no login needed.', 'Rough estimates are fine — this drives your gap calculation.', 'Check your details, then run the diagnostic.'];
	const pcts = ['33%', '66%', '100%'];
</script>

<svelte:head>
	<title>Layer 1 — GBP Composite Score | ClearSky</title>
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap');
	</style>
</svelte:head>

<div class="page-shell">
	<Header />
	<div class="page-container page-body">
	{#if !showResults}
		<div class="modal-wrap">
			<div class="modal" in:fade={{ duration: 300 }}>
				<div class="modal-header">
					<div class="logo-row">
						<div class="logo">
							<div class="logo-mark">CS</div>
							ClearSky
						</div>
						<button class="close-btn" aria-label="Close">×</button>
					</div>
					<div class="progress-bar"><div class="progress-fill" style="width: {pcts[currentStep]}"></div></div>
					<p class="step-label">Step {currentStep + 1} of 3</p>
					<h2 class="screen-title">{titles[currentStep]}</h2>
					<p class="screen-sub">{subs[currentStep]}</p>
				</div>

				<div class="modal-body">
					<!-- SCREEN 1 -->
					{#if currentStep === 0}
						<div class="screen active">
							<div class="field">
								<label for="businessName">Business name</label>
								<input id="businessName" type="text" bind:value={businessName} placeholder="e.g. Manito Plumbing and Heating Ltd." />
							</div>
							<div class="field">
								<label for="websiteUrl">Website <span class="opt">(optional)</span></label>
								<input id="websiteUrl" type="url" bind:value={websiteUrl} placeholder="e.g. manitoplumbing.ca" />
							</div>
							<div class="field">
								<label for="city">City</label>
								<input id="city" type="text" bind:value={city} placeholder="e.g. Timmins" />
							</div>

							<div class="field">
								<label for="trade-grid">Trade</label>
								<div style="display:flex; justify-content:flex-end; gap:8px; padding-right:2px; margin-bottom:4px;">
									<span class="col-label" style="margin-right:auto; visibility:hidden">x</span>
									<span class="col-label" style="width:82px; text-align:center">% of revenue</span>
									<span class="col-label" style="width:72px; text-align:center">services</span>
								</div>
								<div class="trade-grid" id="trade-grid">
									{#each ['plumber', 'hvac', 'electrician', 'roofer'] as trade (trade)}
										{@const isActive = activeTrades.includes(trade)}
										{@const isPrimary = activeTrades[0] === trade}
										<div class="trade-row {isActive ? 'active' : 'inactive'}">
											<div class="trade-main" role="button" tabindex="0" onclick={() => selectTrade(trade)} onkeydown={(e) => e.key === 'Enter' && selectTrade(trade)}>
												<div class="trade-radio">
													{#if isActive}<div class="trade-radio-dot"></div>{/if}
												</div>
												<span class="trade-name">{trade.charAt(0).toUpperCase() + trade.slice(1)}</span>
												<div class="trade-controls">
													{#if isActive}
														<span class="trade-pill {isPrimary ? 'pill-primary' : 'pill-secondary'}">{isPrimary ? 'Primary' : 'Secondary'}</span>
														<input class="pct-input" type="number" bind:value={tradeConfigs[trade].revenuePct} oninput={() => syncPct(trade)} onclick={(e) => e.stopPropagation()} />
														<span class="pct-label">%</span>
														<button class="svc-btn {tradeConfigs[trade].selectedServices.length > 0 ? 'has-selection' : ''}" onclick={(e) => { e.stopPropagation(); toggleSvcDropdown(trade); }}>
															{tradeConfigs[trade].selectedServices.length === 5 ? '✓ 5 chosen' : tradeConfigs[trade].selectedServices.length > 0 ? `${tradeConfigs[trade].selectedServices.length} chosen` : 'Choose 5'}
														</button>
													{:else}
														<span style="color:#9ca3af; font-size:12px;">tap to add as secondary</span>
													{/if}
												</div>
											</div>
											{#if openServicesTrade === trade}
												<div class="services-dropdown" in:slide>
													<div class="svc-header">Choose 5 services <span class="svc-count">{tradeConfigs[trade].selectedServices.length} / 5</span></div>
													{#each SERVICES_DATA[trade] as svc, idx (svc)}
														<div class="svc-item" role="button" tabindex="0" onclick={() => toggleService(trade, idx)} onkeydown={(e) => e.key === 'Enter' && toggleService(trade, idx)}>
															<div class="svc-check {tradeConfigs[trade].selectedServices.includes(idx) ? 'checked' : ''}"></div>
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
										{@const total = tradeConfigs[activeTrades[0]].revenuePct + tradeConfigs[activeTrades[1]].revenuePct}
										Revenue split: <strong>{activeTrades[0]} {tradeConfigs[activeTrades[0]].revenuePct}%</strong> + <strong>{activeTrades[1]} {tradeConfigs[activeTrades[1]].revenuePct}%</strong> = {total}% {total === 100 ? '✓' : '— must equal 100%'}
									{:else if activeTrades.length === 1}
										Split applies when secondary trade is added.
									{/if}
								</div>
							</div>
						</div>
					{/if}

					<!-- SCREEN 2 -->
					{#if currentStep === 1}
						<div class="screen active">
							<div class="field">
								<label for="annualRevenue">Last year's revenue <span class="opt">(or best estimate)</span></label>
								<div class="dollar-input-wrap"><input id="annualRevenue" type="number" bind:value={annualRevenue} /></div>
								<p class="hint">Rough estimates are fine — this drives your gap calculation.</p>
							</div>
							<div class="field">
								<label for="avgJobValuePrimary">Average job value</label>
								<div class="job-value-grid">
									<div class="job-val-item">
										<div class="job-val-label">1. {activeTrades[0]} (primary)</div>
										<div class="dollar-input-wrap"><input id="avgJobValuePrimary" type="number" bind:value={avgJobValuePrimary} /></div>
										<p class="hint" style="margin-top:3px">Default: $1,500</p>
									</div>
									{#if activeTrades[1]}
										<div class="job-val-item">
											<div class="job-val-label">2. {activeTrades[1]} (secondary)</div>
											<div class="dollar-input-wrap"><input id="avgJobValueSecondary" type="number" bind:value={avgJobValueSecondary} /></div>
											<p class="hint" style="margin-top:3px">Default: $3,000</p>
										</div>
									{/if}
								</div>
							</div>
							<div class="field">
								<label for="yearsInBusiness">Years in business</label>
								<input id="yearsInBusiness" type="number" bind:value={yearsInBusiness} />
								<p class="hint">Used to calculate your review benchmark and brand tier.</p>
							</div>
							<div class="field">
								<label for="eco-grid">Economic climate <span class="opt">(auto-detected from city)</span></label>
								<div class="eco-grid" id="eco-grid">
									{#each ['booming', 'active', 'slow', 'depressed'] as condition (condition)}
										<div class="eco-option {marketCondition === condition ? 'selected' : ''}" role="button" tabindex="0" onclick={() => marketCondition = condition} onkeydown={(e) => e.key === 'Enter' && (marketCondition = condition)}>
											<div class="eco-label">{condition.charAt(0).toUpperCase() + condition.slice(1)}</div>
											<div class="eco-sub">{condition === 'booming' ? 'Resource boom' : condition === 'active' ? 'Stable growth' : condition === 'slow' ? 'Flat economy' : 'Major decline'}</div>
										</div>
									{/each}
								</div>
								<p class="hint" style="margin-top:6px">{city} is auto-assigned <strong>{marketCondition.toUpperCase()}</strong>. Override if needed.</p>
							</div>
						</div>
					{/if}

					<!-- SCREEN 3 -->
					{#if currentStep === 2}
						<div class="screen active">
							<div style="background:#f5f9ff; border:1px solid #dbeafe; border-radius:10px; padding:12px 14px; margin-bottom:12px;">
								<p style="font-size:12px; font-weight:600; color:#1d4ed8; margin-bottom:4px;">You're almost done.</p>
								<p style="font-size:11px; color:#374151; line-height:1.5;">We'll run your diagnostic now. Results take about 30 seconds.</p>
							</div>
							<div style="background:#fff; border:1px solid #e5e7ef; border-radius:10px; padding:12px 14px;">
								<p style="font-size:10px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px;">Review your inputs</p>
								<div style="display:grid; gap:6px;">
									<div style="display:flex; justify-content:space-between; font-size:12px;"><span style="color:#6b7280;">Business</span><span style="font-weight:600; color:#111827;">{businessName}</span></div>
									<div style="display:flex; justify-content:space-between; font-size:12px;"><span style="color:#6b7280;">City</span><span style="font-weight:600; color:#111827;">{city}</span></div>
									<div style="display:flex; justify-content:space-between; font-size:12px;"><span style="color:#6b7280;">Trades</span><span style="font-weight:600; color:#111827;">{activeTrades.map(t => `${t.toUpperCase()} ${tradeConfigs[t].revenuePct}%`).join(' / ')}</span></div>
									<div style="display:flex; justify-content:space-between; font-size:12px;"><span style="color:#6b7280;">Revenue</span><span style="font-weight:600; color:#111827;">{formatCurrency(annualRevenue)}</span></div>
									<div style="display:flex; justify-content:space-between; font-size:12px;"><span style="color:#6b7280;">Job values</span><span style="font-weight:600; color:#111827;">{formatUsdInt(avgJobValuePrimary)} {#if activeTrades[1]}/ {formatUsdInt(avgJobValueSecondary)}{/if}</span></div>
									<div style="display:flex; justify-content:space-between; font-size:12px;"><span style="color:#6b7280;">Years in business</span><span style="font-weight:600; color:#111827;">{yearsInBusiness} years</span></div>
									<div style="display:flex; justify-content:space-between; font-size:12px;"><span style="color:#6b7280;">Market</span><span style="font-weight:600; color:#0057e7;">{marketCondition.toUpperCase()} ↗</span></div>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<div class="modal-footer">
					<div class="dot-nav">
						{#each [0, 1, 2] as i (i)}
							<div class="dot {currentStep === i ? 'active' : ''}"></div>
						{/each}
					</div>
					<div style="display:flex; gap:10px; align-items:center;">
						{#if currentStep > 0}
							<button class="btn-back" onclick={goBack}>← Back</button>
						{/if}
						<button class="btn-next" onclick={goNext} disabled={loading}>
							{#if loading}Running...{:else}{currentStep === 2 ? 'Run diagnostic →' : 'Next →'}{/if}
						</button>
					</div>
				</div>
			</div>
		</div>

	{:else}
		<div class="results-container" in:fly={{ y: 20, duration: 600 }}>
			<div class="top-bar">
				<div class="brand">
					<h2>Layer 1 — GBP Composite Score</h2>
					<p>{results.business.name} • {city} ON • {yearsInBusiness} years in business</p>
				</div>
				<div class="date">Real data • April 2026</div>
			</div>

			<div class="hero-stats">
				<div class="score-circle {results.layer1.metrics.status}">
					<svg viewBox="0 0 220 220">
						<circle cx="110" cy="110" r="100" class="bg" />
						<circle cx="110" cy="110" r="100" class="fg" style="stroke-dasharray: {628 * (results.layer1.compositeScore / 100)}, 628" />
					</svg>
					<div class="score-content">
						<span class="number">{Math.round(results.layer1.compositeScore)}</span>
						<span class="label">GBP score</span>
					</div>
					<div class="status-label">
						{results.layer1.metrics.status === 'green' ? 'Strong profile' : 'Optimization needed'}
					</div>
				</div>

				<div class="stats-grid">
					<div class="stat-card">
						<span class="value">{Math.round(results.layer1.compositeScore)}/100</span>
						<span class="label">Composite GBP score</span>
					</div>
					<div class="stat-card">
						<span class="value">{results.layer1.displayValue}</span>
						<span class="label">Estimated annual gap</span>
					</div>
					<div class="stat-card">
						<span class="value">{results.layer1.metrics.rating} ★</span>
						<span class="label">Verified star rating</span>
					</div>
					<div class="stat-card">
						<span class="value">{results.layer1.metrics.reviewCount}</span>
						<span class="label">Total reviews</span>
					</div>
				</div>
			</div>

			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Signal</th>
							<th>Value</th>
							<th>Signal score (0–100)</th>
							<th>Weight</th>
							<th>Weighted contribution</th>
							<th>Contribution bar</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Star rating</td>
							<td>{results.layer1.metrics.rating} ★</td>
							<td class={results.layer1.scores.starRating > 80 ? 'high' : 'mid'}>{results.layer1.scores.starRating}</td>
							<td>35%</td>
							<td>{results.layer1.weightedContribution.starRating.toFixed(1)}</td>
							<td><div class="bar-bg"><div class="bar-fg" style="width: {results.layer1.scores.starRating}%"></div></div></td>
						</tr>
						<tr>
							<td>Review count</td>
							<td>{results.layer1.metrics.reviewCount} (expected {results.layer1.metrics.targetReviews})</td>
							<td class={results.layer1.scores.reviewCount > 80 ? 'high' : 'mid'}>{results.layer1.scores.reviewCount}</td>
							<td>25%</td>
							<td>{results.layer1.weightedContribution.reviewCount.toFixed(1)}</td>
							<td><div class="bar-bg"><div class="bar-fg" style="width: {results.layer1.scores.reviewCount}%"></div></div></td>
						</tr>
						<tr>
							<td>Photos</td>
							<td>{results.layer1.metrics.photoCount} photos</td>
							<td class={results.layer1.scores.photos > 80 ? 'high' : 'mid'}>{results.layer1.scores.photos}</td>
							<td>8%</td>
							<td>{results.layer1.weightedContribution.photos.toFixed(1)}</td>
							<td><div class="bar-bg"><div class="bar-fg orange" style="width: {results.layer1.scores.photos}%"></div></div></td>
						</tr>
						<tr>
							<td>Hours complete</td>
							<td>{results.layer1.scores.hours === 100 ? 'Published' : 'Missing'}</td>
							<td class="high">{results.layer1.scores.hours}</td>
							<td>5%</td>
							<td>{results.layer1.weightedContribution.hours.toFixed(1)}</td>
							<td><div class="bar-bg"><div class="bar-fg" style="width: {results.layer1.scores.hours}%"></div></div></td>
						</tr>
						<tr>
							<td>Owner response rate</td>
							<td>~{results.layer1.metrics.responseRate}%</td>
							<td class="mid">{results.layer1.scores.responseRate}</td>
							<td>7%</td>
							<td>{results.layer1.weightedContribution.responseRate.toFixed(1)}</td>
							<td><div class="bar-bg"><div class="bar-fg orange" style="width: {results.layer1.scores.responseRate}%"></div></div></td>
						</tr>
						<tr>
							<td>Website linked</td>
							<td>{results.layer1.scores.website === 100 ? 'Yes' : 'No'}</td>
							<td class="high">{results.layer1.scores.website}</td>
							<td>5%</td>
							<td>{results.layer1.weightedContribution.website.toFixed(1)}</td>
							<td><div class="bar-bg"><div class="bar-fg" style="width: {results.layer1.scores.website}%"></div></div></td>
						</tr>
						<tr>
							<td>GBP Q&A activity</td>
							<td>{results.layer1.scores.qa > 0 ? 'Active' : 'Inactive'}</td>
							<td class="mid">{results.layer1.scores.qa}</td>
							<td>4%</td>
							<td>{results.layer1.weightedContribution.qa.toFixed(1)}</td>
							<td><div class="bar-bg"><div class="bar-fg orange" style="width: {results.layer1.scores.qa}%"></div></div></td>
						</tr>
						<tr>
							<td>Description present</td>
							<td>{results.layer1.scores.description === 100 ? 'Yes' : 'No'}</td>
							<td class={results.layer1.scores.description === 100 ? 'high' : 'zero'}>{results.layer1.scores.description}</td>
							<td>4%</td>
							<td>{results.layer1.weightedContribution.description.toFixed(1)}</td>
							<td><div class="bar-bg"><div class="bar-fg" style="width: {results.layer1.scores.description}%"></div></div></td>
						</tr>
						<tr>
							<td>Services listed</td>
							<td>{results.layer1.services?.length || 0} categories</td>
							<td class={results.layer1.scores.services > 80 ? 'high' : 'zero'}>{results.layer1.scores.services}</td>
							<td>7%</td>
							<td>{results.layer1.weightedContribution.services.toFixed(1)}</td>
							<td><div class="bar-bg"><div class="bar-fg" style="width: {results.layer1.scores.services}%"></div></div></td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<th colspan="4">Composite GBP score</th>
							<th colspan="2">{results.layer1.compositeScore} / 100</th>
						</tr>
					</tfoot>
				</table>
			</div>

			<div class="results-actions">
				{#if results.reportText}
					<button class="primary-download" type="button" onclick={downloadLayer1Report}>
						Download report (.txt)
					</button>
				{/if}
				<button class="secondary-button" type="button" onclick={reset}>Back to Intake</button>
			</div>
		</div>
	{/if}
	</div>
	<FooterBar />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #f5f8fa;
		font-family: 'Inter', system-ui, sans-serif;
		color: #1a2b3b;
	}

	.page-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.page-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.page-body {
		flex: 1;
	}

  /* MODAL INTAKE STYLES (KEEPING) */
  .modal-wrap { width: 100%; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 40px 12px; }
  .modal { background: #fff; border-radius: 16px; width: 100%; max-width: 420px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.18); }
  .modal-header { padding: 18px 20px 0; }
  .logo-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .logo { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: #1a1a2e; }
  .logo-mark { width: 26px; height: 26px; border-radius: 6px; background: #0057e7; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: 700; }
  .close-btn { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #e5e7ef; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #888; font-size: 16px; }
  .progress-bar { height: 3px; background: #eef0f5; border-radius: 2px; margin-bottom: 18px; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #0057e7, #338cff); border-radius: 2px; transition: width 0.4s; }
  .step-label { font-size: 10px; color: #a0a5b8; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; margin-bottom: 4px; }
  .screen-title { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .screen-sub { font-size: 13px; color: #6b7280; margin-bottom: 18px; line-height: 1.5; }
  .modal-body { padding: 0 20px; max-height: 480px; overflow-y: auto; }
  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 5px; }
  .field label .opt { font-weight: 400; color: #9ca3af; margin-left: 4px; }
	.field input { width: 100%; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; color: #111827; background: #fff; outline: none; }
	.field input:focus { border-color: #0057e7; }
  .field .hint { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .field-error { font-size: 11px; color: #dc2626; margin-top: 3px; }
  .trade-grid { display: flex; flex-direction: column; gap: 8px; }
  .trade-row { border: 1px solid #e5e7ef; border-radius: 10px; overflow: visible; position: relative; }
  .trade-row.active { border-color: #0057e7; background: #f5f9ff; }
  .trade-main { display: flex; align-items: center; gap: 10px; padding: 10px 12px; cursor: pointer; }
  .trade-radio { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #d1d5db; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .trade-row.active .trade-radio { border-color: #0057e7; }
  .trade-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #0057e7; }
  .trade-name { font-size: 13px; font-weight: 600; color: #111827; flex: 1; }
  .trade-row.inactive .trade-name { color: #6b7280; font-weight: 400; }
  .trade-pill { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
  .pill-primary { background: #dbeafe; color: #1d4ed8; }
  .pill-secondary { background: #d1fae5; color: #065f46; }
  .trade-controls { display: flex; align-items: center; gap: 6px; }
  .pct-input { width: 52px; padding: 4px 6px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; text-align: center; }
  .pct-label { font-size: 10px; color: #9ca3af; }
  .svc-btn { font-size: 11px; padding: 4px 9px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; cursor: pointer; color: #374151; white-space: nowrap; }
  .svc-btn.has-selection { border-color: #0057e7; color: #0057e7; background: #f0f6ff; }
  .col-label { font-size: 9px; color: #bdc1cc; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
  .services-dropdown { position: absolute; right: 0; top: calc(100% + 4px); width: 220px; background: #fff; border: 1px solid #e5e7ef; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 100; padding: 8px 0; }
  .svc-header { padding: 6px 12px 4px; font-size: 10px; font-weight: 700; color: #374151; letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 1px solid #f3f4f6; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; }
  .svc-count { font-size: 10px; color: #6b7280; }
  .svc-item { display: flex; align-items: center; gap: 8px; padding: 5px 12px; cursor: pointer; }
  .svc-item:hover { background: #f5f9ff; }
  .svc-check { width: 14px; height: 14px; border-radius: 4px; border: 1.5px solid #d1d5db; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .svc-check.checked { background: #0057e7; border-color: #0057e7; }
  .svc-check.checked::after { content: ''; display: block; width: 6px; height: 4px; border-left: 1.5px solid #fff; border-bottom: 1.5px solid #fff; transform: rotate(-45deg) translate(1px, -1px); }
  .svc-text { font-size: 12px; color: #374151; }
  .split-note { font-size: 11px; color: #6b7280; background: #f9fafb; border: 1px solid #e5e7ef; border-radius: 7px; padding: 7px 10px; margin-top: 4px; }
  .split-note strong { color: #374151; }
  .job-value-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .job-val-label { font-size: 11px; color: #6b7280; margin-bottom: 4px; font-weight: 500; }
  .dollar-input-wrap { position: relative; }
  .dollar-input-wrap::before { content: '$'; position: absolute; left: 9px; top: 50%; transform: translateY(-50%); font-size: 13px; color: #9ca3af; }
  .dollar-input-wrap input { padding-left: 22px; }
  .eco-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }
  .eco-option { border: 1px solid #e5e7ef; border-radius: 8px; padding: 8px 10px; cursor: pointer; }
  .eco-option.selected { border-color: #0057e7; background: #f5f9ff; }
  .eco-label { font-size: 12px; font-weight: 600; color: #111827; }
  .eco-sub { font-size: 10px; color: #9ca3af; margin-top: 1px; }
  .modal-footer { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px 18px; border-top: 1px solid #f3f4f6; margin-top: 16px; }
  .dot-nav { display: flex; gap: 6px; align-items: center; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: #e5e7ef; }
  .dot.active { background: #0057e7; }
  .btn-back { font-size: 13px; font-weight: 600; color: #6b7280; background: none; border: 1px solid #e5e7ef; border-radius: 8px; padding: 9px 18px; cursor: pointer; }
  .btn-next { font-size: 13px; font-weight: 600; color: #fff; background: #0057e7; border: none; border-radius: 8px; padding: 9px 20px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
  .btn-next:hover { background: #0048c4; }

	/* REVERTED RESULTS PAGE STYLES */
	.results-container {
		background: #ffffff;
		width: 100%;
		border-radius: 24px;
		padding: 60px;
		box-shadow: 0 20px 60px rgba(0,0,0,0.08);
	}

	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 40px;
	}

	.brand h2 {
		font-family: 'Outfit', sans-serif;
		font-size: 28px;
		margin: 0 0 4px 0;
		font-weight: 600;
		color: #152958;
	}

	.brand p {
		font-size: 18px;
		color: #64748b;
	}

	.date {
		color: #94a3b8;
		font-size: 14px;
	}

	.hero-stats {
		display: flex;
		gap: 60px;
		align-items: center;
		margin-bottom: 60px;
		padding: 40px;
		border-radius: 24px;
	}

	.score-circle {
		position: relative;
		width: 220px;
		height: 220px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.score-circle svg {
		position: absolute;
		top: 0;
		left: 0;
		transform: rotate(-90deg);
	}

	.score-circle circle {
		fill: none;
		stroke-width: 3px;
		stroke-linecap: round;
	}

	.score-circle .bg {
		stroke: #e2e8f0;
	}

	.score-circle .fg {
		stroke: currentColor;
		transition: stroke-dasharray 1s ease-out;
	}

	.score-circle.green { color: #10b981; }
	.score-circle.amber { color: #f59e0b; }
	.score-circle.red { color: #ef4444; }

	.score-content {
		text-align: center;
		z-index: 1;
	}

	.score-content .number {
		display: block;
		font-size: 64px;
		font-weight: 500;
		font-family: 'Outfit', sans-serif;
		color: inherit;
		line-height: 1;
	}

	.score-content .label {
		font-size: 14px;
		letter-spacing: 0.1em;
		color: #64748b;
		margin-top: 4px;
	}

	.status-label {
		position: absolute;
		bottom: -20px;
		font-weight: 600;
		font-size: 16px;
	}

	.stats-grid {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
	}

	.stat-card {
		background: #F6F5FA;
		padding: 24px;
		border-radius: 16px;
		border: 1.5px solid #edf2f7;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.stat-card .value {
		font-size: 32px;
		font-weight: 500;
		font-family: 'Outfit', sans-serif;
		color: #0f172a;
	}

	.stat-card .label {
		font-size: 14px;
		color: #64748b;
	}

	.table-container {
		overflow: hidden;
		margin-bottom: 40px;
		border-radius: 12px;
		border: 1px solid #f1f5f9;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 15px;
	}

	th {
		text-align: left;
		padding: 10px 20px;
		background: #152958;
		color: white;
		font-weight: 500;
		font-family: 'Outfit', sans-serif;
		letter-spacing: 0.02em;
	}

	td {
		padding: 14px 20px;
		border-bottom: 1px solid #f1f5f9;
		color: #334155;
	}

	tr:nth-child(even) {
		background-color: #F6F5FA;
	}

	.high { color: #10b981; font-weight: 600; font-family: 'Outfit', sans-serif; }
	.mid { color: #f59e0b; font-weight: 600; font-family: 'Outfit', sans-serif; }
	.low { color: #ef4444; font-weight: 600; font-family: 'Outfit', sans-serif; }
	.zero { color: #b4bfc9; }

	.bar-bg {
		width: 120px;
		height: 8px;
		background: #f1f5f9;
		border-radius: 4px;
		overflow: hidden;
	}

	.bar-fg {
		height: 100%;
		background: #10b981;
		border-radius: 4px;
	}

	.bar-fg.orange { background: #f59e0b; }
	.bar-fg.red { background: #ef4444; }

	tfoot th {
		background: #ffffff;
		color: #0f172a;
		font-size: 17px;
		font-weight: 700;
		padding: 24px 20px;
		border-top: 2px solid #f1f5f9;
		border-radius: 0 !important;
	}

	.results-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: center;
	}

	.primary-download {
		background: #0057e7;
		border: none;
		color: #fff;
		padding: 12px 24px;
		border-radius: 10px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.primary-download:hover {
		background: #0048c4;
	}

	.secondary-button {
		background: transparent;
		border: 1.5px solid #e2e8f0;
		color: #64748b;
		padding: 12px 24px;
		border-radius: 10px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.secondary-button:hover {
		background: #f8fafc;
		border-color: #cbd5e1;
		color: #334155;
	}

	.repair-section {
		margin-top: 60px;
		margin-bottom: 40px;
	}
	.repair-sub {
		color: #64748b;
		font-size: 15px;
		margin-bottom: 30px;
	}
	.repair-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
	}
	.repair-card {
		background: #F6F5FA;
		padding: 20px;
		border-radius: 12px;
		border: 1px solid #edf2f7;
	}
	.repair-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	.repair-name {
		font-weight: 600;
		color: #1e293b;
		font-size: 15px;
	}
	.repair-cost {
		font-family: 'Outfit', sans-serif;
		color: #0057e7;
		font-weight: 600;
		font-size: 16px;
	}
	.repair-track {
		height: 6px;
		background: #e2e8f0;
		border-radius: 3px;
		overflow: hidden;
	}
	.repair-fill {
		height: 100%;
		background: linear-gradient(90deg, #0057e7, #3b82f6);
		border-radius: 3px;
	}

	@media (max-width: 768px) {
		.hero-stats { flex-direction: column; gap: 40px; }
		.results-container { padding: 30px; }
		.repair-grid { grid-template-columns: 1fr; }
	}
</style>
