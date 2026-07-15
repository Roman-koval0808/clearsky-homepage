<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	interface Props {
		isOpen: boolean;
		onclose?: () => void;
		onresults?: (results: any) => void;
	}

	let { isOpen = false, onclose, onresults } = $props<Props>();

	function handleClose() {
		if (onclose) onclose();
		dispatch('close');
	}

	const FALLBACK_TRADES = [
		{
			name: 'Plumber',
			seasons: [
				{ key: 'q1', label: 'Q1 — Jan / Feb / Mar' },
				{ key: 'q2', label: 'Q2 — Apr / May / Jun' },
				{ key: 'q3', label: 'Q3 — Jul / Aug / Sep' },
				{ key: 'q4', label: 'Q4 — Oct / Nov / Dec' }
			]
		},
		{
			name: 'HVAC',
			seasons: [
				{ key: 'q1', label: 'Q1 — Jan / Feb / Mar' },
				{ key: 'q2', label: 'Q2 — Apr / May / Jun' },
				{ key: 'q3', label: 'Q3 — Jul / Aug / Sep' },
				{ key: 'q4', label: 'Q4 — Oct / Nov / Dec' }
			]
		},
		{
			name: 'Electrician',
			seasons: [
				{ key: 'q1', label: 'Q1 — Jan / Feb / Mar' },
				{ key: 'q2', label: 'Q2 — Apr / May / Jun' },
				{ key: 'q3', label: 'Q3 — Jul / Aug / Sep' },
				{ key: 'q4', label: 'Q4 — Oct / Nov / Dec' }
			]
		},
		{
			name: 'Roofer',
			seasons: [
				{ key: 's1', label: 'Spring — Apr / May / Jun' },
				{ key: 's2', label: 'Summer — Jul / Aug / Sep' },
				{ key: 's3', label: 'Fall — Oct / Nov' }
			]
		},
		{
			name: 'Landscaper',
			seasons: [
				{ key: 's1', label: 'Spring — Apr / May' },
				{ key: 's2', label: 'Summer — Jun / Jul / Aug' }
			]
		},
		{
			name: 'Snow Removal',
			seasons: [{ key: 's1', label: 'Winter — Nov / Dec / Jan / Feb / Mar' }]
		},
		{
			name: 'General Contractor',
			seasons: [
				{ key: 'q1', label: 'Q1 — Jan / Feb / Mar' },
				{ key: 'q2', label: 'Q2 — Apr / May / Jun' },
				{ key: 'q3', label: 'Q3 / Aug / Sep' },
				{ key: 'q4', label: 'Q4 — Oct / Nov / Dec' }
			]
		},
		{
			name: 'Painter',
			seasons: [
				{ key: 's1', label: 'Spring — Apr / May / Jun' },
				{ key: 's2', label: 'Summer — Jul / Aug / Sep' }
			]
		}
	];

	const SERVICES_DATA: Record<string, string[]> = {
		plumber: [
			'Emergency Plumbing',
			'Drain Cleaning',
			'Water Heaters',
			'Pipe Repair',
			'Fixture Installation',
			'Sump Pumps',
			'Water Lines',
			'Gas Lines',
			'Backflow Prevention',
			'Inspections'
		],
		hvac: [
			'Heating Systems',
			'Air Conditioning',
			'AC Maintenance',
			'Ductless Systems',
			'Ventilation Services',
			'Indoor Air Quality',
			'Thermostats & Controls',
			'Ductwork Services',
			'Maintenance & Tune-Ups',
			'Emergency HVAC'
		],
		electrician: [
			'Panel Upgrades',
			'Wiring',
			'Outlets & Switches',
			'EV Chargers',
			'Lighting',
			'Generator Install',
			'Safety Inspections',
			'Surge Protection',
			'Smart Home',
			'Commercial'
		],
		roofer: [
			'Roof Replacement',
			'Roof Repair',
			'Shingles',
			'Flat Roofing',
			'Gutters',
			'Skylights',
			'Ice & Water Shield',
			'Soffits & Fascia',
			'Inspections',
			'Emergency Repair'
		]
	};

	const CALC_STEPS = [
		{ id: 'auth', label: 'Authenticating with data sources' },
		{ id: 'gbp', label: 'Crawling Google Business ecosystem' },
		{ id: 'rank', label: 'Analyzing local search rankings' },
		{ id: 'citations', label: 'Scanning network citations' },
		{ id: 'perf', label: 'Evaluating core web vitals' },
		{ id: 'content', label: 'Indexing site content & footprint' },
		{ id: 'social', label: 'Querying social engagement signals' },
		{ id: 'ai', label: 'Testing AI search visibility' },
		{ id: 'calc', label: 'Calculating recoverable revenue' },
		{ id: 'report', label: 'Finalizing diagnostic report' }
	];
	const DEFAULT_CAPACITY_PCT = 85;
	const DEFAULT_PRIMARY_SPLIT_WITH_SECONDARY = 70;
	const LEGACY_EMPTY_SEASON_BREAKDOWN = {};

	function tradeKey(name: string) {
		return name.trim().toLowerCase().replace(/\s+/g, '-');
	}

	function getTradeServices(name: string) {
		const key = tradeKey(name);
		return SERVICES_DATA[key] || [];
	}

	function clampSplit(value: number) {
		if (Number.isNaN(value)) return 0;
		return Math.max(0, Math.min(100, Math.round(value)));
	}

	let visible = $state(false);
	let screen = $state(1);
	let trades = $state<any[]>([]);
	let tradesLoading = $state(true);

	let businessName = $state('Manito Plumbing and Heating Ltd.');
	let website = $state('https://manitoplumbing.ca/');
	let city = $state('Timmins');
	let primaryTrade = $state<any>(null);
	let secondaryTradeName = $state('');
	let primaryRevenuePct = $state(100);
	let selectedServicesByTrade = $state<Record<string, string[]>>({});
	let annualRevenue = $state('1200000');
	let avgSaleValue = $state('3200');
	let avgSaleValueSecondary = $state('3000');
	let yearsInBusiness = $state('14');
	let missedCallRate = $state('20');
	let calcStepIndex = $state(-1);
	let apiError = $state('');

	function ensureTradeServices(tradeName: string) {
		if (!tradeName || selectedServicesByTrade[tradeName]) return;
		selectedServicesByTrade = {
			...selectedServicesByTrade,
			[tradeName]: []
		};
	}

	function setPrimaryTrade(trade: any) {
		primaryTrade = trade;
		ensureTradeServices(trade?.name);
		if (secondaryTradeName && secondaryTradeName === trade?.name) {
			secondaryTradeName = '';
			primaryRevenuePct = 100;
		}
	}

	function setSecondaryTrade(tradeName: string) {
		secondaryTradeName = tradeName;
		if (!tradeName) {
			primaryRevenuePct = 100;
			return;
		}
		ensureTradeServices(tradeName);
		if (primaryRevenuePct === 100) primaryRevenuePct = DEFAULT_PRIMARY_SPLIT_WITH_SECONDARY;
	}

	function toggleTradeService(tradeName: string, service: string) {
		const current = selectedServicesByTrade[tradeName] || [];
		let next = current;
		if (current.includes(service)) next = current.filter((s) => s !== service);
		else if (current.length < 5) next = [...current, service];
		selectedServicesByTrade = { ...selectedServicesByTrade, [tradeName]: next };
	}

	$effect(() => {
		if (isOpen) {
			setTimeout(() => (visible = true), 50);
		} else {
			visible = false;
			screen = 1;
			calcStepIndex = -1;
			apiError = '';
		}
	});

	let hasSecondaryTrade = $derived(Boolean(secondaryTradeName));
	let secondaryRevenuePct = $derived(hasSecondaryTrade ? 100 - primaryRevenuePct : 0);
	let selectedTradeNames = $derived(
		[primaryTrade?.name, secondaryTradeName].filter(Boolean) as string[]
	);
	let servicesComplete = $derived(
		selectedTradeNames.length > 0 &&
			selectedTradeNames.every(
				(tradeName) => (selectedServicesByTrade[tradeName]?.length || 0) === 5
			)
	);
	let revenueSplitValid = $derived(
		!hasSecondaryTrade || primaryRevenuePct + secondaryRevenuePct === 100
	);

	onMount(async () => {
		try {
			const r = await fetch('/api/trades');
			trades = await r.json();
			tradesLoading = false;
			const plumber = trades.find((t) => t.name === 'Plumber');
			if (plumber) setPrimaryTrade(plumber);
		} catch {
			trades = FALLBACK_TRADES;
			tradesLoading = false;
			const plumber = trades.find((t) => t.name === 'Plumber');
			if (plumber) setPrimaryTrade(plumber);
		}
	});

	async function handleSubmit() {
		apiError = '';
		if (!primaryTrade) {
			apiError = 'Please select a primary trade.';
			return;
		}
		if (!revenueSplitValid) {
			apiError = 'Revenue split must equal 100%.';
			return;
		}
		if (!servicesComplete) {
			apiError = 'Select exactly 5 services for each selected trade.';
			return;
		}
		const tradePayload = selectedTradeNames.map((tradeName, idx) => ({
			name: tradeName,
			role: idx === 0 ? 'primary' : 'secondary',
			revenuePct: idx === 0 ? primaryRevenuePct : secondaryRevenuePct,
			selectedServices: selectedServicesByTrade[tradeName] || []
		}));
		const payload = {
			business: {
				name: businessName,
				city,
				trade: primaryTrade.name,
				secondaryTrade: secondaryTradeName || null,
				website
			},
			annualRevenue: parseFloat(annualRevenue) || 0,
			avgSaleValue: parseFloat(avgSaleValue) || 0,
			avgSaleValueSecondary: hasSecondaryTrade ? parseFloat(avgSaleValueSecondary) || 0 : null,
			yearsInBusiness: parseInt(yearsInBusiness, 10) || 5,
			currentCapacityPct: DEFAULT_CAPACITY_PCT,
			missedCallRate: parseFloat(missedCallRate) || 0,
			seasonBreakdown: LEGACY_EMPTY_SEASON_BREAKDOWN,
			primaryTrade: primaryTrade.name,
			secondaryTrade: secondaryTradeName || null,
			revenueSplit: {
				primary: primaryRevenuePct,
				secondary: secondaryRevenuePct
			},
			trades: tradePayload
		};

		screen = 4; // 'calc'
		apiError = '';
		calcStepIndex = 0;

		let stepIdx = 0;
		// Advance every 2500ms to stretch out the ~30s fetch across 10 steps
		const stepInterval = setInterval(() => {
			stepIdx++;
			if (stepIdx < CALC_STEPS.length) calcStepIndex = stepIdx;
			else clearInterval(stepInterval);
		}, 2500);

		try {
			const response = await fetch('/api/diagnostic', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!response.ok) throw new Error('API failed');
			const results = await response.json();
			const remaining = (CALC_STEPS.length - stepIdx) * 250;
			// We reduced remaining wait factor to avoid blocking actual API results unnecessarily
			await new Promise((r) => setTimeout(r, Math.max(remaining, 400)));
			clearInterval(stepInterval);
			calcStepIndex = CALC_STEPS.length;
			await new Promise((r) => setTimeout(r, 300));
			if (onresults) onresults(results);
			dispatch('results', results);
		} catch (err) {
			clearInterval(stepInterval);
			calcStepIndex = -1;
			screen = 3;
			apiError = 'Something went wrong. Please try again.';
		}
	}

	function goNext() {
		if (screen === 1) screen = 2;
		else if (screen === 2) screen = 3;
		else if (screen === 3) handleSubmit();
	}

	function goBack() {
		if (screen === 2) screen = 1;
		else if (screen === 3) screen = 2;
	}

	let progressWidth = $derived(
		screen === 4 ? '100%' : screen === 1 ? '33%' : screen === 2 ? '66%' : '100%'
	);
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="csi-overlay {visible ? 'csi-visible' : ''}"
		onclick={(e) => e.target === e.currentTarget && handleClose()}
	>
		<div class="csi-card">
			<div class="csi-head">
				<div class="csi-logo">
					<div class="csi-logo-mark">
						<svg
							version="1.0"
							xmlns="http://www.w3.org/2000/svg"
							width="194px"
							height="192px"
							viewBox="0 0 1696.000000 608.000000"
							preserveAspectRatio="xMidYMid meet"
							><g
								transform="translate(0.000000,608.000000) scale(0.100000,-0.100000)"
								fill="#4267AD"
								stroke="#4267AD"
								><path
									d="M4135 4896 c-144 -20 -319 -91 -436 -175 -108 -79 -239 -227 -302
-341 -41 -74 -48 -76 -133 -43 -114 45 -321 44 -449 -2 -130 -46 -250 -132
-326 -232 -24 -32 -47 -59 -51 -61 -5 -2 -8 -7 -8 -12 0 -5 -13 -30 -30 -57
-44 -71 -71 -164 -84 -288 -11 -107 -12 -110 -36 -113 -227 -23 -462 -137
-632 -304 -102 -101 -157 -176 -218 -298 -29 -58 -56 -113 -61 -122 -5 -10 -9
-28 -9 -41 0 -13 -4 -27 -9 -32 -13 -13 -30 -83 -43 -170 -19 -135 -1 -412 34
-505 3 -8 18 -50 33 -93 14 -43 35 -94 46 -113 10 -19 29 -51 40 -71 46 -81
85 -131 168 -213 79 -79 186 -161 228 -177 10 -3 29 -14 43 -23 43 -29 204
-90 237 -90 12 0 24 -4 27 -9 3 -4 34 -12 68 -17 104 -14 3210 -11 3293 3 187
32 225 44 388 124 48 23 87 46 87 51 0 4 5 8 11 8 32 0 246 190 305 271 10 14
38 52 62 83 49 64 152 259 152 287 0 10 5 21 10 24 6 3 10 17 10 30 0 13 5 27
10 30 6 3 10 21 10 40 0 19 4 36 8 39 5 3 15 66 22 140 14 143 9 331 -10 426
-17 87 -52 214 -62 225 -4 5 -8 15 -8 22 0 31 -95 204 -157 288 -147 197 -339
353 -524 426 -30 11 -67 26 -84 33 -88 38 -224 66 -362 73 -68 3 -123 9 -124
12 -32 293 -112 479 -283 659 -169 177 -363 277 -601 308 -117 15 -143 15
-250 0z m380 -226 c50 -18 92 -36 93 -41 2 -5 10 -9 17 -9 44 0 216 -151 290
-255 76 -108 107 -178 141 -320 4 -16 8 -101 8 -188 l1 -159 40 9 c47 10 375
9 425 -1 91 -18 136 -34 268 -93 77 -35 220 -139 293 -214 201 -205 316 -469
326 -754 10 -258 -66 -519 -207 -711 -121 -164 -306 -314 -455 -369 -27 -10
-56 -23 -62 -28 -7 -5 -13 -7 -13 -3 0 3 -17 0 -37 -8 -36 -13 -74 -22 -208
-46 -86 -16 -3150 -10 -3185 6 -14 7 -50 17 -80 24 -30 7 -62 17 -70 21 -8 4
-42 20 -75 35 -173 77 -346 251 -432 434 -75 158 -86 208 -91 395 -4 177 3
240 40 350 41 121 93 213 178 315 127 153 292 254 506 309 23 6 103 11 178 11
75 0 136 4 136 8 0 5 -6 31 -14 58 -41 140 -25 293 46 433 36 72 149 195 208
225 19 10 48 25 63 33 79 42 226 55 322 29 94 -25 201 -86 280 -159 20 -18 20
-17 28 20 32 156 127 331 244 450 51 52 203 163 223 163 4 0 20 7 36 14 82 41
166 55 309 52 128 -3 148 -6 230 -36z"
								></path><path
									d="M8205 4858 c-3 -7 -4 -355 -3 -773 l3 -760 105 0 105 0 0 770 0 770
-103 3 c-76 2 -104 -1 -107 -10z"
								></path><path
									d="M12787 4863 c-7 -11 -4 -1533 3 -1534 3 0 51 -2 108 -5 l102 -5 0
241 0 240 58 0 58 0 39 -62 c22 -35 81 -124 131 -199 51 -75 102 -155 113
-177 l21 -42 130 0 c72 0 130 3 130 6 0 4 -44 70 -98 148 -55 77 -126 182
-160 231 -34 50 -77 112 -96 139 -41 59 -45 46 64 201 42 61 82 120 88 132 7
12 18 27 24 35 7 7 39 48 71 91 l57 77 -133 0 -133 0 -21 -38 c-22 -37 -197
-307 -228 -350 -14 -19 -24 -23 -63 -20 l-47 3 -3 448 -2 447 -105 0 c-57 0
-106 -3 -108 -7z"
								></path><path
									d="M7355 4765 c-44 -6 -91 -15 -105 -19 -145 -46 -275 -179 -331 -341
-20 -60 -29 -163 -29 -351 0 -277 14 -358 82 -486 29 -55 116 -148 137 -148 6
0 11 -4 11 -8 0 -5 21 -19 48 -32 26 -12 55 -26 64 -31 10 -5 27 -9 39 -9 11
0 29 -5 40 -11 26 -13 245 -15 261 -2 7 6 29 13 49 17 149 27 299 182 328 340
21 113 27 106 -98 106 l-109 0 -4 -53 c-9 -104 -78 -202 -164 -231 -70 -24
-213 -22 -263 4 -106 53 -159 139 -191 305 -14 74 -8 439 8 508 30 126 102
226 188 262 42 17 229 21 239 5 3 -5 15 -10 26 -10 10 0 19 -4 19 -10 0 -5 6
-10 13 -10 16 0 70 -55 87 -89 19 -38 32 -82 39 -136 l6 -50 107 0 108 0 0 35
c0 52 -26 147 -58 209 -59 116 -197 211 -333 231 -123 18 -131 18 -214 5z"
								></path><path
									d="M11915 4765 c-125 -20 -206 -59 -289 -140 -48 -47 -71 -90 -86 -161
-25 -120 8 -228 94 -309 50 -47 163 -115 192 -115 7 0 14 -3 16 -8 2 -4 39
-19 83 -34 141 -48 167 -59 229 -89 115 -56 156 -110 156 -203 0 -88 -29 -141
-100 -183 -52 -32 -58 -33 -162 -33 -85 0 -119 4 -164 21 -79 30 -138 86 -154
147 -7 26 -14 55 -17 65 -4 15 -18 17 -107 17 -56 0 -105 -2 -108 -5 -10 -10
13 -120 34 -164 45 -93 150 -177 267 -212 36 -11 80 -24 97 -30 17 -5 79 -9
137 -9 113 0 222 22 302 60 56 27 142 105 164 149 73 145 43 322 -74 434 -51
48 -163 117 -191 117 -8 0 -14 4 -14 9 0 5 -10 11 -22 14 -53 12 -264 95 -329
129 -132 68 -155 220 -48 312 52 44 115 61 219 59 73 -1 93 -5 135 -29 72 -40
116 -99 130 -177 l7 -37 111 0 110 0 -6 55 c-18 179 -176 316 -402 350 -115
17 -105 17 -210 0z"
								></path><path
									d="M8990 4371 c-94 -26 -138 -51 -202 -119 -98 -103 -138 -215 -138
-389 0 -137 15 -223 53 -298 30 -61 122 -160 168 -181 67 -32 99 -44 116 -44
10 0 24 -5 30 -11 13 -13 229 -7 288 8 74 19 195 85 195 107 0 18 -61 128 -69
124 -3 -2 -37 -19 -76 -38 -67 -34 -74 -35 -180 -35 -121 0 -157 11 -215 67
-42 40 -81 128 -83 186 l-2 47 334 3 333 2 -4 118 c-10 258 -106 402 -301 453
-86 23 -161 23 -247 0z m215 -174 c52 -29 92 -89 107 -158 19 -93 30 -89 -217
-89 -247 0 -229 -9 -195 102 22 72 63 121 125 149 57 25 131 24 180 -4z"
								></path><path
									d="M10070 4379 c-76 -11 -148 -36 -190 -67 -78 -57 -130 -135 -130 -194
l0 -33 105 0 105 0 10 31 c11 31 46 68 87 92 31 17 147 15 182 -3 67 -34 105
-111 99 -200 l-3 -50 -160 -6 c-174 -7 -222 -16 -303 -57 -120 -61 -180 -168
-169 -301 7 -82 31 -134 85 -183 37 -33 58 -45 135 -77 33 -13 180 -15 205 -2
9 5 34 16 55 25 21 9 63 39 92 67 30 28 58 48 63 45 5 -3 13 -35 17 -71 l7
-65 114 0 c105 0 115 2 110 18 -21 69 -26 143 -26 417 0 383 -10 433 -96 522
-71 73 -242 113 -394 92z m268 -665 l3 -90 -41 -42 c-71 -72 -124 -97 -205
-97 -84 1 -134 26 -159 79 -46 96 17 201 139 234 22 5 90 10 150 9 l110 -2 3
-91z"
								></path><path
									d="M11212 4365 c-47 -21 -81 -50 -131 -110 -19 -23 -31 -3 -31 55 0 69
-4 71 -111 68 l-94 -3 -3 -522 -3 -522 23 -6 c13 -3 64 -5 113 -3 l90 3 3 374
c2 355 3 375 22 401 34 47 95 70 187 70 l80 0 7 102 c6 78 4 103 -6 109 -24
16 -93 8 -146 -16z"
								></path><path
									d="M13720 4375 c0 -3 4 -13 9 -23 18 -35 31 -69 50 -132 11 -36 43 -130
72 -210 28 -80 59 -170 69 -200 10 -30 46 -129 80 -220 85 -227 90 -241 90
-272 0 -15 -20 -66 -45 -115 -56 -111 -85 -133 -174 -133 l-62 0 3 -82 3 -83
70 -3 c162 -7 257 53 335 214 22 44 40 88 40 97 0 10 4 25 9 35 17 33 30 67
65 172 19 58 54 157 76 220 23 63 44 124 47 135 2 11 9 29 13 40 14 32 101
287 111 325 6 19 14 44 19 55 5 11 14 38 21 60 7 22 16 45 20 50 4 6 10 25 14
43 l7 32 -120 0 -120 0 -5 -27 c-14 -70 -20 -90 -33 -120 -8 -17 -14 -40 -14
-51 0 -12 -4 -24 -10 -27 -5 -3 -10 -19 -10 -35 0 -16 -4 -32 -10 -35 -5 -3
-10 -19 -10 -35 0 -16 -4 -31 -9 -34 -5 -4 -12 -25 -16 -48 -4 -23 -11 -49
-15 -58 -14 -29 -32 -85 -37 -115 -3 -16 -9 -34 -13 -40 -4 -5 -13 -34 -21
-62 -14 -58 -35 -69 -45 -25 -4 15 -17 61 -30 102 -12 41 -28 95 -34 120 -7
25 -24 86 -40 135 -15 50 -40 131 -55 180 -15 50 -33 108 -40 130 l-13 40
-121 3 c-67 1 -121 0 -121 -3z"
								></path><path
									d="M9542 3058 c-102 -11 -182 -76 -213 -174 -6 -21 -15 -97 -18 -169
l-6 -130 -90 -5 c-86 -5 -90 -6 -93 -29 -5 -34 12 -41 106 -41 l82 0 0 -490 0
-490 50 0 50 0 2 488 3 487 125 5 125 5 0 30 0 30 -105 2 c-163 4 -150 -7
-150 132 0 134 15 185 66 232 45 41 86 52 164 47 l70 -5 0 37 0 38 -54 4 c-29
1 -81 0 -114 -4z"
								></path><path
									d="M7240 2953 c-123 -20 -240 -104 -289 -208 -32 -68 -30 -213 4 -281
13 -27 36 -61 50 -76 29 -31 109 -88 124 -88 6 0 25 -8 43 -18 18 -9 58 -26
88 -36 30 -10 66 -22 80 -28 42 -18 63 -25 110 -39 25 -7 49 -16 55 -21 5 -4
15 -8 23 -8 29 0 143 -64 172 -96 53 -61 70 -106 70 -186 -1 -130 -63 -207
-201 -249 -60 -18 -88 -21 -197 -17 -116 4 -133 7 -194 35 -86 40 -149 103
-177 177 -11 31 -21 70 -21 86 0 29 -1 30 -50 30 -48 0 -50 -1 -50 -27 0 -69
46 -184 93 -235 29 -31 117 -89 162 -106 79 -30 159 -42 275 -42 105 0 132 4
198 26 98 33 130 53 181 112 59 66 57 62 75 124 31 108 19 193 -41 279 -60 86
-164 148 -348 209 -55 18 -109 36 -120 40 -225 87 -285 129 -320 223 -22 59
-15 137 19 201 28 52 36 61 91 98 65 43 125 58 235 58 214 0 338 -93 372 -280
l12 -60 43 0 c54 0 59 11 43 93 -15 77 -40 127 -93 184 -89 96 -194 133 -372
132 -66 -1 -131 -4 -145 -6z"
								></path><path
									d="M9930 2727 c0 -82 -4 -127 -12 -135 -7 -7 -43 -12 -93 -12 -45 0 -84
-2 -87 -5 -2 -3 -3 -18 0 -35 l4 -29 92 -3 91 -3 5 -415 c5 -454 6 -460 67
-516 45 -41 87 -54 184 -54 l89 0 0 40 0 40 -72 0 c-85 0 -126 20 -155 72 -16
30 -18 67 -18 433 l0 400 118 3 117 3 0 34 0 35 -114 0 c-95 0 -115 3 -120 16
-3 9 -6 69 -6 135 l0 119 -45 0 -45 0 0 -123z"
								></path><path
									d="M8390 2576 c-95 -24 -159 -67 -229 -155 -68 -87 -86 -139 -104 -306
-10 -89 -9 -110 10 -201 37 -182 111 -287 248 -355 64 -31 78 -34 181 -37 162
-5 246 27 341 132 55 60 82 107 102 176 7 25 17 59 22 76 5 17 9 84 9 150 0
215 -64 362 -200 456 -99 70 -254 96 -380 64z m242 -83 c96 -37 168 -119 209
-238 21 -60 24 -89 24 -205 0 -126 -2 -140 -30 -213 -22 -57 -45 -95 -83 -138
-71 -78 -117 -98 -235 -101 -81 -3 -98 0 -142 21 -142 71 -215 221 -215 445 0
95 4 126 26 192 14 44 32 86 40 95 8 8 14 19 14 24 0 17 86 88 135 111 63 30
190 33 257 7z"
								></path><path
									d="M12310 2576 c-73 -14 -162 -60 -200 -103 -38 -42 -83 -127 -78 -151
2 -13 15 -18 51 -20 49 -3 50 -3 62 51 3 16 26 50 51 77 53 56 120 80 230 80
125 0 216 -64 248 -173 19 -65 21 -198 4 -215 -8 -8 -60 -12 -167 -12 -333 0
-496 -95 -509 -297 -8 -126 41 -209 155 -264 63 -30 70 -31 168 -27 94 3 108
6 180 42 45 22 95 57 120 82 23 24 47 44 53 44 7 0 12 -17 12 -42 0 -24 3 -60
6 -80 l7 -38 54 0 c49 0 54 2 47 18 -4 9 -11 188 -14 397 -7 413 -10 437 -68
515 -32 43 -46 55 -97 82 -85 45 -201 57 -315 34z m378 -644 c3 -121 -6 -148
-79 -221 -59 -59 -139 -100 -222 -112 -84 -12 -140 -2 -195 35 -64 43 -87 86
-86 162 1 107 63 183 185 224 45 16 81 19 224 17 l170 -2 3 -103z"
								></path><path
									d="M13410 2574 c-58 -21 -96 -50 -145 -112 -22 -28 -45 -51 -51 -52 -12
0 -24 67 -24 132 l0 39 -42 -3 -43 -3 0 -523 0 -523 49 3 49 3 2 360 c1 198 5
369 9 380 65 167 136 225 284 233 l83 5 -3 36 -4 36 -59 2 c-35 2 -79 -4 -105
-13z"
								></path><path
									d="M13995 2576 c-104 -30 -215 -122 -255 -212 -62 -137 -62 -138 -67
-289 -10 -275 79 -442 277 -524 78 -33 216 -40 312 -16 82 20 186 68 195 91 5
14 -14 74 -25 74 -3 0 -28 -15 -56 -34 -28 -18 -73 -39 -101 -46 -66 -17 -223
-24 -249 -12 -12 6 -39 18 -61 27 -51 23 -118 96 -150 162 -24 52 -45 148 -45
210 l0 33 363 2 362 3 -1 95 c-1 91 -23 191 -55 253 -22 42 -80 107 -122 136
-82 56 -220 76 -322 47z m230 -94 c91 -47 152 -147 167 -275 8 -64 7 -81 -4
-88 -7 -5 -144 -9 -304 -9 -222 0 -294 3 -302 13 -12 14 -2 85 25 166 23 71
126 180 193 204 61 23 171 17 225 -11z"
								></path><path
									d="M10445 2563 c4 -10 11 -33 16 -50 15 -55 27 -95 44 -153 19 -65 32
-114 40 -155 4 -16 10 -39 15 -50 4 -11 13 -38 19 -60 6 -22 28 -103 50 -180
22 -77 50 -178 62 -225 43 -170 41 -165 93 -168 31 -2 47 1 50 10 2 7 20 63
39 123 19 61 42 137 52 170 9 33 30 101 46 150 28 89 59 193 80 270 6 22 17
58 25 80 8 23 14 48 14 57 0 22 19 33 32 20 13 -13 47 -110 48 -135 0 -9 4
-25 9 -35 5 -9 21 -57 36 -107 15 -49 44 -142 65 -205 55 -168 90 -282 90
-294 0 -6 7 -30 16 -53 l17 -43 52 0 c52 0 53 1 58 33 3 17 10 48 15 67 6 19
21 73 33 120 12 47 25 94 30 105 9 22 72 248 95 340 20 83 35 135 45 165 12
35 50 182 52 200 2 11 -9 15 -41 15 -24 0 -47 -2 -51 -5 -4 -3 -18 -50 -30
-105 -13 -55 -29 -120 -36 -145 -8 -25 -23 -88 -35 -140 -13 -52 -26 -104 -31
-115 -5 -11 -16 -49 -24 -85 -8 -36 -25 -103 -39 -150 -14 -47 -26 -94 -26
-105 0 -11 -4 -26 -9 -34 -13 -21 -41 4 -41 35 0 14 -4 32 -9 42 -5 9 -16 42
-24 72 -20 67 -45 150 -90 295 -19 61 -42 137 -51 170 -10 33 -33 107 -51 165
l-33 105 -47 0 -48 0 -38 -135 c-22 -74 -48 -169 -59 -210 -12 -41 -31 -109
-44 -150 -13 -41 -38 -122 -55 -180 -18 -58 -36 -113 -41 -122 -6 -10 -10 -29
-10 -42 0 -64 -34 -76 -49 -18 -6 20 -26 102 -46 182 -20 80 -40 159 -45 175
-5 17 -16 59 -25 95 -30 125 -84 325 -97 365 -13 39 -14 40 -67 43 -48 3 -53
1 -46 -15z"
								></path></g
							></svg
						>
					</div>
				</div>
				<button class="csi-close-btn" onclick={handleClose}>✕</button>
			</div>

			<div class="csi-progress">
				<div class="csi-progress-fill" style="width: {progressWidth}"></div>
			</div>

			<div class="csi-body">
				{#if screen === 1}
					<div class="csi-step-label">Step 1 of 3</div>
					<div class="csi-title">Your business</div>
					<div class="csi-sub">We will look up your digital presence — no login needed.</div>
					<div class="csi-field">
						<label class="csi-label">Business name</label>
						<input class="csi-input" type="text" bind:value={businessName} />
					</div>
					<div class="csi-field">
						<label class="csi-label">Website (optional)</label>
						<input class="csi-input" type="text" bind:value={website} />
					</div>
					<div class="csi-field">
						<label class="csi-label">City</label>
						<input class="csi-input" type="text" bind:value={city} />
					</div>
					<div class="csi-field">
						<label class="csi-label">Primary trade</label>
						{#if tradesLoading}
							<div style="font-size: 13px; color: #94a3b8; padding: 10px 0;">Loading trades…</div>
						{:else}
							<div class="csi-radio-list">
								{#each trades as trade}
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="csi-radio-item {primaryTrade?.name === trade.name ? 'selected' : ''}"
										onclick={() => setPrimaryTrade(trade)}
									>
										<div class="csi-radio-dot"><div class="csi-radio-inner"></div></div>
										<span class="csi-radio-label">{trade.name}</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<div class="csi-field">
						<label class="csi-label">Secondary trade (optional)</label>
						<select
							class="csi-input"
							value={secondaryTradeName}
							onchange={(e) => setSecondaryTrade((e.currentTarget as HTMLSelectElement).value)}
						>
							<option value="">None</option>
							{#each trades as trade}
								{#if trade.name !== primaryTrade?.name}
									<option value={trade.name}>{trade.name}</option>
								{/if}
							{/each}
						</select>
					</div>
					<div class="csi-field">
						<label class="csi-label">Revenue split</label>
						<div class="csi-split-card">
							<div class="csi-split-labels">
								<span>{primaryTrade?.name || 'Primary'}: {primaryRevenuePct}%</span>
								<span>{secondaryTradeName || 'Secondary'}: {secondaryRevenuePct}%</span>
							</div>
							<input
								class="csi-split-slider"
								type="range"
								min="0"
								max="100"
								value={primaryRevenuePct}
								disabled={!hasSecondaryTrade}
								oninput={(e) =>
									(primaryRevenuePct = clampSplit(
										Number((e.currentTarget as HTMLInputElement).value)
									))}
							/>
							<div class="csi-split-inputs">
								<div class="csi-sfx">
									<input
										class="csi-input"
										type="number"
										min="0"
										max="100"
										value={primaryRevenuePct}
										disabled={!hasSecondaryTrade}
										oninput={(e) =>
											(primaryRevenuePct = clampSplit(
												Number((e.currentTarget as HTMLInputElement).value)
											))}
									/><span class="csi-sfx-sym">%</span>
								</div>
								<div class="csi-sfx">
									<input
										class="csi-input"
										type="number"
										value={secondaryRevenuePct}
										disabled
									/><span class="csi-sfx-sym">%</span>
								</div>
							</div>
							<div class="csi-split-note">
								{#if hasSecondaryTrade}
									Total split: {primaryRevenuePct + secondaryRevenuePct}% {revenueSplitValid
										? 'valid'
										: '— must equal 100%'}
								{:else}
									Secondary trade not selected, primary stays at 100%.
								{/if}
							</div>
						</div>
					</div>
				{:else if screen === 2}
					<div class="csi-step-label">Step 2 of 3</div>
					<div class="csi-title">Your numbers</div>
					<div class="csi-sub">Rough estimates are fine — this drives your gap calculation.</div>
					<div class="csi-field">
						<label class="csi-label">Last year's revenue (or best estimate)</label>
						<div class="csi-pfx">
							<span class="csi-pfx-sym">$</span><input
								class="csi-input"
								type="number"
								bind:value={annualRevenue}
							/>
						</div>
					</div>
					<div class="csi-field">
						<label class="csi-label">Average job value ({primaryTrade?.name || 'Primary'})</label>
						<div class="csi-pfx">
							<span class="csi-pfx-sym">$</span><input
								class="csi-input"
								type="number"
								bind:value={avgSaleValue}
							/>
						</div>
					</div>
					{#if hasSecondaryTrade}
						<div class="csi-field">
							<label class="csi-label">Average job value ({secondaryTradeName})</label>
							<div class="csi-pfx">
								<span class="csi-pfx-sym">$</span><input
									class="csi-input"
									type="number"
									bind:value={avgSaleValueSecondary}
								/>
							</div>
						</div>
					{/if}
					<div class="csi-field">
						<label class="csi-label">Years in business</label>
						<input class="csi-input" type="number" bind:value={yearsInBusiness} />
					</div>
					<div class="csi-field">
						<label class="csi-label">Percentage of calls unanswered?</label>
						<div class="csi-sfx">
							<input class="csi-input" type="number" bind:value={missedCallRate} /><span
								class="csi-sfx-sym">%</span
							>
						</div>
					</div>
				{:else if screen === 3}
					<div class="csi-step-label">Step 3 of 3</div>
					<div class="csi-title">Top 5 services per trade</div>
					<div class="csi-sub">Pick exactly 5 services for each selected trade.</div>
					<div class="csi-services-groups">
						{#each selectedTradeNames as tradeName}
							<div class="csi-services-group">
								<div class="csi-services-head">
									<span class="csi-services-title">{tradeName}</span>
									<span class="csi-services-count">
										{(selectedServicesByTrade[tradeName] || []).length} / 5 selected
									</span>
								</div>
								<div class="csi-services-grid">
									{#each getTradeServices(tradeName) as service}
										<button
											type="button"
											class="csi-service-chip {(selectedServicesByTrade[tradeName] || []).includes(
												service
											)
												? 'selected'
												: ''}"
											onclick={() => toggleTradeService(tradeName, service)}
										>
											{service}
										</button>
									{/each}
								</div>
							</div>
						{/each}
					</div>
					<div class="csi-total-row {servicesComplete ? 'ok' : 'pending'}">
						<span class="csi-total-label">Service selection status</span>
						<span class="csi-total-val"
							>{servicesComplete ? 'Ready' : 'Select 5 services per trade'}</span
						>
					</div>
					{#if apiError}<div class="csi-error">{apiError}</div>{/if}
				{:else if screen === 4}
					<div class="csi-calc">
						<div class="csi-spinner">
							<div class="csi-ring-outer"></div>
							<div class="csi-ring-inner"></div>
							<div class="csi-hamster">🐹</div>
						</div>
						<div class="csi-calc-title">Scanning your digital presence…</div>
						<div class="csi-calc-sub">Checking 12 data sources. Hang tight.</div>
						<div class="csi-calc-steps">
							{#each CALC_STEPS as step, i}
								<div
									class="csi-calc-step {i === calcStepIndex
										? 'active'
										: i < calcStepIndex
											? 'done'
											: ''}"
								>
									<div class="csi-step-dot"></div>
									{step.label}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			{#if screen !== 4}
				<div class="csi-foot">
					<div class="csi-dots">
						{#each [1, 2, 3] as i}<div
								class="csi-dot {i === screen ? 'on' : i < screen ? 'past' : ''}"
							></div>{/each}
					</div>
					{#if screen > 1}<button
							class="btn-outline !rounded-lg !px-3 !py-1.5 !text-xs"
							onclick={goBack}>← Back</button
						>{/if}
					<button
						class="btn-primary !rounded-lg !px-4 !py-1.5 !text-sm {screen === 3 ? 'submit' : ''}"
						onclick={goNext}
						disabled={screen === 3 && (!primaryTrade || !servicesComplete || !revenueSplitValid)}
					>
						{screen === 3 ? 'Show me my revenue gap →' : 'Next →'}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.csi-overlay {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.4);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px 16px;
		z-index: 9998;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}
	.csi-overlay.csi-visible {
		opacity: 1;
		pointer-events: all;
	}

	.csi-card {
		background: #ffffff;
		border-radius: 20px;
		width: 100%;
		max-width: 480px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		transform: translateY(20px);
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
		max-height: 90vh;
	}
	.csi-overlay.csi-visible .csi-card {
		transform: translateY(0);
	}

	.csi-head {
		padding-left: 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid #f1f5f9;
		background: #ffffff;
		flex-shrink: 0;
	}
	.csi-logo {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.csi-logo-mark {
		width: 80px;
		height: 80px;
		border-radius: 6px;

		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-sohne);
		font-size: 12px;
		font-weight: 700;
		color: #ffffff;
	}
	.csi-close-btn {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		background: #f8fafc;
		cursor: pointer;
		font-size: 14px;
		color: #64748b;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}
	.csi-close-btn:hover {
		background: #f1f5f9;
		color: var(--color-text-dark);
		border-color: #cbd5e1;
	}

	.csi-progress {
		height: 4px;
		background: #f1f5f9;
		flex-shrink: 0;
	}
	.csi-progress-fill {
		height: 100%;
		background: var(--color-brand-orange);
		transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.csi-body {
		padding: 32px 24px;
		overflow-y: auto;
		flex: 1;
		text-align: left;
	}

	.csi-step-label {
		font-family: var(--font-inter);
		font-size: 11px;
		font-weight: 700;
		color: #94a3b8;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		margin-bottom: 12px;
	}
	.csi-title {
		font-family: var(--font-sohne);
		font-size: 24px;
		font-weight: 700;
		color: var(--color-text-dark);
		margin-bottom: 6px;
	}
	.csi-sub {
		font-size: 14px;
		color: #64748b;
		margin-bottom: 24px;
		line-height: 1.6;
	}

	.csi-field {
		margin-bottom: 20px;
	}
	.csi-label {
		display: block;
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text-dark);
		margin-bottom: 8px;
	}
	.csi-input {
		display: block;
		width: 100%;
		padding: 12px 16px;
		border-radius: 10px;
		border: 1.5px solid #e2e8f0;
		font-size: 15px;
		color: var(--color-text-dark);
		background: #ffffff;
		outline: none;
		font-family: var(--font-inter);
		transition: all 0.2s;
	}
	.csi-input:focus {
		border-color: var(--color-brand-blue);
		box-shadow: 0 0 0 3px rgba(47, 89, 152, 0.1);
	}
	.csi-input::placeholder {
		color: #cbd5e1;
	}

	.csi-pfx {
		position: relative;
	}
	.csi-pfx-sym {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 15px;
		color: #94a3b8;
		pointer-events: none;
		font-weight: 600;
	}
	.csi-pfx .csi-input {
		padding-left: 32px;
	}
	.csi-sfx {
		position: relative;
	}
	.csi-sfx-sym {
		position: absolute;
		right: 16px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 15px;
		color: #94a3b8;
		pointer-events: none;
		font-weight: 600;
	}
	.csi-sfx .csi-input {
		padding-right: 36px;
	}

	.csi-radio-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.csi-radio-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 12px;
		border: 1.5px solid #e2e8f0;
		background: #ffffff;
		cursor: pointer;
		transition: all 0.2s;
		user-select: none;
	}
	.csi-radio-item:hover {
		border-color: var(--color-brand-blue);
		background: var(--color-brand-blue-light);
	}
	.csi-radio-item.selected {
		border-color: var(--color-brand-blue);
		background: var(--color-brand-blue-light);
	}
	.csi-radio-dot {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid #cbd5e1;
		background: #ffffff;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}
	.csi-radio-item.selected .csi-radio-dot {
		border-color: var(--color-brand-blue);
	}
	.csi-radio-inner {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--color-brand-blue);
		display: none;
	}
	.csi-radio-item.selected .csi-radio-inner {
		display: block;
	}
	.csi-radio-label {
		font-size: 15px;
		color: var(--color-text-dark);
		font-weight: 500;
	}

	.csi-split-card {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 14px;
		background: #f8fafc;
	}
	.csi-split-labels {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text-dark);
		margin-bottom: 10px;
	}
	.csi-split-slider {
		width: 100%;
		margin-bottom: 10px;
	}
	.csi-split-inputs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	.csi-split-note {
		font-size: 12px;
		color: #64748b;
		margin-top: 8px;
	}

	.csi-services-groups {
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin-bottom: 20px;
	}
	.csi-services-group {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 14px;
		background: #f8fafc;
	}
	.csi-services-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 10px;
	}
	.csi-services-title {
		font-size: 14px;
		font-weight: 700;
		color: var(--color-text-dark);
	}
	.csi-services-count {
		font-size: 12px;
		font-weight: 600;
		color: #64748b;
	}
	.csi-services-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.csi-service-chip {
		border: 1px solid #cbd5e1;
		background: #fff;
		color: #334155;
		border-radius: 999px;
		padding: 6px 10px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
	}
	.csi-service-chip.selected {
		border-color: var(--color-brand-blue);
		background: var(--color-brand-blue-light);
		color: var(--color-brand-blue);
	}

	.csi-total-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 18px;
		border-radius: 12px;
		border: 1.5px solid #e2e8f0;
		background: #f8fafc;
		margin-bottom: 8px;
		transition: all 0.3s;
	}
	.csi-total-row.ok {
		border-color: #10b981;
		background: #ecfdf5;
	}
	.csi-total-label {
		font-size: 13px;
		font-weight: 700;
		color: #64748b;
	}
	.csi-total-val {
		font-size: 18px;
		font-weight: 700;
		color: var(--color-text-dark);
		font-family: var(--font-inter);
	}
	.csi-total-row.ok .csi-total-val {
		color: #10b981;
	}

	.csi-foot {
		padding: 20px 24px 24px;
		display: flex;
		align-items: center;
		gap: 12px;
		border-top: 1px solid #f1f5f9;
		background: #ffffff;
		flex-shrink: 0;
	}
	.csi-dots {
		display: flex;
		gap: 8px;
		align-items: center;
		margin-right: auto;
	}
	.csi-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #e2e8f0;
		transition: all 0.3s;
	}
	.csi-dot.on {
		background: var(--color-brand-orange);
		transform: scale(1.5);
	}
	.csi-dot.past {
		background: var(--color-brand-orange);
		opacity: 0.4;
	}

	.csi-calc {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40px 24px;
		text-align: center;
		background: #ffffff;
	}
	.csi-spinner {
		width: 80px;
		height: 80px;
		position: relative;
		margin-bottom: 24px;
	}
	.csi-ring-outer {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		border: 4px solid #f1f5f9;
		border-top-color: var(--color-brand-orange);
		border-right-color: var(--color-brand-orange);
		animation: csiSpin 0.9s linear infinite;
	}
	.csi-ring-inner {
		position: absolute;
		inset: 15px;
		border-radius: 50%;
		border: 3px solid #f8fafc;
		border-top-color: var(--color-brand-blue);
		animation: csiSpin 1.4s linear infinite reverse;
	}
	.csi-hamster {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 24px;
		animation: csiBob 0.45s ease-in-out infinite alternate;
		line-height: 1;
	}
	@keyframes csiSpin {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes csiBob {
		from {
			margin-top: -2px;
		}
		to {
			margin-top: 2px;
		}
	}

	.csi-calc-title {
		font-family: var(--font-sohne);
		font-size: 18px;
		font-weight: 700;
		color: var(--color-text-dark);
		margin-bottom: 8px;
	}
	.csi-calc-sub {
		font-size: 13px;
		color: #94a3b8;
		margin-bottom: 32px;
	}

	.csi-calc-steps {
		width: 100%;
		text-align: left;
	}
	.csi-calc-step {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 0;
		border-bottom: 1px solid #f8fafc;
		font-size: 13px;
		color: #cbd5e1;
		transition: all 0.3s;
	}
	.csi-calc-step:last-child {
		border-bottom: none;
	}
	.csi-step-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #e2e8f0;
		flex-shrink: 0;
		transition: all 0.3s;
	}
	.csi-calc-step.active {
		color: var(--color-brand-blue);
		font-weight: 700;
	}
	.csi-calc-step.active .csi-step-dot {
		background: var(--color-brand-blue);
		animation: csiPulse 0.7s ease-in-out infinite;
	}
	.csi-calc-step.done {
		color: #10b981;
		font-weight: 700;
	}
	.csi-calc-step.done .csi-step-dot {
		background: #10b981;
	}
	@keyframes csiPulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	.csi-error {
		margin-top: 20px;
		padding: 12px 16px;
		border-radius: 10px;
		background: #fef2f2;
		border: 1px solid #fecaca;
		font-size: 13px;
		color: #ef4444;
		line-height: 1.5;
	}

	@media (max-width: 520px) {
		.csi-card {
			border-radius: 12px;
			max-height: 100vh;
		}
	}
</style>
