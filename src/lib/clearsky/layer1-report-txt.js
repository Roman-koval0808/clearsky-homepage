/**
 * Build human-readable .txt report for Layer 1 diagnostic run.
 */

import { formatCurrency } from './clearsky-engine.js';

/** @param {...string} parts */
function line(...parts) {
	return parts.join('');
}

/** @param {string} url */
function redactGoogleKey(url) {
	if (typeof url !== 'string') return url;
	return url.replace(/key=[^&]+/g, 'key=REDACTED');
}

/** @param {string} title */
function section(title) {
	return `\n${'═'.repeat(72)}\n${title}\n${'─'.repeat(72)}\n`;
}

/** @param {unknown} obj */
function fmtJson(obj) {
	try {
		return JSON.stringify(obj, null, 2);
	} catch {
		return String(obj);
	}
}

/** @param {number} n @param {number} [d] */
function fmtDec(n, d = 6) {
	if (typeof n !== 'number' || Number.isNaN(n)) return String(n);
	return n.toFixed(d);
}

/**
 * @param {string[]} lines
 * @param {unknown} gd
 * @param {number} mapPackPosition
 */
function appendGapDerivationLines(lines, gd, mapPackPosition) {
	if (!gd || typeof gd !== 'object') {
		lines.push('(Step-by-step engine derivation not available.)\n');
		return;
	}
	const gdo = /** @type {Record<string, unknown>} */ (gd);
	const ctr = /** @type {Record<string, number>} */ (gdo.ctr ?? {});
	const rev = /** @type {Record<string, number>} */ (gdo.revenue ?? {});

	lines.push('CTR (locked benchmarks):\n');
	lines.push(`  positionOneCTR = ${ctr.positionOneCTR}\n`);
	lines.push(
		`  mapPackPosition = ${mapPackPosition} → mapPackCTR[position] = ${fmtDec(ctr.positionCTR, 4)}\n`
	);
	lines.push(`  minCtrGapFloor = ${ctr.minCtrFloor}\n`);
	lines.push(
		`  ctrGap = max(positionOneCTR − mapPackCTR, floor) = max(${ctr.positionOneCTR} − ${fmtDec(ctr.positionCTR, 4)}, ${ctr.minCtrFloor}) = ${fmtDec(ctr.ctrGap, 4)}\n`
	);
	lines.push('\n');

	if (gdo.branch === 'no_listing') {
		const g = /** @type {Record<string, number>} */ (gdo.gbp ?? {});
		lines.push('GBP: listing treated as missing — fixed no-listing penalty applied.\n');
		lines.push(`  noListingPenalty = ${g.noListingPenalty}\n`);
		lines.push(`  throughput = 1 − penalty = ${fmtDec(g.throughput, 4)}\n`);
	} else {
		const g = /** @type {Record<string, number>} */ (gdo.gbp ?? {});
		lines.push('GBP composite score → penalty → throughput:\n');
		lines.push(`  compositeScore (sum of 9 signals, cap 100) = ${g.compositeScore}\n`);
		lines.push(`  rawPenalty = (100 − composite) / 100 = ${fmtDec(g.compositePenaltyRaw, 4)}\n`);
		lines.push(`  appliedPenalty = min(rawPenalty, maxPenaltyCap=${g.maxPenaltyCap}) = ${fmtDec(g.appliedPenalty, 4)}\n`);
		lines.push(`  throughput = 1 − appliedPenalty = ${fmtDec(g.throughput, 4)}\n`);
	}

	lines.push('\n');
	lines.push('Demand → revenue (annual base gap, before market modifiers):\n');
	lines.push(
		'  monthlyCustomers = scaledMonthlySearches × ctrGap × throughput × siteRetention × callToPurchaseRate\n'
	);
	lines.push(`    = ${fmtDec(/** @type {number} */ (rev.monthlyCustomers), 6)} customers / mo\n`);
	lines.push('  monthlyRevenue = monthlyCustomers × avgSaleValue\n');
	lines.push(
		`    = ${fmtDec(/** @type {number} */ (rev.monthlyRevenue), 2)} / mo\n`
	);
	lines.push(`  annualGap (unrounded) = monthlyRevenue × 12 = ${fmtDec(/** @type {number} */ (rev.annualGapUnrounded), 2)}\n`);
	lines.push(`  annualGap (rounded)   = calcGbpGap base (engine output) = ${rev.annualGapRounded}\n`);
	lines.push('\n');
	lines.push('Inputs in this chain:\n');
	lines.push(`  scaledMonthlySearches = ${rev.scaledMonthlySearches}\n`);
	lines.push(`  siteRetentionRate (PSI band) = ${rev.siteRetentionRate}\n`);
	lines.push(`  callToPurchaseRate (locked) = ${rev.callToPurchaseRate}\n`);
	lines.push(`  avgSaleValue (your input)     = ${rev.avgSaleValue}\n`);
}

/**
 * @param {{
 *   generatedAt: string,
 *   inputs: Record<string, unknown>,
 *   indexPack: { keywords: Array<{ keyword: string, volume: number }>, indexLocationCode: number, indexMarketName: string, source: string },
 *   households: number,
 *   sudburyHouseholds: number,
 *   cityScale: number,
 *   scaledMonthlySearches: number,
 *   mapPackPosition: number,
 *   siteRetentionRate: number,
 *   avgSaleValue: number,
 *   yearsInBusiness: number,
 *   marketTier: string,
 *   baseGap: number,
 *   adjustedGap: number,
 *   finalGap: number,
 *   ultraConservativeDiscount: number,
 *   modifierDerivation: Record<string, unknown>,
 *   calcGbpResult: Record<string, unknown>,
 *   calls: Array<{ at: string, source: string, label: string, request?: unknown, response?: unknown, note?: string }>
 * }} p
 */
export function buildLayer1ReportTxt(p) {
	const lines = [];

	lines.push('Clearsky — Layer 1 GBP Diagnostic Report');
	lines.push(`Generated (UTC): ${p.generatedAt}`);
	lines.push('');

	lines.push(section('FORMULAS (reference — Session 18)'));
	lines.push(
		[
			'1) Index-market search volumes come from DataForSEO Google Ads search_volume/live',
			'   at the Sudbury index geo. Keywords are the locked trade set (5 terms).',
			'',
			'2) City scaling (D.5):',
			'   scaledMonthlySearches = SUM over keywords ( indexVolume × (cityHouseholds ÷ 73,000) × 1.20 )',
			'   — 73,000 = reference households (Sudbury cluster). 1.20 = captive market uplift.',
			'',
			'3) GBP gap (calcGbpGap):',
			'   monthlyCustomers = scaledMonthlySearches × ctrGap × (1 − GBP penalty) × siteRetention × callRate',
			'   annualGap = monthlyCustomers × avgSale × 12',
			'   — ctrGap = max(positionOneCTR − mapPackCTR[position], 0.1)  [0.1 = minimum gap floor]',
			'   — GBP penalty = min((100 − compositeScore) / 100, 0.85); throughput = 1 − penalty',
			'   — callRate = 0.10 (call-to-purchase). siteRetention from PSI bands.',
			'',
			'4) Modifiers after base gap:',
			'   adjusted = base + base×tenureRate + base×economicRate  (city tier from lookup)',
			'   finalGap = adjusted × 0.85  (ultra-conservative discount)',
			''
		].join('\n')
	);

	lines.push(section('INPUTS YOU PROVIDED'));
	lines.push(fmtJson(p.inputs));

	lines.push(section('PART A — Search volume & scaling'));
	lines.push(
		line(
			'Index market: ',
			String(p.indexPack.indexMarketName),
			'  location_code=',
			String(p.indexPack.indexLocationCode),
			'  source=',
			String(p.indexPack.source),
			'\n'
		)
	);
	lines.push('Per-keyword index volumes (from API):\n');
	for (const row of p.indexPack.keywords) {
		lines.push(`  • ${row.keyword}: ${row.volume} /mo\n`);
	}
	lines.push('\n');
	lines.push(`City households (MARKET_CLUSTERS / default): ${p.households}\n`);
	lines.push(`Reference (Sudbury) households: ${p.sudburyHouseholds}\n`);
	lines.push(`City scale (households ÷ reference): ${p.cityScale.toFixed(6)}\n`);
	lines.push(`Captive uplift: 1.20\n`);
	lines.push(`Scaled monthly searches (summed, after uplift): ${p.scaledMonthlySearches}\n`);
	lines.push(
		`\nExplanation: Each keyword volume is scaled to the prospect city, then summed. This total feeds calcGbpGap.\n`
	);

	lines.push(section('PART B — Google Business Profile (composite score)'));
	const signals = Array.isArray(p.calcGbpResult?.signals) ? p.calcGbpResult.signals : [];
	if (signals.length) {
		lines.push(`Composite score: ${p.calcGbpResult.compositeScore ?? '—'} / 100\n`);
		lines.push(`Applied GBP penalty (capped at 0.85): ${p.calcGbpResult.appliedPenalty ?? '—'}\n`);
		lines.push('Signal breakdown (earned / max):\n');
		for (const sig of signals) {
			lines.push(`  • ${sig.name}: ${sig.earned} / ${sig.max}\n`);
		}
	} else {
		lines.push('No signal array in result.\n');
	}
	lines.push(
		`\nExplanation: Composite score is the sum of 9 weighted GBP signals. Penalty reduces effective demand (throughput).\n`
	);

	lines.push(section('PART C — Engine: CTR, GBP throughput, base annual gap'));
	lines.push(`Map pack position (input or default 1): ${p.mapPackPosition}\n`);
	lines.push(`PSI → site retention rate: ${p.siteRetentionRate}\n`);
	lines.push(`Average job value (input): ${p.avgSaleValue}\n`);
	lines.push(`Years in business (input): ${p.yearsInBusiness}\n`);
	lines.push('\n');
	appendGapDerivationLines(lines, p.calcGbpResult?.gapDerivation, p.mapPackPosition);
	lines.push(`\nBase annual gap (engine output, same as PART C total): ${p.baseGap}\n`);

	lines.push(section('PART D — Tenure + economic modifiers → adjusted gap'));
	lines.push(`Market tier key (city lookup): ${p.marketTier}\n`);
	const md = p.modifierDerivation;
	if (md && typeof md === 'object') {
		lines.push('Session 18 formula: adjusted = round(base + base×tenureRate + base×economicRate)\n\n');
		lines.push(`  base (from PART C) = ${md.baseValue}\n`);
		lines.push(
			`  tenure: band "${md.tenureBandLabel}" → rate ${md.tenureRate} → lift = ${md.baseValue} × ${md.tenureRate} = ${fmtDec(/** @type {number} */ (md.tenureLift), 2)}\n`
		);
		lines.push(
			`  economic: tier "${md.economicTierLabel}" (${md.economicTierKey}) → rate ${md.ecoRate} → lift = ${md.baseValue} × ${md.ecoRate} = ${fmtDec(/** @type {number} */ (md.ecoLift), 2)}\n`
		);
		lines.push(`  ${md.formulaText}\n`);
		lines.push(`\nAdjusted annual gap (after modifiers): ${p.adjustedGap}\n`);
	} else {
		lines.push(`Adjusted annual gap: ${p.adjustedGap}\n`);
	}

	lines.push(section('PART E — Ultra-conservative discount (display number)'));
	lines.push(
		`finalGap = round(adjustedGap × ultraConservativeDiscount) = round(${p.adjustedGap} × ${p.ultraConservativeDiscount})\n`
	);
	lines.push(`  = ${p.finalGap}\n`);
	lines.push(
		`\nThis is the number shown as "Estimated annual gap" on the results screen (${formatCurrency(p.finalGap)}).\n`
	);

	lines.push(section('FINAL GAP — additive verification (must match PART D + E)'));
	if (md && typeof md === 'object') {
		const b = /** @type {number} */ (md.baseValue);
		const t = /** @type {number} */ (md.tenureLift);
		const e = /** @type {number} */ (md.ecoLift);
		const preRound = b + t + e;
		lines.push('Modifiers chain (Session 18):\n');
		lines.push(`  base + tenureLift + ecoLift = ${b} + ${fmtDec(t, 2)} + ${fmtDec(e, 2)} = ${fmtDec(preRound, 2)}\n`);
		lines.push(`  round(…) = adjustedGap → ${p.adjustedGap}  ${Math.round(preRound) === p.adjustedGap ? '(OK)' : '(check rounding)'}\n`);
		lines.push(`  round(adjustedGap × ${p.ultraConservativeDiscount}) = round(${p.adjustedGap} × ${p.ultraConservativeDiscount}) = ${p.finalGap}\n`);
	} else {
		lines.push(`  adjustedGap = ${p.adjustedGap}\n`);
		lines.push(`  finalGap = round(${p.adjustedGap} × ${p.ultraConservativeDiscount}) = ${p.finalGap}\n`);
	}

	lines.push(section('API CALL LOG (requests & responses)'));
	lines.push(
		'Authorization headers are omitted. Google Maps URLs have key=REDACTED.\n\n'
	);
	for (const c of p.calls || []) {
		lines.push(`--- ${c.at} | ${c.source} | ${c.label} ---\n`);
		if (c.note) lines.push(`Note: ${c.note}\n`);
		if (c.request !== undefined) {
			const raw = c.request;
			const req =
				raw && typeof raw === 'object' && 'url' in raw && typeof raw.url === 'string'
					? { ...raw, url: redactGoogleKey(raw.url) }
					: raw;
			lines.push('REQUEST:\n');
			lines.push(typeof req === 'string' ? req : fmtJson(req));
			lines.push('\n');
		}
		if (c.response !== undefined) {
			lines.push('RESPONSE (summary / JSON):\n');
			lines.push(fmtJson(c.response));
			lines.push('\n');
		}
		lines.push('\n');
	}

	lines.push(section('FINAL RESULT (summary)'));
	lines.push(`Estimated annual GBP gap (display): ${formatCurrency(p.finalGap)} (${p.finalGap})\n`);
	lines.push(
		'\nTrace: scaled searches (PART A) → engine base gap (PART C) → tenure/economic (PART D) → × conservative discount (PART E).\n'
	);
	lines.push('\nOne-line chain (same numbers as PART D–E):\n');
	if (md && typeof md === 'object') {
		lines.push(
			`  finalGap = round( adjustedGap × ${p.ultraConservativeDiscount} ) = round( ${p.adjustedGap} × ${p.ultraConservativeDiscount} ) = ${p.finalGap}\n`
		);
		lines.push(
			`  adjustedGap = round( base + tenureLift + ecoLift ) = round( ${md.baseValue} + ${fmtDec(/** @type {number} */ (md.tenureLift), 2)} + ${fmtDec(/** @type {number} */ (md.ecoLift), 2)} )\n`
		);
	} else {
		lines.push(`  finalGap = round(${p.adjustedGap} × ${p.ultraConservativeDiscount}) = ${p.finalGap}\n`);
	}
	lines.push('\nEnd of report.\n');

	return lines.join('');
}
