<script lang="ts">
	interface Props {
		isOpen: boolean;
		data: any;
		onclose?: () => void;
		oncta?: () => void;
		onconfirmInputs?: (data: any) => void;
	}

	let { 
		isOpen = false, 
		data = null, 
		onclose, 
		oncta, 
		onconfirmInputs 
	} = $props<Props>();

	function handleClose() {
		if (onclose) onclose();
	}

	let visible = $state(false);
	let repMode = $state(false);
	let debugMode = $state(false);
	let confirmed = $state(false);

	$effect(() => {
		if (isOpen) {
			setTimeout(() => (visible = true), 50);
		} else {
			visible = false;
			repMode = false;
			debugMode = false;
			confirmed = false;
		}
	});

	const CONF_LABELS: Record<string, string> = {
		gbp: 'GBP',
		rank: 'Rank',
		citations: 'Citations',
		performance: 'Site Speed',
		content: 'Content',
		aiVisibility: 'AI Visibility',
		missedCalls: 'Missed Calls',
		social: 'Social',
		paid: 'Paid',
		engagement: 'Engagement',
		conversion: 'Conversion',
		growth: 'Growth',
		canonical: 'Canonical',
		market: 'Market Tier',
		brandEquity: 'Brand Equity'
	};

	const LAYER_DESC: Record<string, string> = {
		gbp: "Analysis of your Google Business Profile performance, including star ratings, review velocity, and owner response rates.",
		rank: "Your visibility in the Google 'Map Pack' and organic search results for high-intent local keywords.",
		citations: "Consistency of your Name, Address, and Phone (NAP) across directories, which builds local ranking authority.",
		performance: "Technical site health and loading speed. Fast sites convert visitors into leads at a much higher rate.",
		content: "The depth of your service pages and FAQ content. Measures how well you answer prospect questions.",
		aiVisibility: "How likely your business is to be recommended by AI agents like ChatGPT, Gemini, and Perplexity.",
		missedCalls: "Revenue lost to unhandled inquiries. ClearSky recovers this with 24/7 automated response layers.",
		social: "Brand sentiment and engagement on social platforms. Active profiles improve your conversion rate.",
		paid: "Assessment of waste in current ad spend. We look for 'leaky' campaigns that spend without converting.",
		engagement: "Presence of trust signals like live chat, online booking, and emergency availability badges.",
		conversion: "Infrastructure for lead capture, ensuring auto-responders are capturing intent 24/7.",
		growth: "Retention and referral systems designed to turn one-time jobs into long-term customer relationships.",
		canonical: "Master record alignment across all platforms. Misalignment suppresses your ranking power.",
		market: "Local economic demand and competitive density in your specific city and trade.",
		brandEquity: "The value of your established local name recognition, acting as a force-multiplier for all marketing."
	};

	function confClass(key: string, v: number, errors: any) {
		if (errors && errors[key]) return 'cs-conf-error';
		return v >= 0.9 ? 'cs-conf-full' : v >= 0.4 ? 'cs-conf-partial' : 'cs-conf-default';
	}

	function confLabel(key: string, v: number, errors: any) {
		if (errors && errors[key]) return 'Error';
		return v >= 0.9 ? 'Full' : v >= 0.4 ? 'Partial' : 'Default';
	}

	function spreadSubLabel(pct: number) {
		if (pct <= 22) return 'high confidence — tight range';
		if (pct <= 32) return 'medium confidence — moderate range';
		return 'wider range — confirm inputs to narrow';
	}

	function midPct(low: number, mid: number, high: number) {
		const span = (high || 0) - (low || 0);
		return span > 0 ? Math.round(((mid - low) / span) * 100) : 50;
	}

	function footerCtx(confPct: string, spreadPct: number) {
		if (!confPct)
			return 'This estimate is based on live data from your digital presence. A ClearSky advisor can verify key inputs and narrow the range to a tighter estimate.';
		const n = parseInt(confPct);
		if (n >= 85)
			return `Diagnostic confidence: <em class="text-brand-orange font-bold not-italic">${confPct}</em>. Confirming remaining inputs with a ClearSky advisor can narrow this range further and unlock your action plan.`;
		return `Some inputs are estimated. A ClearSky advisor can confirm the details that would narrow this from ±${spreadPct}% down toward ±20% — and produce a tighter dollar figure.`;
	}

	function handleConfirm() {
		confirmed = true;
		if (onconfirmInputs) onconfirmInputs({ confidenceData: results.rc });
		setTimeout(() => (confirmed = false), 2500);
	}

	// Single derived object to ensure reactivity and consistent defaults
	let results = $derived.by(() => {
		const b = data?.business || {};
		const m = data?.meta || {};
		const sc = data?.scenarios || {};
		const rc = data?.rawGaps?.confidence || {};
		const le = data?.rawGaps?.layerErrors || {};
		const raw = data?.rawGaps || {};
		const tg = sc.technicalGap || {};
		const gaps = data?.gaps || {};
		const spreadPct = Math.round((rc.uncertaintySpread || 0.22) * 100);
		const fillPct = Math.min(100, Math.max(20, Math.round(20 + ((spreadPct - 20) / 25) * 80)));

		const s3note = m.marketDemandTier
			? `${m.marketDemandTier} market demand (${m.marketOpportunityMultiplier || ''}) · ${m.competitiveDensity || ''} competitor density · ${m.brandTenureLabel || ''} brand tenure`
			: 'Full score × brand tenure × market opportunity. The ceiling ClearSky is built to reach.';

		return { b, m, sc, rc, le, tg, raw, gaps, spreadPct, fillPct, s3note };
	});
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="cs-modal-overlay {visible ? 'cs-visible' : ''}"
		onclick={(e) => e.target === e.currentTarget && handleClose()}
	>
		<div class="cs-modal">
			<div class="cs-header">
				<div class="cs-header-left">
					<div class="cs-logo">
						<div class="cs-logo-mark"><svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="194px" height="192px" viewBox="0 0 1696.000000 608.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,608.000000) scale(0.100000,-0.100000)" fill="#4267AD" stroke="#4267AD"><path d="M4135 4896 c-144 -20 -319 -91 -436 -175 -108 -79 -239 -227 -302
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
166 55 309 52 128 -3 148 -6 230 -36z"></path><path d="M8205 4858 c-3 -7 -4 -355 -3 -773 l3 -760 105 0 105 0 0 770 0 770
-103 3 c-76 2 -104 -1 -107 -10z"></path><path d="M12787 4863 c-7 -11 -4 -1533 3 -1534 3 0 51 -2 108 -5 l102 -5 0
241 0 240 58 0 58 0 39 -62 c22 -35 81 -124 131 -199 51 -75 102 -155 113
-177 l21 -42 130 0 c72 0 130 3 130 6 0 4 -44 70 -98 148 -55 77 -126 182
-160 231 -34 50 -77 112 -96 139 -41 59 -45 46 64 201 42 61 82 120 88 132 7
12 18 27 24 35 7 7 39 48 71 91 l57 77 -133 0 -133 0 -21 -38 c-22 -37 -197
-307 -228 -350 -14 -19 -24 -23 -63 -20 l-47 3 -3 448 -2 447 -105 0 c-57 0
-106 -3 -108 -7z"></path><path d="M7355 4765 c-44 -6 -91 -15 -105 -19 -145 -46 -275 -179 -331 -341
-20 -60 -29 -163 -29 -351 0 -277 14 -358 82 -486 29 -55 116 -148 137 -148 6
0 11 -4 11 -8 0 -5 21 -19 48 -32 26 -12 55 -26 64 -31 10 -5 27 -9 39 -9 11
0 29 -5 40 -11 26 -13 245 -15 261 -2 7 6 29 13 49 17 149 27 299 182 328 340
21 113 27 106 -98 106 l-109 0 -4 -53 c-9 -104 -78 -202 -164 -231 -70 -24
-213 -22 -263 4 -106 53 -159 139 -191 305 -14 74 -8 439 8 508 30 126 102
226 188 262 42 17 229 21 239 5 3 -5 15 -10 26 -10 10 0 19 -4 19 -10 0 -5 6
-10 13 -10 16 0 70 -55 87 -89 19 -38 32 -82 39 -136 l6 -50 107 0 108 0 0 35
c0 52 -26 147 -58 209 -59 116 -197 211 -333 231 -123 18 -131 18 -214 5z"></path><path d="M11915 4765 c-125 -20 -206 -59 -289 -140 -48 -47 -71 -90 -86 -161
-25 -120 8 -228 94 -309 50 -47 163 -115 192 -115 7 0 14 -3 16 -8 2 -4 39
-19 83 -34 141 -48 167 -59 229 -89 115 -56 156 -110 156 -203 0 -88 -29 -141
-100 -183 -52 -32 -58 -33 -162 -33 -85 0 -119 4 -164 21 -79 30 -138 86 -154
147 -7 26 -14 55 -17 65 -4 15 -18 17 -107 17 -56 0 -105 -2 -108 -5 -10 -10
13 -120 34 -164 45 -93 150 -177 267 -212 36 -11 80 -24 97 -30 17 -5 79 -9
137 -9 113 0 222 22 302 60 56 27 142 105 164 149 73 145 43 322 -74 434 -51
48 -163 117 -191 117 -8 0 -14 4 -14 9 0 5 -10 11 -22 14 -53 12 -264 95 -329
129 -132 68 -155 220 -48 312 52 44 115 61 219 59 73 -1 93 -5 135 -29 72 -40
116 -99 130 -177 l7 -37 111 0 110 0 -6 55 c-18 179 -176 316 -402 350 -115
17 -105 17 -210 0z"></path><path d="M8990 4371 c-94 -26 -138 -51 -202 -119 -98 -103 -138 -215 -138
-389 0 -137 15 -223 53 -298 30 -61 122 -160 168 -181 67 -32 99 -44 116 -44
10 0 24 -5 30 -11 13 -13 229 -7 288 8 74 19 195 85 195 107 0 18 -61 128 -69
124 -3 -2 -37 -19 -76 -38 -67 -34 -74 -35 -180 -35 -121 0 -157 11 -215 67
-42 40 -81 128 -83 186 l-2 47 334 3 333 2 -4 118 c-10 258 -106 402 -301 453
-86 23 -161 23 -247 0z m215 -174 c52 -29 92 -89 107 -158 19 -93 30 -89 -217
-89 -247 0 -229 -9 -195 102 22 72 63 121 125 149 57 25 131 24 180 -4z"></path><path d="M10070 4379 c-76 -11 -148 -36 -190 -67 -78 -57 -130 -135 -130 -194
l0 -33 105 0 105 0 10 31 c11 31 46 68 87 92 31 17 147 15 182 -3 67 -34 105
-111 99 -200 l-3 -50 -160 -6 c-174 -7 -222 -16 -303 -57 -120 -61 -180 -168
-169 -301 7 -82 31 -134 85 -183 37 -33 58 -45 135 -77 33 -13 180 -15 205 -2
9 5 34 16 55 25 21 9 63 39 92 67 30 28 58 48 63 45 5 -3 13 -35 17 -71 l7
-65 114 0 c105 0 115 2 110 18 -21 69 -26 143 -26 417 0 383 -10 433 -96 522
-71 73 -242 113 -394 92z m268 -665 l3 -90 -41 -42 c-71 -72 -124 -97 -205
-97 -84 1 -134 26 -159 79 -46 96 17 201 139 234 22 5 90 10 150 9 l110 -2 3
-91z"></path><path d="M11212 4365 c-47 -21 -81 -50 -131 -110 -19 -23 -31 -3 -31 55 0 69
-4 71 -111 68 l-94 -3 -3 -522 -3 -522 23 -6 c13 -3 64 -5 113 -3 l90 3 3 374
c2 355 3 375 22 401 34 47 95 70 187 70 l80 0 7 102 c6 78 4 103 -6 109 -24
16 -93 8 -146 -16z"></path><path d="M13720 4375 c0 -3 4 -13 9 -23 18 -35 31 -69 50 -132 11 -36 43 -130
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
-121 3 c-67 1 -121 0 -121 -3z"></path><path d="M9542 3058 c-102 -11 -182 -76 -213 -174 -6 -21 -15 -97 -18 -169
l-6 -130 -90 -5 c-86 -5 -90 -6 -93 -29 -5 -34 12 -41 106 -41 l82 0 0 -490 0
-490 50 0 50 0 2 488 3 487 125 5 125 5 0 30 0 30 -105 2 c-163 4 -150 -7
-150 132 0 134 15 185 66 232 45 41 86 52 164 47 l70 -5 0 37 0 38 -54 4 c-29
1 -81 0 -114 -4z"></path><path d="M7240 2953 c-123 -20 -240 -104 -289 -208 -32 -68 -30 -213 4 -281
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
132 -66 -1 -131 -4 -145 -6z"></path><path d="M9930 2727 c0 -82 -4 -127 -12 -135 -7 -7 -43 -12 -93 -12 -45 0 -84
-2 -87 -5 -2 -3 -3 -18 0 -35 l4 -29 92 -3 91 -3 5 -415 c5 -454 6 -460 67
-516 45 -41 87 -54 184 -54 l89 0 0 40 0 40 -72 0 c-85 0 -126 20 -155 72 -16
30 -18 67 -18 433 l0 400 118 3 117 3 0 34 0 35 -114 0 c-95 0 -115 3 -120 16
-3 9 -6 69 -6 135 l0 119 -45 0 -45 0 0 -123z"></path><path d="M8390 2576 c-95 -24 -159 -67 -229 -155 -68 -87 -86 -139 -104 -306
-10 -89 -9 -110 10 -201 37 -182 111 -287 248 -355 64 -31 78 -34 181 -37 162
-5 246 27 341 132 55 60 82 107 102 176 7 25 17 59 22 76 5 17 9 84 9 150 0
215 -64 362 -200 456 -99 70 -254 96 -380 64z m242 -83 c96 -37 168 -119 209
-238 21 -60 24 -89 24 -205 0 -126 -2 -140 -30 -213 -22 -57 -45 -95 -83 -138
-71 -78 -117 -98 -235 -101 -81 -3 -98 0 -142 21 -142 71 -215 221 -215 445 0
95 4 126 26 192 14 44 32 86 40 95 8 8 14 19 14 24 0 17 86 88 135 111 63 30
190 33 257 7z"></path><path d="M12310 2576 c-73 -14 -162 -60 -200 -103 -38 -42 -83 -127 -78 -151
2 -13 15 -18 51 -20 49 -3 50 -3 62 51 3 16 26 50 51 77 53 56 120 80 230 80
125 0 216 -64 248 -173 19 -65 21 -198 4 -215 -8 -8 -60 -12 -167 -12 -333 0
-496 -95 -509 -297 -8 -126 41 -209 155 -264 63 -30 70 -31 168 -27 94 3 108
6 180 42 45 22 95 57 120 82 23 24 47 44 53 44 7 0 12 -17 12 -42 0 -24 3 -60
6 -80 l7 -38 54 0 c49 0 54 2 47 18 -4 9 -11 188 -14 397 -7 413 -10 437 -68
515 -32 43 -46 55 -97 82 -85 45 -201 57 -315 34z m378 -644 c3 -121 -6 -148
-79 -221 -59 -59 -139 -100 -222 -112 -84 -12 -140 -2 -195 35 -64 43 -87 86
-86 162 1 107 63 183 185 224 45 16 81 19 224 17 l170 -2 3 -103z"></path><path d="M13410 2574 c-58 -21 -96 -50 -145 -112 -22 -28 -45 -51 -51 -52 -12
0 -24 67 -24 132 l0 39 -42 -3 -43 -3 0 -523 0 -523 49 3 49 3 2 360 c1 198 5
369 9 380 65 167 136 225 284 233 l83 5 -3 36 -4 36 -59 2 c-35 2 -79 -4 -105
-13z"></path><path d="M13995 2576 c-104 -30 -215 -122 -255 -212 -62 -137 -62 -138 -67
-289 -10 -275 79 -442 277 -524 78 -33 216 -40 312 -16 82 20 186 68 195 91 5
14 -14 74 -25 74 -3 0 -28 -15 -56 -34 -28 -18 -73 -39 -101 -46 -66 -17 -223
-24 -249 -12 -12 6 -39 18 -61 27 -51 23 -118 96 -150 162 -24 52 -45 148 -45
210 l0 33 363 2 362 3 -1 95 c-1 91 -23 191 -55 253 -22 42 -80 107 -122 136
-82 56 -220 76 -322 47z m230 -94 c91 -47 152 -147 167 -275 8 -64 7 -81 -4
-88 -7 -5 -144 -9 -304 -9 -222 0 -294 3 -302 13 -12 14 -2 85 25 166 23 71
126 180 193 204 61 23 171 17 225 -11z"></path><path d="M10445 2563 c4 -10 11 -33 16 -50 15 -55 27 -95 44 -153 19 -65 32
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
1 -46 -15z"></path></g></svg></div>
					</div>
					<div class="cs-header-divider"></div>
					<div>
						<div class="cs-business-name">{results.b.name || 'Business Diagnostic'}</div>
						<div class="cs-business-meta">
							{[results.b.trade, results.b.city].filter(Boolean).join(' · ') ||
								'ClearSky Digital Health Diagnostic'}
						</div>
					</div>
				</div>
				<div class="cs-header-right">
					{#if repMode}
						<div class="cs-conf-badge">
							<div class="cs-conf-dot"></div>
							<span>{results.m.diagnosticConfidence || '—'}</span> confidence
							<div class="cs-conf-tooltip">
								<strong>Diagnostic Confidence</strong>
								Score based on data completeness across all 15 inputs. Full API data on all
								layers = higher confidence = narrower range. Confirming inputs with the
								prospect narrows the estimate in real time.
							</div>
						</div>
					{/if}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="cs-rep-toggle" onclick={() => (repMode = !repMode)}>
						<div class="cs-track {repMode ? 'cs-on' : ''}"><div class="cs-thumb"></div></div>
						<span class="cs-toggle-label">REP MODE</span>
					</div>

					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="cs-rep-toggle" onclick={() => (debugMode = !debugMode)}>
						<div class="cs-track {debugMode ? 'cs-on' : ''}"><div class="cs-thumb"></div></div>
						<span class="cs-toggle-label">DEBUG MODE</span>
					</div>
					<button class="cs-close" onclick={handleClose}>✕</button>
				</div>
			</div>

			<div class="cs-gap-banner cs-has-tooltip">
				<div>
					<div class="cs-gap-label">Technical Revenue Gap — shared across all scenarios</div>
					<div class="cs-gap-range">
						<span class="cs-gap-end">{results.tg.display?.low || '—'}</span>
						<span class="cs-gap-sep">—</span>
						<span class="cs-gap-mid">{results.tg.display?.mid || '—'}</span>
						<span class="cs-gap-sep">—</span>
						<span class="cs-gap-end">{results.tg.display?.high || '—'}</span>
					</div>
					<div class="cs-gap-sub">
						best estimate · low — high range · 
						<span class="text-brand-blue font-semibold uppercase text-[10px]">15% Conservative Discount Applied</span>
					</div>
					{#if debugMode}
						<div class="cs-debug-math">
							<strong>BREAKDOWN (Total_Gap = sum * AI_Mult)</strong>
							GBP: ${results.gaps.gbp?.toLocaleString() || 0}
							Rank: ${results.gaps.rank?.toLocaleString() || 0}
							Perf: ${results.gaps.performance?.toLocaleString() || 0}
							Content: ${results.gaps.content?.toLocaleString() || 0}
							Calls: ${results.gaps.missedCalls?.toLocaleString() || 0}
							Social: ${results.gaps.social?.toLocaleString() || 0}
							Paid: ${results.gaps.paid?.toLocaleString() || 0}
							Engagement: ${results.gaps.engagement?.toLocaleString() || 0}
							------------------
							SUM: ${(results.gaps.total / parseFloat(results.m.aiRiskMultiplier || '1')).toLocaleString()}
							AI MULT: {results.m.aiRiskMultiplier}
						</div>
					{/if}
				</div>
				<div>
					<div class="cs-spread-label">±{results.spreadPct}% estimate range</div>
					<div class="cs-spread-track">
						<div class="cs-spread-fill" style="width: {results.fillPct}%"></div>
					</div>
					<div class="cs-spread-sub">{spreadSubLabel(results.spreadPct)}</div>
					{#if debugMode}
						<div class="cs-debug-math">
							<strong>SPREAD (min + 0.25*(1-conf))</strong>
							Min: 0.22 (Session 10)
							Conf: {results.m.diagnosticConfidence}
							Result: {results.m.uncertaintySpread}
						</div>
					{/if}
				</div>
				<div class="cs-tooltip">
					<strong>Technical Revenue Gap</strong>
					The total addressable revenue currently left on the table across all 15 digital layers (SEO, GBP, Site Speed, AI Visibility, etc.). This is the baseline from which all recovery scenarios are calculated.
				</div>
			</div>

			<div class="cs-framing">
				Three scenarios showing <em class="not-italic text-brand-orange font-semibold">what is possible given current demand, supply, and capacity.</em>
				Each range narrows as more inputs are confirmed — it is a planning tool, not a disclaimer.
			</div>

			<div class="cs-scenarios">
				<!-- Scenario 1 -->
				<div class="cs-panel cs-panel-1 cs-has-tooltip">
					<div class="cs-panel-header">
						<div class="cs-panel-num">SCENARIO 01</div>
						<div class="cs-panel-title">Current Reality</div>
						<div class="cs-panel-desc">
							Recovery available today with current digital gaps and current capacity.
						</div>
					</div>
					<div>
						<div class="cs-rev-label">Recoverable Revenue</div>
						<div class="cs-rev-nums">
							<span class="cs-rev-end">{results.sc.current?.display?.low || '—'}</span>
							<span class="cs-rev-sep">–</span>
							<span class="cs-rev-mid">{results.sc.current?.display?.mid || '—'}</span>
							<span class="cs-rev-sep">–</span>
							<span class="cs-rev-end">{results.sc.current?.display?.high || '—'}</span>
						</div>
						<div class="cs-rev-sub">best estimate · low — high</div>
					</div>
					<div class="cs-bar-wrap">
						<div class="cs-bar-track cs-panel-1"></div>
						<div
							class="cs-bar-mid cs-panel-1"
							style="left: {midPct(results.sc.current?.low, results.sc.current?.mid, results.sc.current?.high)}%"
						></div>
					</div>
					<div class="cs-chip">
						{results.sc.current?.captureRate || '—'} <span class="cs-chip-label">capture rate</span>
					</div>
					{#if debugMode}
						<div class="cs-debug-math">
							<strong>CALC (Reality)</strong>
							Gap: ${results.gaps.total?.toLocaleString()}
							Cap_Rate: {results.sc.current?.captureRate}
							Tenure: {results.m.brandTenureModifier}
							------------------
							Result: {results.sc.current?.display?.mid}
						</div>
					{/if}
					<div class="cs-panel-note">
						Based on current personalization score and available capacity.
					</div>
					<div class="cs-tooltip">
						<strong>Current Reality</strong>
						Revenue you could recover <em>immediately</em> with ClearSky using your existing capacity and brand reputation.
					</div>
				</div>

				<!-- Scenario 2 -->
				<div class="cs-panel cs-panel-2 cs-has-tooltip">
					<div class="cs-panel-header">
						<div class="cs-panel-num">SCENARIO 02</div>
						<div class="cs-panel-title">Market Opportunity</div>
						<div class="cs-panel-desc">
							What becomes recoverable as idle capacity fills to the realistic ceiling.
						</div>
					</div>
					<div>
						<div class="cs-rev-label">Recoverable Revenue</div>
						<div class="cs-rev-nums">
							<span class="cs-rev-end">{results.sc.market?.display?.low || '—'}</span>
							<span class="cs-rev-sep">–</span>
							<span class="cs-rev-mid">{results.sc.market?.display?.mid || '—'}</span>
							<span class="cs-rev-sep">–</span>
							<span class="cs-rev-end">{results.sc.market?.display?.high || '—'}</span>
						</div>
						<div class="cs-rev-sub">best estimate · low — high</div>
					</div>
					<div class="cs-bar-wrap">
						<div class="cs-bar-track cs-panel-2"></div>
						<div
							class="cs-bar-mid cs-panel-2"
							style="left: {midPct(results.sc.market?.low, results.sc.market?.mid, results.sc.market?.high)}%"
						></div>
					</div>
					<div class="cs-chip">
						{results.sc.market?.captureRate || '—'} <span class="cs-chip-label">capture rate</span>
					</div>
					{#if debugMode}
						<div class="cs-debug-math">
							<strong>CALC (Market)</strong>
							Gap: ${results.gaps.total?.toLocaleString()}
							Cap_Rate: {results.sc.market?.captureRate}
							Tenure: {results.m.brandTenureModifier}
							Capacity: fills to 85%
							------------------
							Result: {results.sc.market?.display?.mid}
						</div>
					{/if}
					<div class="cs-panel-note">
						ClearSky fills visibility gaps. Business absorbs incoming work at full capacity.
					</div>
					<div class="cs-tooltip">
						<strong>Market Opportunity</strong>
						Revenue available once visibility gaps are closed and idle capacity is filled to the 85% ceiling.
					</div>
				</div>

				<!-- Scenario 3 -->
				<div class="cs-panel cs-panel-3 cs-has-tooltip">
					<div class="cs-panel-header">
						<div class="cs-panel-num">SCENARIO 03</div>
						<div class="cs-panel-title">Full Potential</div>
						<div class="cs-panel-desc">
							What the market can sustain at full personalization and market demand.
						</div>
					</div>
					<div>
						<div class="cs-rev-label">Recoverable Revenue</div>
						<div class="cs-rev-nums">
							<span class="cs-rev-end">{results.sc.potential?.display?.low || '—'}</span>
							<span class="cs-rev-sep">–</span>
							<span class="cs-rev-mid">{results.sc.potential?.display?.mid || '—'}</span>
							<span class="cs-rev-sep">–</span>
							<span class="cs-rev-end">{results.sc.potential?.display?.high || '—'}</span>
						</div>
						<div class="cs-rev-sub">best estimate · low — high</div>
					</div>
					<div class="cs-bar-wrap">
						<div class="cs-bar-track cs-panel-3"></div>
						<div
							class="cs-bar-mid cs-panel-3"
							style="left: {midPct(results.sc.potential?.low, results.sc.potential?.mid, results.sc.potential?.high)}%"
						></div>
					</div>
					<div style="display: flex; align-items: center; flex-wrap: wrap; gap: 0">
						<div class="cs-chip">
							{results.sc.potential?.captureRate || '—'} <span class="cs-chip-label">capture rate</span>
						</div>
						{#if results.sc.potential?.marketMultiplier}<div class="cs-market-badge">
								⊕ {results.sc.potential.marketMultiplier} market
							</div>{/if}
					</div>
					{#if debugMode}
						<div class="cs-debug-math">
							<strong>CALC (Potential)</strong>
							Gap: ${results.gaps.total?.toLocaleString()}
							Cap_Rate: 85% (ceiling)
							Tenure: {results.m.brandTenureModifier}
							Market: {results.m.marketOpportunityMultiplier}
							------------------
							Result: {results.sc.potential?.display?.mid}
						</div>
					{/if}
					<div class="cs-panel-note">{results.s3note}</div>
					<div class="cs-tooltip">
						<strong>Full Potential</strong>
						The theoretical ceiling ClearSky is built to reach using full personalization and market demand capture.
					</div>
				</div>
			</div>

			<div class="cs-audit-section">
				<div class="cs-audit-header">
					<div class="cs-audit-title">Prioritized Action Plan — Recovery Repairs</div>
					{#if results.raw.gbp?.detail?.compositeScore}
						<div class="cs-audit-score">
							<span class="cs-score-label">GBP Health Score</span>
							<span class="cs-score-val">{results.raw.gbp.detail.compositeScore}/100</span>
						</div>
					{/if}
				</div>
				<div class="cs-audit-grid">
					{#if results.raw.gbp?.detail?.repairList?.length > 0}
						{#each results.raw.gbp.detail.repairList.slice(0, 4) as repair (repair.id)}
							<div class="cs-repair-card {repair.priority}">
								<div class="cs-repair-head">
									<span class="cs-repair-signal">{repair.signal}</span>
									<span class="cs-repair-impact">+${repair.impact.toLocaleString()} / mo</span>
								</div>
								<div class="cs-repair-label">{repair.label}</div>
							</div>
						{/each}
						{#if results.raw.gbp.detail.repairList.length > 4}
							<div class="cs-repair-more">
								<div class="cs-point-val">
									<span class="cs-point-label">Point Value</span>
									<span class="cs-point-price">${results.raw.gbp?.detail?.pointValue?.toLocaleString()}/pt</span>
								</div>
								<div class="cs-more-text">+{results.raw.gbp?.detail?.repairList?.length - 4} more improvements identified</div>
							</div>
						{:else}
							<div class="cs-repair-more cs-val-only">
								<div class="cs-point-val">
									<span class="cs-point-label">Point Value</span>
									<span class="cs-point-price">${results.raw.gbp?.detail?.pointValue?.toLocaleString()}/pt</span>
								</div>
							</div>
						{/if}
					{:else}
						<div class="cs-audit-empty">
							<div class="cs-audit-empty-icon">✓</div>
							<div>High-health GBP. Scoring remaining layers...</div>
						</div>
					{/if}
				</div>
			</div>
				<div class="cs-rep-inner">
					<div class="cs-rep-title">Diagnostic Confidence Breakdown — operator view</div>

					{#if Object.keys(results.le).length > 0}
						<div class="cs-error-banner">
							{#each Object.entries(results.le) as [key, err] (key)}
								<div class="cs-error-item">
									<div class="cs-error-icon">!</div>
									<div class="cs-error-text">
										<strong>{(err as any).name || CONF_LABELS[key] || key} FAILURE</strong>
										<div>{(err as any).reason || 'Data layer failed to respond.'}</div>
										<div class="cs-error-reason">{(err as any).error || 'Unknown API error'}</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}

					<div class="cs-conf-grid">
						{#each Object.entries(results.rc.layerConfidence || {}) as [key, val] (key)}
							<div class="cs-conf-cell {confClass(key, val as number, results.le)} cs-has-tooltip">
								<div class="cs-conf-cell-label">{CONF_LABELS[key] || key}</div>
								<div class="cs-conf-cell-val">{confLabel(key, val as number, results.le)}</div>
								<div class="cs-conf-mini">
									<div class="cs-conf-mini-fill" style="width: {(val as number) * 100}%"></div>
								</div>
								{#if debugMode && key === 'gbp'}
									<div class="cs-debug-math">
										<strong>LAYER 1: GBP (9 SIGNALS)</strong>
										Score: {results.raw.gbp?.detail?.compositeScore}/100
										Penalty: {results.raw.gbp?.detail?.appliedPenalty}
										Point Val: ${results.raw.gbp?.detail?.pointValue?.toLocaleString()}/pt
										------------------
										Repairs Found: {results.raw.gbp?.detail?.repairList?.length || 0}
										Total Leak: ${results.gaps.gbp?.toLocaleString()}
									</div>
								{/if}
								<div class="cs-tooltip">
									<strong>{CONF_LABELS[key] || key}</strong>
									{LAYER_DESC[key] || 'Analysis of this digital health layer.'}
								</div>
							</div>
						{/each}
					</div>
					<div class="cs-rep-totals">
						<div>
							<div class="cs-rep-total-label">Overall Confidence</div>
							<div class="cs-rep-total-val">{results.m.diagnosticConfidence || '—'}</div>
						</div>
						<div>
							<div class="cs-rep-total-label">Uncertainty Spread</div>
							<div class="cs-rep-total-val">{results.m.uncertaintySpread || '—'}</div>
						</div>
						<div>
							<div class="cs-rep-total-label">Brand Tenure</div>
							<div class="cs-rep-total-val">
								{results.m.brandTenureLabel || ''}
								{results.m.brandTenureModifier || ''}
							</div>
						</div>
						<div>
							<div class="cs-rep-total-label">Market Multiplier</div>
							<div class="cs-rep-total-val">{results.m.marketOpportunityMultiplier || '—'}</div>
						</div>
						<button
							class="cs-confirm-btn {confirmed ? 'cs-confirmed' : ''}"
							onclick={handleConfirm}
						>
							{confirmed ? 'Inputs confirmed ✓' : 'Confirm inputs with prospect →'}
						</button>
					</div>
				</div>

			<div class="cs-footer">
				<div class="cs-footer-ctx">
					{@html footerCtx(results.m.diagnosticConfidence, results.spreadPct)}
				</div>
				<div class="cs-footer-actions">
					<button class="btn-outline !rounded-lg !px-4 !py-2" onclick={handleClose}
						>Close</button
					>
					<button class="btn-primary !rounded-lg !px-4 !py-2" onclick={() => oncta?.()}
						>Talk to an advisor</button
					>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.cs-modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.5);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 40px 16px;
		overflow-y: auto;
		z-index: 9999;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}
	.cs-modal-overlay.cs-visible {
		opacity: 1;
		pointer-events: all;
	}

	.cs-modal {
		width: 100%;
		max-width: 1020px;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 20px;
		transform: translateY(20px);
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow:
			0 20px 25px -5px rgb(0 0 0 / 0.1),
			0 8px 10px -6px rgb(0 0 0 / 0.1);
	}
	.cs-modal-overlay.cs-visible .cs-modal {
		transform: translateY(0);
	}

	/* ── HEADER ── */
	.cs-header {
		padding: 24px 32px;
		border-bottom: 1px solid #f1f5f9;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: white;
	}
	.cs-header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.cs-header-right {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.cs-logo {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.cs-logo-mark {
		width: 120px;
		height: 120px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-sohne);
		font-weight: 700;
		font-size: 14px;
		color: #fff;
	}
	.cs-logo-text {
		font-family: var(--font-sohne);
		font-size: 16px;
		font-weight: 700;
		color: var(--color-brand-blue);
		letter-spacing: -0.01em;
	}
	.cs-header-divider {
		width: 1px;
		height: 24px;
		background: #e2e8f0;
	}

	.cs-business-name {
		font-family: var(--font-sohne);
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text-dark);
	}
	.cs-business-meta {
		font-size: 12px;
		color: #64748b;
		margin-top: 2px;
		font-family: var(--font-inter);
	}

	.cs-conf-badge {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		font-family: var(--font-inter);
		font-size: 11px;
		color: #64748b;
		cursor: default;
		position: relative;
	}
	.cs-conf-badge:hover .cs-conf-tooltip {
		opacity: 1;
		pointer-events: all;
	}
	.cs-conf-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #10b981;
		box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
		animation: cs-pulse 2s ease-in-out infinite;
	}
	@keyframes cs-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}
	.cs-conf-tooltip {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		width: 260px;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 16px;
		font-family: var(--font-inter);
		font-size: 12px;
		line-height: 1.6;
		color: #64748b;
		opacity: 0;
		pointer-events: none;
		transition: all 0.2s;
		z-index: 10;
		box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
		text-align: left;
	}
	.cs-conf-tooltip strong {
		color: var(--color-text-dark);
		display: block;
		margin-bottom: 6px;
	}

	.cs-has-tooltip {
		position: relative;
		cursor: help;
	}
	.cs-has-tooltip:hover .cs-tooltip {
		opacity: 1;
		pointer-events: all;
		transform: translateX(-50%) translateY(0);
	}
	.cs-tooltip {
		position: absolute;
		bottom: calc(100% + 12px);
		left: 50%;
		transform: translateX(-50%) translateY(4px);
		width: 260px;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 16px;
		font-family: var(--font-inter);
		font-size: 13px;
		line-height: 1.5;
		color: #475569;
		opacity: 0;
		pointer-events: none;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		z-index: 100;
		box-shadow: 0 15px 30px -5px rgba(15, 23, 42, 0.15);
		text-align: left;
	}
	.cs-tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -8px;
		border-width: 8px;
		border-style: solid;
		border-color: white transparent transparent transparent;
		filter: drop-shadow(0 2px 1px rgba(0,0,0,0.05));
	}
	.cs-tooltip::before {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -9px;
		border-width: 9px;
		border-style: solid;
		border-color: #e2e8f0 transparent transparent transparent;
	}
	.cs-tooltip strong {
		color: var(--color-text-dark);
		display: block;
		margin-bottom: 6px;
		font-size: 14px;
	}

	/* Specific placements to avoid clipping */
	.cs-panel-1.cs-has-tooltip:hover .cs-tooltip {
		left: 0;
		transform: translateY(0);
	}
	.cs-panel-1 .cs-tooltip {
		left: 0;
		transform: translateY(4px);
	}
	.cs-panel-1 .cs-tooltip::after, .cs-panel-1 .cs-tooltip::before {
		left: 24px;
	}
	.cs-panel-3.cs-has-tooltip:hover .cs-tooltip {
		left: auto;
		right: 0;
		transform: translateY(0);
	}
	.cs-panel-3 .cs-tooltip {
		left: auto;
		right: 0;
		transform: translateY(4px);
	}
	.cs-panel-3 .cs-tooltip::after, .cs-panel-3 .cs-tooltip::before {
		left: auto;
		right: 24px;
	}
	.cs-gap-banner.cs-has-tooltip .cs-tooltip {
		top: calc(100% + 8px);
		bottom: auto;
		left: 32px;
		transform: translateY(-4px);
	}
	.cs-gap-banner.cs-has-tooltip:hover .cs-tooltip {
		transform: translateY(0);
	}
	.cs-gap-banner.cs-has-tooltip .cs-tooltip::after, .cs-gap-banner.cs-has-tooltip .cs-tooltip::before {
		top: auto;
		bottom: 100%;
		border-color: transparent transparent white transparent;
	}
	.cs-gap-banner.cs-has-tooltip .cs-tooltip::before {
		border-color: transparent transparent #e2e8f0 transparent;
	}

	.cs-rep-toggle {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		padding: 6px 12px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		user-select: none;
		transition: all 0.2s;
	}
	.cs-rep-toggle:hover {
		border-color: #cbd5e1;
		background: #f1f5f9;
	}
	.cs-track {
		width: 32px;
		height: 18px;
		border-radius: 10px;
		background: #cbd5e1;
		position: relative;
		transition: background 0.2s;
		flex-shrink: 0;
	}
	.cs-track.cs-on {
		background: var(--color-brand-orange);
	}
	.cs-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: #fff;
		transition: transform 0.2s;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}
	.cs-track.cs-on .cs-thumb {
		transform: translateX(14px);
	}
	.cs-toggle-label {
		font-size: 11px;
		font-weight: 600;
		color: #64748b;
		font-family: var(--font-inter);
		letter-spacing: 0.05em;
	}

	.cs-close {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		background: transparent;
		color: #64748b;
		cursor: pointer;
		font-size: 14px;
		transition: all 0.2s;
	}
	.cs-close:hover {
		border-color: #cbd5e1;
		color: var(--color-text-dark);
		background: #f8fafc;
	}

	/* ── GAP BANNER ── */
	.cs-gap-banner {
		padding: 32px;
		background: var(--color-brand-blue-light);
		border-bottom: 1px solid #e2e8f0;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 40px;
	}
	.cs-gap-label {
		font-family: var(--font-inter);
		font-size: 11px;
		font-weight: 700;
		color: var(--color-brand-blue);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		margin-bottom: 8px;
		text-align: left;
	}
	.cs-gap-range {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}
	.cs-gap-end {
		font-family: var(--font-sohne);
		font-size: 20px;
		color: #64748b;
		font-weight: 400;
	}
	.cs-gap-sep {
		font-family: var(--font-inter);
		font-size: 16px;
		color: #94a3b8;
	}
	.cs-gap-mid {
		font-family: var(--font-sohne);
		font-size: 48px;
		font-weight: 700;
		color: var(--color-brand-orange);
		letter-spacing: -0.02em;
		line-height: 1;
	}
	.cs-gap-sub {
		font-family: var(--font-inter);
		font-size: 12px;
		color: #64748b;
		margin-top: 6px;
		text-align: left;
	}
	.cs-spread-label {
		font-family: var(--font-inter);
		font-size: 12px;
		font-weight: 600;
		color: var(--color-text-dark);
		margin-bottom: 6px;
		text-align: right;
	}
	.cs-spread-track {
		width: 160px;
		height: 6px;
		background: #e2e8f0;
		border-radius: 3px;
		overflow: hidden;
		margin-left: auto;
	}
	.cs-spread-fill {
		height: 100%;
		border-radius: 3px;
		background: var(--color-brand-orange);
		transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.cs-spread-sub {
		font-family: var(--font-inter);
		font-size: 11px;
		color: #64748b;
		margin-top: 6px;
		text-align: right;
	}

	/* ── FRAMING STRIP ── */
	.cs-framing {
		padding: 14px 32px;
		background: #f8fafc;
		border-bottom: 1px solid #e2e8f0;
		font-size: 13px;
		color: #64748b;
		line-height: 1.6;
		font-family: var(--font-inter);
		text-align: left;
	}

	/* ── SCENARIO GRID ── */
	.cs-scenarios {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-bottom: 1px solid #e2e8f0;
	}

	.cs-panel {
		padding: 32px;
		border-right: 1px solid #f1f5f9;
		position: relative;
		text-align: left;
		background: white;
	}
	.cs-panel:last-child {
		border-right: none;
	}

	.cs-panel::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
	}
	.cs-panel-1::before {
		background: #94a3b8;
	}
	.cs-panel-2::before {
		background: var(--color-brand-blue);
	}
	.cs-panel-3::before {
		background: var(--color-brand-orange);
	}

	.cs-panel-num {
		font-family: var(--font-inter);
		font-size: 10px;
		font-weight: 700;
		color: #94a3b8;
		letter-spacing: 0.1em;
		margin-bottom: 6px;
	}
	.cs-panel-title {
		font-family: var(--font-sohne);
		font-size: 18px;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--color-text-dark);
	}
	.cs-panel-desc {
		font-size: 13px;
		color: #64748b;
		line-height: 1.6;
		margin-top: 8px;
	}
	.cs-panel-header {
		margin-bottom: 24px;
	}

	.cs-rev-label {
		font-family: var(--font-inter);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #94a3b8;
		margin-bottom: 8px;
	}
	.cs-rev-nums {
		display: flex;
		align-items: baseline;
		gap: 8px;
		flex-wrap: wrap;
	}
	.cs-rev-end {
		font-family: var(--font-sohne);
		font-size: 16px;
		color: #94a3b8;
		font-weight: 400;
	}
	.cs-rev-sep {
		font-size: 14px;
		color: #cbd5e1;
	}
	.cs-rev-mid {
		font-family: var(--font-sohne);
		font-size: 32px;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1;
		color: var(--color-text-dark);
	}
	.cs-panel-2 .cs-rev-mid {
		color: var(--color-brand-blue);
	}
	.cs-panel-3 .cs-rev-mid {
		color: var(--color-brand-orange);
	}
	.cs-rev-sub {
		font-family: var(--font-inter);
		font-size: 11px;
		color: #94a3b8;
		margin-top: 6px;
	}

	/* range bar */
	.cs-bar-wrap {
		height: 6px;
		background: #f1f5f9;
		border-radius: 3px;
		position: relative;
		overflow: visible;
		margin: 16px 0 20px;
	}
	.cs-bar-track {
		position: absolute;
		height: 100%;
		width: 100%;
		border-radius: 3px;
		opacity: 0.2;
		top: 0;
		left: 0;
	}
	.cs-panel-1 .cs-bar-track {
		background: #94a3b8;
	}
	.cs-panel-2 .cs-bar-track {
		background: var(--color-brand-blue);
	}
	.cs-panel-3 .cs-bar-track {
		background: var(--color-brand-orange);
	}
	.cs-bar-mid {
		position: absolute;
		width: 4px;
		height: 12px;
		border-radius: 2px;
		top: -3px;
		transform: translateX(-50%);
	}
	.cs-panel-1 .cs-bar-mid {
		background: #94a3b8;
	}
	.cs-panel-2 .cs-bar-mid {
		background: var(--color-brand-blue);
	}
	.cs-panel-3 .cs-bar-mid {
		background: var(--color-brand-orange);
	}

	/* capture chip */
	.cs-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: 6px;
		background: #f8fafc;
		border: 1px solid #f1f5f9;
		font-family: var(--font-inter);
		font-size: 12px;
		font-weight: 700;
		color: var(--color-text-dark);
	}
	.cs-chip-label {
		color: #94a3b8;
		font-weight: 500;
		font-size: 11px;
	}

	/* market badge (s3) */
	.cs-market-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		margin-left: 8px;
		background: var(--color-brand-orange-light);
		border: 1px solid var(--color-brand-orange);
		border-radius: 6px;
		font-family: var(--font-inter);
		font-size: 11px;
		font-weight: 700;
		color: white;
	}
	.cs-panel-note {
		font-size: 12px;
		color: #94a3b8;
		margin-top: 12px;
		line-height: 1.5;
	}

	/* ── REP PANEL ── */
	.cs-rep-panel {
		border-top: 1px solid #f1f5f9;
		background: #f8fafc;
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.cs-rep-panel.cs-open {
		max-height: 1200px;
		animation: cs-allow-overflow 0.01s forwards 0.4s;
	}
	@keyframes cs-allow-overflow {
		from { overflow: hidden; }
		to { overflow: visible; }
	}
	.cs-rep-inner {
		padding: 32px;
		text-align: left;
	}
	.cs-rep-title {
		font-family: var(--font-inter);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #64748b;
		margin-bottom: 20px;
	}
	.cs-conf-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 12px;
	}
	.cs-conf-cell {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 16px;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		cursor: default;
		box-shadow: 0 1px 2px rgba(0,0,0,0.05);
	}
	.cs-conf-cell:hover {
		border-color: #cbd5e1;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
	}
	.cs-conf-cell-label {
		font-family: var(--font-inter);
		font-size: 10px;
		font-weight: 700;
		color: #94a3b8;
		letter-spacing: 0.05em;
		margin-bottom: 6px;
		text-transform: uppercase;
	}
	.cs-conf-cell-val {
		font-family: var(--font-inter);
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text-dark);
	}
	.cs-conf-full .cs-conf-cell-val {
		color: #10b981;
	}
	.cs-conf-partial .cs-conf-cell-val {
		color: #f59e0b;
	}
	.cs-conf-default .cs-conf-cell-val {
		color: #ef4444;
	}
	.cs-conf-mini {
		height: 4px;
		border-radius: 2px;
		margin-top: 12px;
		background: #f1f5f9;
		overflow: hidden;
	}
	.cs-conf-mini-fill {
		height: 100%;
		border-radius: 2px;
	}
	.cs-conf-full .cs-conf-mini-fill {
		background: #10b981;
	}
	.cs-conf-partial .cs-conf-mini-fill {
		background: #f59e0b;
	}
	.cs-conf-default .cs-conf-mini-fill {
		background: #ef4444;
	}
	.cs-conf-error .cs-conf-mini-fill {
		background: #dc2626;
	}
	.cs-conf-error {
		border-color: #fecaca !important;
		background: #fff1f2 !important;
	}
	.cs-conf-error .cs-conf-cell-val {
		color: #dc2626;
	}

	.cs-error-banner {
		background: #fff1f2;
		border: 1px solid #fecaca;
		border-radius: 10px;
		padding: 16px;
		margin-bottom: 24px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.cs-error-item {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		font-size: 13px;
	}
	.cs-error-icon {
		color: #dc2626;
		font-weight: 700;
		font-family: var(--font-inter);
		font-size: 16px;
		line-height: 1;
		margin-top: 2px;
	}
	.cs-error-text {
		color: var(--color-text-dark);
		line-height: 1.5;
	}
	.cs-error-text strong {
		color: #dc2626;
		text-transform: uppercase;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.05em;
		display: inline-block;
		margin-right: 8px;
	}
	.cs-error-reason {
		color: #64748b;
		font-size: 12px;
		margin-top: 4px;
	}

	.cs-rep-totals {
		display: flex;
		align-items: center;
		gap: 32px;
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid #e2e8f0;
		flex-wrap: wrap;
	}
	.cs-rep-total-label {
		font-family: var(--font-inter);
		font-size: 10px;
		font-weight: 700;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.cs-rep-total-val {
		font-family: var(--font-sohne);
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text-dark);
		margin-top: 4px;
	}
	.cs-confirm-btn {
		margin-left: auto;
		padding: 10px 20px;
		background: white;
		border: 1px solid var(--color-brand-blue);
		border-radius: 10px;
		font-family: var(--font-inter);
		font-size: 12px;
		font-weight: 700;
		color: var(--color-brand-blue);
		cursor: pointer;
		transition: all 0.2s;
	}
	.cs-confirm-btn:hover {
		background: var(--color-brand-blue);
		color: white;
	}
	.cs-confirm-btn.cs-confirmed {
		color: #10b981;
		border-color: #10b981;
		background: #ecfdf5;
	}

	/* ── FOOTER ── */
	.cs-footer {
		padding: 24px 32px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 32px;
		background: white;
		border-top: 1px solid #f1f5f9;
	}
	.cs-footer-ctx {
		font-size: 13px;
		color: #64748b;
		line-height: 1.6;
		max-width: 520px;
		text-align: left;
	}
	.cs-footer-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.cs-modal-overlay {
			padding: 0;
			align-items: flex-start;
		}
		.cs-modal {
			border-radius: 0;
			border: none;
			min-height: 100dvh;
		}
		.cs-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 16px;
			padding: 20px 16px;
		}
		.cs-header-left {
			width: 100%;
			gap: 12px;
		}
		.cs-header-right {
			width: 100%;
			gap: 12px;
			justify-content: space-between;
		}
		.cs-toggle-label {
			display: none;
		}
		.cs-close {
			margin-left: auto;
		}
		.cs-gap-banner {
			grid-template-columns: 1fr;
			gap: 24px;
			padding: 24px 16px;
		}
		.cs-gap-mid {
			font-size: 36px;
		}
		.cs-gap-end {
			font-size: 18px;
		}
		.cs-spread-label {
			text-align: left;
		}
		.cs-spread-track {
			width: 100%;
			margin-left: 0;
		}
		.cs-spread-sub {
			text-align: left;
		}
		.cs-framing {
			padding: 16px;
			font-size: 12px;
		}
		.cs-scenarios {
			grid-template-columns: 1fr;
		}
		.cs-panel {
			border-right: none;
			border-bottom: 1px solid #f1f5f9;
			padding: 24px 16px;
		}
		.cs-panel:last-child {
			border-bottom: none;
		}
		.cs-rev-mid {
			font-size: 28px;
		}
		.cs-rep-inner {
			padding: 24px 16px;
		}
		.cs-conf-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 8px;
		}
		.cs-rep-totals {
			gap: 16px;
		}
		.cs-confirm-btn {
			width: 100%;
			margin-top: 12px;
			text-align: center;
		}
		.cs-footer {
			flex-direction: column;
			align-items: stretch;
			gap: 20px;
			padding: 24px 16px;
		}
		.cs-footer-actions {
			width: 100%;
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 12px;
		}
	}

	/* ── AUDIT SECTION ── */
	.cs-audit-section {
		padding: 24px 32px;
		background: #fcfcfd;
		border-top: 1px solid #f1f5f9;
		text-align: left;
	}
	.cs-audit-title {
		font-family: var(--font-inter);
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #94a3b8;
		margin-bottom: 20px;
	}
	.cs-audit-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 12px;
	}
	.cs-repair-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		position: relative;
		overflow: hidden;
		transition: all 0.2s;
	}
	.cs-repair-card::before {
		content: '';
		position: absolute;
		left: 0; top: 0; bottom: 0;
		width: 3px;
	}
	.cs-repair-card.high::before { background: #ef4444; }
	.cs-repair-card.medium::before { background: #f59e0b; }
	.cs-repair-card.low::before { background: #10b981; }

	.cs-repair-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.cs-repair-signal {
		font-size: 10px;
		font-weight: 700;
		color: #64748b;
		text-transform: uppercase;
	}
	.cs-repair-impact {
		font-size: 11px;
		font-weight: 700;
		color: #10b981;
	}
	.cs-repair-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text-dark);
		line-height: 1.4;
	}
	.cs-repair-more {
		background: #f8fafc;
		border: 1px dashed #cbd5e1;
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 4px;
	}
	.cs-point-val {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.cs-point-label {
		font-size: 9px;
		font-weight: 700;
		color: #94a3b8;
		text-transform: uppercase;
	}
	.cs-point-price {
		font-size: 16px;
		font-weight: 800;
		color: var(--color-brand-blue);
	}
	.cs-more-text {
		font-size: 11px;
		color: #64748b;
		text-align: center;
	}
	.cs-audit-empty {
		grid-column: span 5;
		padding: 40px;
		background: #ecfdf5;
		border: 1px dashed #10b981;
		border-radius: 16px;
		color: #065f46;
		font-size: 14px;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
	}
	.cs-audit-empty-icon {
		width: 24px;
		height: 24px;
		background: #10b981;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
	}

	.cs-debug-math {
		background: #0f172a;
		color: #10b981;
		font-family: 'Courier New', Courier, monospace;
		font-size: 9px;
		padding: 8px;
		border-radius: 6px;
		border: 1px solid #10b981;
		white-space: pre-wrap;
		line-height: 1.4;
		box-shadow: 0 4px 12px rgba(0,0,0,0.3);
		margin-top: 8px;
		text-align: left;
	}
</style>
