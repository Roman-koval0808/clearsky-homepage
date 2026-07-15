/**
 * Build human-readable .txt report for Layer 2 (local rank gap) diagnostic run.
 */

import { formatCurrency, BENCHMARKS } from './clearsky-engine.js';

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

/** @param {string} url */
function redactGoogleKey(url) {
	if (typeof url !== 'string') return url;
	return url.replace(/key=[^&]+/g, 'key=REDACTED');
}

/**
 * @param {{
 *   generatedAt: string,
 *   inputs: Record<string, unknown>,
 *   households: number,
 *   city: string,
 *   siteRetentionRate: number,
 *   performanceScore: number,
 *   layer1GbpGapValue: number,
 *   weightedRankResult: Record<string, unknown>,
 *   finalLayer2Gap: number,
 *   metrics: Record<string, unknown>,
 *   calls: Array<{ at: string, source: string, label: string, request?: unknown, response?: unknown, note?: string }>
 * }} p
 */
export function buildLayer2ReportTxt(p) {
	const lines = [];
	const wr = p.weightedRankResult;
	const detail = wr && typeof wr === 'object' && 'detail' in wr ? /** @type {Record<string, unknown>} */ (wr).detail : {};
	const tradeBreakdown = Array.isArray(detail.tradeBreakdown) ? detail.tradeBreakdown : [];

	lines.push('Clearsky — Layer 2 Local Rank Gap Diagnostic Report');
	lines.push(`Generated (UTC): ${p.generatedAt}`);
	lines.push('');

	lines.push(section('DATA SOURCES (dynamic)'));
	lines.push(
		[
			'• Google Places (light): business identity, rating, reviews, CID for downstream lookups.',
			'• DataForSEO: resolveGoogleAdsLocationCode(city) + fetchIndexMarketKeywordVolumes(trade) for live search volumes per locked keyword.',
			'• DataForSEO: Q&A + business info per trade; SERP google/organic/live/advanced for Map Pack / organic positions.',
			'• Google PageSpeed Insights: performance score → site retention (same PSI bands as Layer 1).',
			`• Households: MARKET_CLUSTERS lookup for "${p.city}" → ${p.households} (same as Layer 1 scaling).`,
			''
		].join('\n')
	);

	lines.push(section('FORMULAS (reference — Layer 2 / calcRankGap)'));
	lines.push(
		[
			'Per keyword: scaledMonthlyVolume = round(sudburyVolume × (households ÷ 73,000) × 1.20)',
			'  ctrGap = max(positionOneCTR − mapPackCTR[position], minCtrFloor)',
			'  monthlyValue = scaledMonthlyVolume × ctrGap × siteRetention × callToPurchaseRate × avgSale',
			'  annualGap (keyword) = monthlyValue × (12 ÷ seasonalDivisor)  [HVAC/roofing use seasonal divisor]',
			'Per trade: rank gap = sum of keyword annual gaps; engine rounds per trade.',
			'Combined Layer 2: sum of per-trade rank gap values (see trade breakdown below).',
			''
		].join('\n')
	);
	lines.push(`Locked constants: positionOneCTR=${BENCHMARKS.positionOneCTR}, minCtrFloor=${BENCHMARKS.minCtrGapFloor}, callToPurchase=${BENCHMARKS.callToPurchaseRate}\n`);

	lines.push(section('INPUTS'));
	lines.push(fmtJson(p.inputs));

	lines.push(section('CONTEXT'));
	lines.push(`City: ${p.city}\n`);
	lines.push(`Households (for scaling): ${p.households}\n`);
	lines.push(`PSI performance score (PageSpeed): ${p.performanceScore}\n`);
	lines.push(`Site retention rate (from PSI): ${p.siteRetentionRate}\n`);
	lines.push(`Layer 1 GBP gap (from calculateDiagnostic raw, for reference): ${formatCurrency(p.layer1GbpGapValue)} (${p.layer1GbpGapValue})\n`);

	lines.push(section('PER-TRADE RANK GAP (sums to Layer 2 total)'));
	if (tradeBreakdown.length === 0) {
		lines.push('No trade breakdown.\n');
	} else {
		lines.push('Each row is one trade’s rank gap (annual $). The engine sums these to the Layer 2 total.\n\n');
		for (const row of tradeBreakdown) {
			const r = /** @type {Record<string, unknown>} */ (row);
			lines.push(
				`  • ${r.trade}: weight label ${r.weight}% (informational) → rank gap value = ${formatCurrency(/** @type {number} */ (r.value))} (${r.value})\n`
			);
		}
		const sumParts = tradeBreakdown.reduce(
			(s, row) => s + (/** @type {number} */ (/** @type {Record<string, unknown>} */ (row).value) || 0),
			0
		);
		const terms = tradeBreakdown
			.map((row) => {
				const r = /** @type {Record<string, unknown>} */ (row);
				return `${r.value}`;
			})
			.join(' + ');
		lines.push(`\nAdditive check: ${terms} = ${sumParts}\n`);
		lines.push(`Engine reported Layer 2 gap (rounded total): ${p.finalLayer2Gap}\n`);
		lines.push(
			sumParts === p.finalLayer2Gap
				? '(Sum of per-trade values matches total.)\n'
				: '(If these differ by 1, it is from rounding inside the engine.)\n'
		);
	}

	lines.push(section('COMBINED VIEW (Layer 1 + Layer 2, not a new formula)'));
	lines.push(
		`Layer 1 (GBP) reference value: ${p.layer1GbpGapValue}\n` +
			`Layer 2 (rank) total: ${p.finalLayer2Gap}\n` +
			`Sum (illustrative): ${p.layer1GbpGapValue} + ${p.finalLayer2Gap} = ${p.layer1GbpGapValue + p.finalLayer2Gap}\n`
	);
	lines.push(
		'\nNote: UI may show “combined” estimates; this report only documents Layer 2 rank gap and the Layer 1 number returned by the engine.\n'
	);

	lines.push(section('METRICS (snapshot)'));
	lines.push(fmtJson(p.metrics));

	lines.push(section('API CALL LOG (requests & responses)'));
	lines.push(
		'Authorization headers are omitted. Google Maps / PageSpeed URLs have keys redacted where applicable.\n\n'
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

	lines.push(section('FINAL RESULT — Layer 2 rank gap (additive)'));
	lines.push(`Display value: ${formatCurrency(p.finalLayer2Gap)} (${p.finalLayer2Gap})\n`);
	if (tradeBreakdown.length) {
		const t = tradeBreakdown.map((row) => /** @type {Record<string, unknown>} */ (row).value);
		lines.push(`\nFinal = sum of per-trade gaps: ${t.join(' + ')} = ${p.finalLayer2Gap}\n`);
	}
	lines.push('\nEnd of report.\n');

	return lines.join('');
}
