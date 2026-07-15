/**
 * Per-field explainers for POST /api/calc/* — each leaf is unique and ties to
 * request JSON + engine formulas. Only used when attachExplainer gets requestBody.
 */

import { BENCHMARKS, getSiteRetentionRate } from '$lib/clearsky/clearsky-engine.js';

/** @typedef {{ title: string, howWeGetIt: string, usedFor: string, valueInThisResponse: string }} ExplainerLeaf */

/** @param {unknown} v */
export function valStr(v) {
	if (v === null) return 'null';
	if (v === undefined) return 'undefined';
	if (typeof v === 'string') {
		return v.length > 280 ? JSON.stringify(v.slice(0, 277) + '…') : JSON.stringify(v);
	}
	if (typeof v === 'number' || typeof v === 'boolean') return String(v);
	try {
		const s = JSON.stringify(v);
		return s.length > 400 ? s.slice(0, 397) + '…' : s;
	} catch {
		return String(v);
	}
}

/** @type {(t: string, h: string, u: string, v: unknown) => ExplainerLeaf} */
export const leaf = (title, howWeGetIt, usedFor, value) => ({
	title,
	howWeGetIt,
	usedFor,
	valueInThisResponse: valStr(value)
});

/**
 * @param {Record<string, unknown>} res
 * @param {string} routeId
 * @param {Record<string, unknown>} req
 */
/**
 * Rich primitive explainers for calculateDiagnostic output — unique per JSON path.
 * @param {string} pathStr
 * @param {unknown} value
 * @param {Record<string, unknown>} req
 * @param {string} title
 */
function diagnosticPrimitiveLeaf(pathStr, value, req, title) {
	const v = valStr(value);
	const dd = /** @type {Record<string, unknown>} */ (req.diagnosticData || {});
	const intake = /** @type {Record<string, unknown>} */ (req.intakeInputs || {});
	const intakeKeys = Object.keys(intake).join(', ') || '(none)';
	const biz = /** @type {Record<string, unknown>} */ (dd.business || {});
	const city = String(biz.city || '');
	const trade = String(biz.trade || '');
	const name = String(biz.name || '');
	const ctx = name ? `${name} (${trade}, ${city})` : `${trade || 'trade'} in ${city || 'city'}`;

	/** @type {Record<string, () => { how: string, used: string }>} */
	const exact = {
		'business.name': () => ({
			how: `diagnosticData.business.name as passed into calculateDiagnostic → ${v}.`,
			used: 'Report title, PDF cover, and identity join key for Places/DataForSEO lookups.'
		}),
		'business.city': () => ({
			how: `diagnosticData.business.city → ${v}.`,
			used: 'Drives MARKET_CLUSTERS household scaling, economic tier lookup, and local keyword volume.'
		}),
		'business.trade': () => ({
			how: `diagnosticData.business.trade → ${v}.`,
			used: 'getTradeKey(trade) selects Sudbury keyword pack, seasonal divisor, and default avg job size.'
		}),
		'business.websiteURL': () => ({
			how: `diagnosticData.business.websiteURL → ${v}.`,
			used: 'Canonical / PSI targets and citation checks; feeds engagement + canonical layers.'
		}),
		'business.gbpRating': () => ({
			how: `gbp?.rating from diagnosticData or "not found" → ${v}.`,
			used: 'Health tile + star-signal scoring inside composite GBP model when gbp exists.'
		}),
		'business.reviewCount': () => ({
			how: `gbp?.reviewCount or 0 → ${v}.`,
			used: 'Review-count signal for composite score and trust narrative.'
		}),
		'business.lighthouseScore': () => ({
			how: `lighthouse?.performance or 0 → ${v}.`,
			used: 'Performance health tile; also feeds PSI→retention when siteRetention not overridden.'
		}),
		'business.mapPackPosition': () => ({
			how: `rank?.keywords[0]?.position or "not in pack" → ${v}.`,
			used: 'Chooses mapPackCTR slot in GBP/CTR gap math when a single rank row is shown.'
		}),
		'gaps.total': () => ({
			how: `coreAdjusted + secondaryGaps, where coreAdjusted = applyModifiers(gbpGap.value + rankGap.value, years, marketTier) → ${v}.`,
			used: 'Headline “Technical Revenue Gap” — scenarios.totalGap and PDF executive summary use this.'
		}),
		'gaps.projected': () => ({
			how: `round(annualRevenue + gaps.total + capacityLift.value) from intake + engine → ${v}.`,
			used: '“Projected revenue” card after closing gaps; not the same as annual revenue input.'
		}),
		'gaps.gbp': () => ({
			how: `calcGbpGap(gbp, scaledMonthlySearches, avgSale, years, retention, vertical) → .value → ${v}.`,
			used: 'Adds into coreBaseGap with rank before tenure/economic modifiers.'
		}),
		'gaps.rank': () => ({
			how: `calcWeightedRankGap / calcRankGap from SERP keywords → annual $ → ${v}.`,
			used: 'Adds into coreBaseGap with GBP; defines map-pack opportunity line.'
		}),
		'gaps.performance': () => ({
			how: `calcPerformanceGap(lighthouse, monthlySearches, avgCtr, avgSale, seasonal) → ${v}.`,
			used: 'Secondary gap after core; PSI/LCP/CLS story in performance layer.'
		}),
		'gaps.content': () => ({
			how: `calcContentGap(contentGap, avgSale, seasonal, engagementMult) → ${v}.`,
			used: 'Content coverage gap $; pairs with engagement multiplier in meta.'
		}),
		'gaps.missedCalls': () => ({
			how: `missedCall gap adjusted by conversion infrastructure (convInfra) → ${v}.`,
			used: 'Shows revenue left on table from unanswered calls after auto-response uplift.'
		}),
		'gaps.social': () => ({
			how: `calcSocialAdjustment(...) from socialVoice + GBP gap + capacity quarters → ${v}.`,
			used: 'Reputation / social layer — rolls into `gaps.total` as secondary.'
		}),
		'gaps.paid': () => ({
			how: `calcPaidGap(paidMarketing, selfReported, lighthouse, gbp, contentGap, seasonal) → ${v}.`,
			used: 'Paid pressure / LSA gap — secondary component of `gaps.total`.'
		}),
		'gaps.engagement': () => ({
			how: `calcEngagementGap(engagement, monthlySearches, CTR, avgSale, seasonal, engagementMult) → ${v}.`,
			used: 'FAQ/reviews/engagement layer — feeds `gaps.total` and engagement health tile.'
		}),
		'gaps.capacityLift': () => ({
			how: `calcCapacityLift(...) idle admin + truck-roll capacity → ${v}.`,
			used: 'Adds to `gaps.projected`; drives capacityInsight narrative paragraph.'
		}),
		'capacityInsight': () => ({
			how: `Template string from capacityResult.detail (admin hours, hourly rate, idle capacity) → ${v}.`,
			used: 'Long-form narrative in diagnostic modal and printable report body.'
		}),
		'growthStatement': () => ({
			how: `calcGrowthScore(...) growthStatement field → ${v}.`,
			used: 'Growth / brand equity copy block in the report.'
		}),
		'meta.seasonalMultiplier': () => ({
			how: `Seasonal factor from trade + calendar → ${v}.`,
			used: 'Scales monthly volume in layer formulas; shown in meta summary.'
		}),
		'meta.aiRiskMultiplier': () => ({
			how: `AI visibility / risk model → ${v}.`,
			used: 'Adjusts demand risk in downstream gap math where AI layer is applied.'
		}),
		'meta.engagementMultiplier': () => ({
			how: `Engagement composite → ${v}.`,
			used: 'Multiplies content gap path; pairs with engagement health tile.'
		}),
		'meta.citationMultiplier': () => ({
			how: `Citation / NAP strength → ${v}.`,
			used: 'Scales citation-sensitive gap components.'
		}),
		'meta.canonicalMultiplier': () => ({
			how: `Canonical / duplicate suppression → ${v}.`,
			used: 'Layer 12 canonical health — dampens or lifts trust signals.'
		}),
		'meta.benchmarkLift': () => ({
			how: `BENCHMARKS.verticalBenchmarks[vertical].pct → ${v}.`,
			used: 'Compares business vertical to benchmark story in meta ribbon.'
		}),
		'meta.verticalLabel': () => ({
			how: `BENCHMARKS.verticalBenchmarks[vertical].label → ${v}.`,
			used: 'Human label for vertical benchmark row.'
		}),
		'meta.monthlySearches': () => ({
			how: `Scaled monthly search volume after city + household scaling → ${v}.`,
			used: 'Volume side of every “× CTR × retention × …” revenue line.'
		}),
		'meta.avgCurrentCtr': () => ({
			how: `Average CTR across map-pack positions in use → ${v}.`,
			used: 'Summarizes CTR context for rank/GBP layers; display string in meta.'
		}),
		'meta.brandTenureModifier': () => ({
			how: `getBrandTenureModifier(yearsInBusiness) → ${v}.`,
			used: 'Same tenure story as /api/calc/tenure-rate — applied inside applyModifiers.'
		}),
		'meta.brandTenureLabel': () => ({
			how: `Tenure tier label from brand tenure → ${v}.`,
			used: 'Copy next to brandTenureModifier in UI.'
		}),
		'meta.brandTenureYears': () => ({
			how: `intakeInputs.yearsInBusiness or operations default → ${v}.`,
			used: 'Drives tenure tier and brand tenure modifier.'
		}),
		'meta.marketOpportunityMultiplier': () => ({
			how: `getMarketOpportunityMultiplier(city, density, …) → ${v}.`,
			used: 'Same economic story as /api/calc/economic-rate — demand-side multiplier.'
		}),
		'meta.marketDemandTier': () => ({
			how: `Resolved market demand tier label → ${v}.`,
			used: 'Ties economic tier to narrative and `meta.marketOpportunityMultiplier`.'
		}),
		'meta.competitiveDensity': () => ({
			how: `Competitor density label from market layer → ${v}.`,
			used: 'Explains how crowded the SERP is for ${ctx}.'
		}),
		'meta.paidCompetitorCount': () => ({
			how: `Count of paid competitors detected → ${v}.`,
			used: 'Feeds paid pressure health tile and paid gap context.'
		}),
		'meta.diagnosticConfidence': () => ({
			how: `calcDiagnosticConfidence() → layer averages → ${v}.`,
			used: 'Widths the recovery scenario band via `meta.uncertaintySpread`.'
		}),
		'meta.uncertaintySpread': () => ({
			how: `From confidence: min + 0.25×(1−confidence) → ${v}.`,
			used: 'Low/mid/high ranges in recovery scenarios modal.'
		}),
		'rawGaps.core.baseGap': () => ({
			how: `gbpGapResult.value + rankGapResult.value (pre-modifier) → ${v}.`,
			used: 'Reconcile: core base before applyModifiers with `gaps.gbp` + `gaps.rank`.'
		}),
		'rawGaps.core.totalRecoverable': () => ({
			how: `applyModifiers(baseGap, years, marketTier) → ${v}.`,
			used: 'Core $ after tenure × economic — matches portion inside `gaps.total` before secondary gaps.'
		}),
		'rawGaps.core.ultraConservative': () => ({
			how: `round(totalRecoverable × ${BENCHMARKS.ultraConservativeDiscount}) → ${v}.`,
			used: '“15% haircut” conservative headline — same as modifiers route output.'
		})
	};

	const hit = exact[pathStr];
	if (hit) {
		const { how, used } = hit();
		return leaf(title, how, used, value);
	}

	if (pathStr.startsWith('rawGaps.gbp')) {
		if (pathStr === 'rawGaps.gbp.value') {
			return leaf(
				title,
				`calcGbpGap(...) headline .value for ${ctx} → ${v}.`,
				'Same number as `gaps.gbp` before rounding differences; audit trail for Layer 1 GBP.',
				value
			);
		}
		return leaf(
			title,
			`Field \`${pathStr.replace(/^rawGaps\.gbp\.?/, '') || 'root'}\` from calcGbpGap return at ${pathStr} → ${v}.`,
			'Drill-down: CTR gap, throughput, retention chain inside GBP gap.',
			value
		);
	}
	if (pathStr.startsWith('rawGaps.rank')) {
		return leaf(
			title,
			`Field from calcRankGap / calcWeightedRankGap at ${pathStr} → ${v}.`,
			'Drill-down: keyword rows, trade weights, annual gap per keyword.',
			value
		);
	}
	if (pathStr.startsWith('rawGaps.performance')) {
		return leaf(
			title,
			`calcPerformanceGap result path ${pathStr} → ${v}.`,
			'PSI / CWV / performance dollar gap transparency.',
			value
		);
	}
	if (pathStr.startsWith('rawGaps.content')) {
		return leaf(
			title,
			`calcContentGap result path ${pathStr} → ${v}.`,
			'Missing pages / coverage gap — supports content roadmap.',
			value
		);
	}
	if (pathStr.startsWith('rawGaps.confidence')) {
		return leaf(
			title,
			`calcDiagnosticConfidence output at ${pathStr} → ${v}.`,
			'Feeds uncertainty bands + meta.diagnosticConfidence.',
			value
		);
	}
	if (pathStr.startsWith('rawGaps.brandTenure')) {
		return leaf(
			title,
			`getBrandTenureModifier bundle at ${pathStr} → ${v}.`,
			'Same tenure logic as tenure-rate endpoint; ties to `meta.brandTenureModifier`.',
			value
		);
	}
	if (pathStr.startsWith('rawGaps.marketOpportunity')) {
		return leaf(
			title,
			`Market opportunity object at ${pathStr} → ${v}.`,
			'Economic tier + density — same inputs as economic-rate endpoint.',
			value
		);
	}
	if (pathStr.startsWith('healthScores.')) {
		return leaf(
			title,
			`Health scorecard leaf at ${pathStr} → ${v}; layerErrors may force "error".`,
			`Traffic-light tile for ${pathStr.split('.')[1] ?? 'layer'} in diagnostic dashboard.`,
			value
		);
	}

	return leaf(
		title,
		`calculateDiagnostic(diagnosticData, intakeInputs) wrote data.${pathStr} = ${v}; intake keys: ${intakeKeys}; business: ${ctx}.`,
		`Consumers bind this exact path in the diagnostic UI / JSON export for ${trade || 'the business'} in ${city || 'their city'}.`,
		value
	);
}

function explainError(res, routeId, req) {
	const err = String(res.error ?? '');
	const code = res.code != null ? String(res.code) : '';
	return {
		success: leaf(
			'Request outcome flag',
			'Set to false because the handler returned an error before computing success payload.',
			'Client should show `error` (and `code` if present) instead of trusting `data`.',
			false
		),
		...(code
			? {
					code: leaf(
						'Vendor or engine error code',
						`Returned alongside message for this failure on route "${routeId}".`,
						'Maps to DataForSEO / engine error taxonomy in support playbooks.',
						code
					)
				}
			: {}),
		error: leaf(
			'Error message',
			`Thrown or returned in catch on "${routeId}". Last request body keys: ${Object.keys(req).join(', ') || '(empty)'}.`,
			'Display to user or log; fix inputs or credentials and retry.',
			err
		)
	};
}

/**
 * @param {unknown} value
 * @param {string[]} path
 * @param {Record<string, unknown>} req diagnostic request { diagnosticData, intakeInputs }
 */
function explainDiagnosticValue(value, path, req) {
	const pathStr = path.join('.');
	const lastSeg = path.length === 0 ? '' : String(path[path.length - 1]);
	const title =
		path.length === 0
			? 'Root'
			: lastSeg
					.replace(/([A-Z])/g, ' $1')
					.replace(/_/g, ' ')
					.trim()
					.replace(/^\w/, (c) => c.toUpperCase());

	if (value === null || value === undefined) {
		return leaf(
			title,
			`Field at data.${pathStr} from calculateDiagnostic(diagnosticData, intakeInputs). intakeInputs had keys: ${Object.keys(/** @type {Record<string, unknown>} */ (req.intakeInputs) || {}).join(', ') || 'none'}.`,
			`Part of the full diagnostic contract consumed by the diagnostic UI / exports at data.${pathStr}.`,
			value
		);
	}
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		return diagnosticPrimitiveLeaf(pathStr, value, req, title);
	}
	if (Array.isArray(value)) {
		return value.map((item, i) => explainDiagnosticValue(item, [...path, String(i)], req));
	}
	if (typeof value === 'object') {
		/** @type {Record<string, unknown>} */
		const o = /** @type {Record<string, unknown>} */ (value);
		/** @type {Record<string, unknown>} */
		const out = {};
		for (const k of Object.keys(o)) {
			out[k] = explainDiagnosticValue(o[k], [...path, k], req);
		}
		return out;
	}
	return leaf(title, `data.${pathStr}`, 'diagnostic payload', value);
}

function explainDiagnostic(res, req) {
	if (!res.success) return explainError(res, 'diagnostic', req);
	const data = /** @type {Record<string, unknown>} */ (res.data);
	return {
		success: leaf(
			'Request succeeded',
			'calculateDiagnostic(diagnosticData, intakeInputs) completed without throw.',
			'When true, `data` is the full diagnostic object for the UI.',
			true
		),
		data: explainDiagnosticValue(data, [], req)
	};
}

function explainSiteRetention(res, req) {
	if (!res.success) return explainError(res, 'site-retention', req);
	const d = /** @type {Record<string, unknown>} */ (res.data);
	const score = d.psiScore;
	const rr = d.retentionRate;
	const mobile = req.mobile;
	const desktop = req.desktop;
	const howScore =
		req.psiScore != null
			? `psiScore from request = ${req.psiScore} (used as-is).`
			: mobile != null && desktop != null
				? `psiScore = round((mobile + desktop) / 2) = round((${mobile} + ${desktop}) / 2) = ${score}.`
				: `psiScore = ${score} (derived in handler).`;
	return {
		success: leaf(
			'Request succeeded',
			'POST body had psiScore or both mobile+desktop; getSiteRetentionRate(score) ran.',
			'Same retention mapping Layer 1/2 use when converting PSI → siteRetentionRate.',
			true
		),
		data: {
			psiScore: leaf(
				'Performance score fed to retention',
				howScore,
				'Input to getSiteRetentionRate() → multiplies revenue formulas with callToPurchase × avgSale.',
				d.psiScore
			),
			...(d.mobile != null
				? {
						mobile: leaf(
							'Mobile PSI from request',
							`Request body mobile = ${mobile}.`,
							'Averaged with desktop when psiScore omitted.',
							d.mobile
						)
					}
				: {}),
			...(d.desktop != null
				? {
						desktop: leaf(
							'Desktop PSI from request',
							`Request body desktop = ${desktop}.`,
							'Averaged with mobile when psiScore omitted.',
							d.desktop
						)
					}
				: {}),
			...(d.averageFormula != null
				? {
						averageFormula: leaf(
							'Shown average line',
							`String built as (${mobile} + ${desktop}) / 2 = ${score}.`,
							'Audit only — same numbers as psiScore.',
							d.averageFormula
						)
					}
				: {}),
			retentionRate: leaf(
				'Site retention multiplier',
				`getSiteRetentionRate(${score}) → ${rr} (bands: 90–100→1.0, 70–89→0.9, 50–69→0.85, 0–49→0.8).`,
				'Multiplied in calcGbpGap / calcRankGap revenue lines as siteRetentionRate.',
				d.retentionRate
			),
			abandonment: leaf(
				'Abandonment percent string',
				`round((1 − ${rr}) × 100)% = ${d.abandonment}.`,
				'Inverse story to retention in UI copy.',
				d.abandonment
			),
			status: leaf(
				'Color band label',
				`score ${score} → ${d.status} (≥90 Green, ≥70 Amber, ≥50 Amber, else Red).`,
				'Traffic-light display next to PSI.',
				d.status
			),
			lookupTable: leaf(
				'PSI → retention reference table',
				'Static RETENTION_TABLE array copied into response for documentation.',
				'Not used in math — documentation only.',
				d.lookupTable
			),
			note: leaf(
				'Server note',
				'Fixed string on this route.',
				'Reminder that mobile+desktop average drives retention when used.',
				d.note
			)
		}
	};
}

function explainRankingCtr(res, req) {
	if (!res.success) return explainError(res, 'ranking-ctr', req);
	const d = /** @type {Record<string, unknown>} */ (res.data);
	const pos = String(req.position ?? '');
	const one = BENCHMARKS.positionOneCTR;
	const cur = d.currentCTR;
	const floor = BENCHMARKS.minCtrGapFloor;
	return {
		success: leaf(
			'Request succeeded',
			`position from request = ${JSON.stringify(req.position)}; mapPackCTR[position] and floor ${floor} applied.`,
			'Same CTR gap piece as inside calcRankGap / calcGbpGap.',
			true
		),
		data: {
			position: leaf(
				'Map pack slot you asked about',
				`Request JSON position = ${JSON.stringify(req.position)} → string key "${pos}".`,
				'Selects BENCHMARKS.mapPackCTR[...] for currentCTR.',
				d.position
			),
			positionOneCTR: leaf(
				'Benchmark CTR at #1',
				`Constant BENCHMARKS.positionOneCTR = ${one}.`,
				'Top of funnel: gap = max(one − currentCTR, floor).',
				d.positionOneCTR
			),
			currentCTR: leaf(
				'CTR at your slot',
				`BENCHMARKS.mapPackCTR['${pos}'] or mapPackCTR['none'] → ${cur}.`,
				'Subtracted from positionOneCTR (then floored) in rank/GBP formulas.',
				d.currentCTR
			),
			rawCtrGap: leaf(
				'CTR gap before floor',
				`${one} − ${cur} = ${d.rawCtrGap} (see handler).`,
				'Compared to minGapFloor next.',
				d.rawCtrGap
			),
			minGapFloor: leaf(
				'Minimum gap floor',
				`Constant ${floor} (15% minimum modeled opportunity).`,
				'max(rawCtrGap, floor) → appliedCtrGap.',
				d.minGapFloor
			),
			appliedCtrGap: leaf(
				'CTR gap used in revenue math',
				`max(rawCtrGap, ${floor}) = ${d.appliedCtrGap}.`,
				'Multiplied by scaled volume × retention × callToPurchase × avgSale in rank/GBP.',
				d.appliedCtrGap
			),
			floorApplied: leaf(
				'Whether floor changed the gap',
				`rawCtrGap < ${floor} → ${d.floorApplied}.`,
				'Explains why #1 can still show opportunity.',
				d.floorApplied
			),
			interpretation: leaf(
				'Human sentence',
				'Built in handler from position, CTRs, and gap.',
				'Tooltip / one-line summary.',
				d.interpretation
			),
			lookupTable: leaf(
				'Full CTR ladder',
				'All mapPackCTR entries with raw and applied gaps.',
				'Education — not returned from a second API call.',
				d.lookupTable
			),
			note: leaf(
				'Server note',
				'Fixed explanation of floor behavior.',
				'Documentation.',
				d.note
			)
		}
	};
}

function explainTenureRate(res, req) {
	if (!res.success) return explainError(res, 'tenure-rate', req);
	const d = /** @type {Record<string, unknown>} */ (res.data);
	const years = Number(req.yearsInBusiness);
	const tier = BENCHMARKS.brandTenureTiers.find((t) => years >= t.minYears) ||
		BENCHMARKS.brandTenureTiers[BENCHMARKS.brandTenureTiers.length - 1];
	return {
		success: leaf(
			'Request succeeded',
			`yearsInBusiness from request = ${years}; matched tier minYears≥${tier.minYears}.`,
			'Same tiers applyModifiers uses.',
			true
		),
		data: {
			yearsInBusiness: leaf(
				'Years in business input',
				`Request body yearsInBusiness = ${JSON.stringify(req.yearsInBusiness)} → number ${d.yearsInBusiness}.`,
				'Selects brandTenureTiers row for tenureRate.',
				d.yearsInBusiness
			),
			tenureRate: leaf(
				'Tenure multiplier',
				`Tier "${tier.label}" → rate ${tier.rate} (from BENCHMARKS.brandTenureTiers).`,
				'Used inside applyModifiers(base, years, tier) as (1 + tenureRate) style uplift.',
				d.tenureRate
			),
			tenureLabel: leaf(
				'Tenure tier label',
				`Same row as tenureRate: "${tier.label}".`,
				'Copy for PDFs / tooltips.',
				d.tenureLabel
			),
			effect: leaf(
				'Effect string',
				'Built from tier.rate sign and magnitude.',
				'One-line UX.',
				d.effect
			),
			lookupTable: leaf(
				'All tenure tiers',
				'BENCHMARKS.brandTenureTiers serialized.',
				'Documentation.',
				d.lookupTable
			),
			formula: leaf(
				'Formula hint',
				`Shows modifiedValue = baseValue × (1 + ${tier.rate}) for tenure portion.`,
				'Matches modifier route narrative.',
				d.formula
			)
		}
	};
}

function explainEconomicRate(res, req) {
	if (!res.success) return explainError(res, 'economic-rate', req);
	const d = /** @type {Record<string, unknown>} */ (res.data);
	const resolved = String(d.marketTier);
	const eco = BENCHMARKS.marketDemandTiers[resolved] || BENCHMARKS.marketDemandTiers.neutral;
	const fromCity =
		req.marketTier == null && req.city
			? `BENCHMARKS.marketDemandLookup['${String(req.city).toLowerCase().trim()}'] → "${resolved}".`
			: `marketTier from request = ${JSON.stringify(req.marketTier)} → "${resolved}".`;
	return {
		success: leaf(
			'Request succeeded',
			fromCity,
			'Same economic tier applyModifiers uses.',
			true
		),
		data: {
			...(d.city != null
				? {
						city: leaf(
							'City string from request',
							`request.city = ${JSON.stringify(req.city)}.`,
							'Looked up in marketDemandLookup when marketTier omitted.',
							d.city
						)
					}
				: {}),
			marketTier: leaf(
				'Resolved demand tier key',
				fromCity,
				'Selects BENCHMARKS.marketDemandTiers[tier].rate.',
				d.marketTier
			),
			economicRate: leaf(
				'Economic multiplier',
				`marketDemandTiers['${resolved}'].rate = ${eco.rate}.`,
				'Used inside applyModifiers after tenure.',
				d.economicRate
			),
			economicLabel: leaf(
				'Economic label',
				`Same tier row label: "${eco.label}".`,
				'Sales narrative.',
				d.economicLabel
			),
			effect: leaf(
				'Effect string',
				'Built from ecoTier.rate.',
				'UX one-liner.',
				d.effect
			),
			lookupTable: leaf(
				'All tier rates',
				'Serialized marketDemandTiers.',
				'Documentation.',
				d.lookupTable
			),
			cityLookup: leaf(
				'City → tier map',
				'Serialized marketDemandLookup.',
				'Shows which cities map to which tier in this deploy.',
				d.cityLookup
			),
			formula: leaf(
				'Formula hint',
				`Shows modifiedValue = baseValue × (1 + ${eco.rate}) for economic portion.`,
				'Pairs with modifiers route.',
				d.formula
			)
		}
	};
}

function explainModifiers(res, req) {
	if (!res.success) return explainError(res, 'modifiers', req);
	const d = /** @type {Record<string, unknown>} */ (res.data);
	const b = d.breakdown;
	const bd = /** @type {Record<string, unknown>} */ (b || {});
	const base = Number(req.baseValue);
	const years = Number(req.yearsInBusiness) || 5;
	const discountOn = req.applyDiscount !== false;
	return {
		success: leaf(
			'Request succeeded',
			`applyModifiers(${base}, ${years}, tier) then optional ×0.85; applyDiscount=${discountOn}.`,
			'Isolates Layer 1 modifier chain.',
			true
		),
		data: {
			baseValue: leaf(
				'Input gap before modifiers',
				`request.baseValue = ${base} (annual $ from calcGbpGap or test).`,
				'Starting point for tenure × economic.',
				d.baseValue
			),
			adjustedValue: leaf(
				'After tenure + economic',
				`applyModifiers(${base}, ${years}, "${bd.marketTier}") → ${d.adjustedValue}.`,
				'Becomes input to optional conservative discount.',
				d.adjustedValue
			),
			withUltraConservativeDiscount: leaf(
				'After optional 15% haircut',
				discountOn
					? `round(${d.adjustedValue} × 0.85) = ${d.withUltraConservativeDiscount} (BENCHMARKS.ultraConservativeDiscount).`
					: 'applyDiscount false → same as adjustedValue.',
				'Matches “final conservative” story in Layer 1 reports.',
				d.withUltraConservativeDiscount
			),
			breakdown: {
				tenureRate: leaf(
					'Tenure rate from years',
					`years=${years} → tier rate ${bd.tenureRate}.`,
					'Multiplicative part of applyModifiers.',
					bd.tenureRate
				),
				tenureLabel: leaf('Tenure tier label', `Tier label for years=${years}.`, 'Display.', bd.tenureLabel),
				yearsInBusiness: leaf(
					'Years used',
					`request.yearsInBusiness → ${bd.yearsInBusiness}.`,
					'Tenure tier lookup.',
					bd.yearsInBusiness
				),
				economicRate: leaf(
					'Economic rate',
					`city/tier "${bd.marketTier}" → ${bd.economicRate}.`,
					'Second multiplicative part.',
					bd.economicRate
				),
				economicLabel: leaf('Economic label', 'Tier label string.', 'Copy.', bd.economicLabel),
				marketTier: leaf(
					'Resolved tier key',
					`request.marketTier or lookup from request.city → "${bd.marketTier}".`,
					'Selects economicRate.',
					bd.marketTier
				),
				discountApplied: leaf(
					'Discount label',
					discountOn ? '15% because applyDiscount !== false.' : 'none — full adjustedValue kept.',
					'Transparency.',
					bd.discountApplied
				)
			}
		}
	};
}

function explainCityHouseholds(res, req) {
	if (!res.success) return explainError(res, 'city-households', req);
	const d = /** @type {Record<string, unknown>} */ (res.data);
	const city = String(req.city ?? '');
	const hh = Number(d.households);
	const sud = BENCHMARKS.sudburyHouseholds;
	const uplift = BENCHMARKS.captiveMarketUplift;
	return {
		success: leaf(
			'Request succeeded',
			`getCityHouseholds("${city}") and BENCHMARKS constants.`,
			'Same scaling as Layer 1/2 Sudbury → city.',
			true
		),
		data: {
			city: leaf(
				'City input',
				`request.city = ${JSON.stringify(req.city)}.`,
				'Key into MARKET_CLUSTERS / default.',
				d.city
			),
			households: leaf(
				'Household count',
				`MARKET_CLUSTERS[${city.toLowerCase().trim()}]?.households or default → ${hh}.`,
				'Multiplies Sudbury index volumes in scaling formula.',
				d.households
			),
			indexCity: leaf(
				'Index market name',
				'Always "Sudbury" for Google Ads benchmark in this product.',
				'Explains where raw volumes come from.',
				d.indexCity
			),
			indexHouseholds: leaf(
				'Sudbury divisor',
				`BENCHMARKS.sudburyHouseholds = ${sud}.`,
				'Denominator in cityScale = households / sudburyHouseholds.',
				d.indexHouseholds
			),
			scalingFactor: leaf(
				'City / Sudbury ratio',
				`${hh} / ${sud} = ${d.scalingFactor}.`,
				'Multiplies each Sudbury keyword volume before uplift.',
				d.scalingFactor
			),
			captiveMarketUplift: leaf(
				'Captive uplift constant',
				`BENCHMARKS.captiveMarketUplift = ${uplift}.`,
				'Applied after city scaling in demand formulas.',
				d.captiveMarketUplift
			),
			scalingFactorWithUplift: leaf(
				'Combined local multiplier',
				`scalingFactor × uplift = ${d.scalingFactorWithUplift} (rounded in response).`,
				'Single factor some UIs show.',
				d.scalingFactorWithUplift
			),
			tier: leaf(
				'Cluster tier',
				`MARKET_CLUSTERS entry for city → "${d.tier}".`,
				'Demand story / internal segmentation.',
				d.tier
			),
			locationCode: leaf(
				'Geo code if known',
				'From MARKET_CLUSTERS when present.',
				'DataForSEO location_code for prospect city tasks.',
				d.locationCode
			),
			knownClusters: leaf(
				'Full cluster table',
				'Object.entries(MARKET_CLUSTERS) serialized.',
				'Reference — not used in math on this call.',
				d.knownClusters
			),
			formula: leaf(
				'Printed scaling formula',
				`Server string: ${valStr(d.formula)} (same math as sudburyVolume × (${hh} ÷ ${sud}) × ${uplift}).`,
				'Same as engine: sudburyVolume × (households/sudbury) × uplift.',
				d.formula
			)
		}
	};
}

function explainBenchmarkVolumes(res, req) {
	if (!res.success) return explainError(res, 'benchmark-volumes', req);
	const d = /** @type {Record<string, unknown>} */ (res.data);
	const kws = /** @type {Array<Record<string, unknown>>} */ (Array.isArray(d.keywords) ? d.keywords : []);
	const explainedKw = kws.map((kw, i) => ({
		keyword: leaf(
			`Locked keyword #${i + 1}`,
			`getTradeKey("${req.trade}") → locked list; keyword from DataForSEO index pack.`,
			'Summed into totalSudburyVolume; scaled by city in Layer 1.',
			kw.keyword
		),
		volume: leaf(
			`Google Ads volume for "${String(kw.keyword)}"`,
			`DataForSEO search_volume/live at indexLocationCode=${d.indexLocationCode} (Sudbury).`,
			'Becomes sudburyVolume for that slot before household scaling.',
			kw.volume
		)
	}));
	return {
		success: leaf(
			'Request succeeded',
			`fetchIndexMarketKeywordVolumes(login, password, trade="${req.trade}").`,
			'Live DataForSEO — same as Layer 1 index step.',
			true
		),
		data: {
			trade: leaf(
				'Trade string from request',
				`request.trade = ${JSON.stringify(req.trade)}.`,
				'Normalized via getTradeKey to choose locked keywords.',
				d.trade
			),
			resolvedTradeKey: leaf(
				'Normalized trade key',
				`getTradeKey("${req.trade}") → "${d.resolvedTradeKey}".`,
				'Selects keyword list + seasonal rules.',
				d.resolvedTradeKey
			),
			indexCity: leaf('Index market', 'Always Sudbury in this product.', 'Context for volumes.', d.indexCity),
			indexHouseholds: leaf(
				'Reference households',
				`${BENCHMARKS.sudburyHouseholds} — not the prospect city.`,
				'Explains scaling denominator elsewhere.',
				d.indexHouseholds
			),
			indexLocationCode: leaf(
				'Google Ads location code',
				'Resolved for Greater Sudbury from DataForSEO locations API.',
				'Must match search_volume request body.',
				d.indexLocationCode
			),
			volumeSource: leaf(
				'Source tag',
				'dataforseo — live API.',
				'Support / audit.',
				d.volumeSource
			),
			keywords: explainedKw,
			totalSudburyVolume: leaf(
				'Sum of five volumes',
				kws.map((k) => Number(k.volume)).join(' + ') + ` = ${d.totalSudburyVolume}`,
				'Benchmark demand before city scaling.',
				d.totalSudburyVolume
			),
			note: leaf('Server note', 'Fixed string.', 'Docs.', d.note)
		}
	};
}

function explainCompositeScore(res, req) {
	if (!res.success) return explainError(res, 'composite-score', req);
	const d = /** @type {Record<string, unknown>} */ (res.data);
	if (!d.gbpExists) {
		return {
			success: leaf(
				'Request succeeded',
				'POST body had no `gbp` — server returns a fixed no-listing shape (score 0, empty signals).',
				'Lets clients branch the same way as `calcGbpGap(null, …)` / diagnostic no-profile flows.',
				true
			),
			data: {
				gbpExists: leaf(
					'Listing flag',
					'request.gbp was null/undefined → false.',
					'When false, downstream uses `gbpNoListingPenalty` and skips nine-signal scoring.',
					d.gbpExists
				),
				compositeScore: leaf(
					'Composite /100',
					'No profile to score → forced 0 (not an error).',
					'Aligns with throughput = 1 − min(noListingPenalty, cap) in calcGbpGap when place_id missing.',
					d.compositeScore
				),
				compositePenalty: leaf(
					'No-listing penalty constant',
					`BENCHMARKS.gbpNoListingPenalty = ${BENCHMARKS.gbpNoListingPenalty} (same constant as engine no-profile branch).`,
					'Becomes `(1 − penalty)` throughput multiplier in GBP gap when there is no GBP.',
					d.compositePenalty
				),
				note: leaf(
					'Server note',
					'Explains that missing GBP is intentional — not a failed fetch.',
					'Shown next to empty radar in UI.',
					d.note
				),
				signals: leaf(
					'Per-signal rows',
					'[] — no request.gbp fields to feed getGbp*Score.',
					'Repair list and signal bars are omitted until a Places payload exists.',
					d.signals
				)
			}
		};
	}
	const years = Number(req.yearsInBusiness) || BENCHMARKS.yearsInBusinessDefault;
	const sigs = Array.isArray(d.signals) ? d.signals : [];
	const explainedSignals = sigs.map((s, i) => {
		const row = /** @type {Record<string, unknown>} */ (s);
		const label = String(row.name ?? `signal_${i + 1}`);
		return {
			name: leaf(
				`Signal name: ${label}`,
				`Row ${i + 1} of nine; score fn reads request.gbp (+ years=${years} where reviews/time-based).`,
				'Radar segment + repair sort key for this GBP dimension.',
				row.name
			),
			earned: leaf(
				`Earned pts — ${label}`,
				`BENCHMARKS.getGbp*Score for "${label}" only — capped by max below.`,
				`Adds into sum(earned) → compositeScore (max 100).`,
				row.earned
			),
			max: leaf(
				`Max pts — ${label}`,
				`Session 18 cap for "${label}" — earned/max drives percentage bar.`,
				'Denominator for pointsLost and repair ROI ranking.',
				row.max
			),
			...(row.pointsLost != null
				? {
						pointsLost: leaf(
							'Points left on table',
							`max − earned.`,
							'Sort repairs by largest pointsLost.',
							row.pointsLost
						)
					}
				: {}),
			...(row.percentage != null
				? {
						percentage: leaf(
							'Percent of max',
							`round(earned/max × 100)%.`,
							'Bar chart fill.',
							row.percentage
						)
					}
				: {})
		};
	});
	return {
		success: leaf(
			'Request succeeded',
			`Nine-signal model from request.gbp, yearsInBusiness=${years}.`,
			'Same scoring as inside calcGbpGap for composite.',
			true
		),
		data: {
			gbpExists: leaf('Listing present', 'request.gbp was truthy.', 'Enables 9-signal path.', d.gbpExists),
			compositeScore: leaf(
				'Composite /100',
				`sum(earned) capped at 100 = ${d.compositeScore}.`,
				'Throughput = 1 − min((100−score)/100, cap).',
				d.compositeScore
			),
			maxScore: leaf('Cap', '100.', 'Denominator.', d.maxScore),
			rawPenalty: leaf(
				'Raw penalty',
				`(100 − ${d.compositeScore}) / 100 = ${d.rawPenalty}.`,
				'Before gbpMaxPenaltyCap.',
				d.rawPenalty
			),
			cappedPenalty: leaf(
				'Capped penalty',
				`min(rawPenalty, ${BENCHMARKS.gbpMaxPenaltyCap}) = ${d.cappedPenalty}.`,
				'Feeds throughput.',
				d.cappedPenalty
			),
			throughput: leaf(
				'Throughput',
				`1 − cappedPenalty = ${d.throughput}.`,
				'Multiplied in GBP gap revenue line.',
				d.throughput
			),
			maxPenaltyCap: leaf('Penalty cap constant', String(BENCHMARKS.gbpMaxPenaltyCap), 'Engine limit.', d.maxPenaltyCap),
			status: leaf(
				'Traffic light',
				`score ${d.compositeScore} → ${d.status}.`,
				'UI badge.',
				d.status
			),
			signals: explainedSignals,
			penaltyFormula: leaf('Penalty string', 'Printed audit line.', 'Support.', d.penaltyFormula),
			throughputFormula: leaf('Throughput string', 'Printed audit line.', 'Support.', d.throughputFormula),
			note: leaf('Server note', 'Explains throughput use.', 'Docs.', d.note)
		}
	};
}

function explainGbpGap(res, req) {
	if (!res.success) return explainError(res, 'gbp-gap', req);
	const data = /** @type {Record<string, unknown>} */ (res.data);
	const monthly = Number(req.monthlySearches);
	const avg = Number(req.avgSaleValue);
	const years = Number(req.yearsInBusiness) || 5;
	const vert = req.vertical || 'trades';
	const psi = req.psiScore != null ? Number(req.psiScore) : null;
	const retention =
		req.siteRetentionRate != null
			? Number(req.siteRetentionRate)
			: getSiteRetentionRate(Number(psi ?? 100) || 100);
	const howRet =
		req.siteRetentionRate != null
			? `request.siteRetentionRate = ${retention}`
			: psi != null
				? `getSiteRetentionRate(request.psiScore=${psi})`
				: 'getSiteRetentionRate(100) default';
	const exists = data.gbpExists !== false;
	const gd = /** @type {Record<string, unknown>} */ (data.gapDerivation || {});
	const rev = /** @type {Record<string, unknown>} */ (gd.revenue || {});
	const ctr = /** @type {Record<string, unknown>} */ (gd.ctr || {});
	const gbpPart = /** @type {Record<string, unknown>} */ (gd.gbp || {});

	const signals = exists && Array.isArray(data.signals)
		? data.signals.map((s, i) => {
				const row = /** @type {Record<string, unknown>} */ (s);
				return {
					name: leaf(`Signal ${i + 1}`, `From request.gbp + years=${years}.`, 'Fires compositeScore.', row.name),
					earned: leaf('Earned pts', 'getGbp*Score.', 'Adds to compositeScore.', row.earned),
					max: leaf('Max pts', 'Signal cap.', 'Denominator.', row.max)
				};
			})
		: leaf('Signals array', 'Only when gbpExists — nine-signal model.', 'Empty when no listing.', data.signals);

	const gapDerivationExpl = {
		branch: leaf('Derivation branch', String(gd.branch), 'with_listing vs no_listing.', gd.branch),
		ctr: {
			positionOneCTR: leaf('#1 CTR benchmark', String(ctr.positionOneCTR), 'BENCHMARKS.positionOneCTR.', ctr.positionOneCTR),
			mapPackPosition: leaf(
				'Map pack slot used',
				'This API does not pass mapPackPosition — engine default 1.',
				'Chooses mapPackCTR.',
				ctr.mapPackPosition
			),
			positionCTR: leaf('CTR at slot', String(ctr.positionCTR), 'mapPackCTR[mapPackPosition].', ctr.positionCTR),
			minCtrFloor: leaf('CTR floor', String(ctr.minCtrFloor), 'BENCHMARKS.minCtrGapFloor.', ctr.minCtrFloor),
			ctrGap: leaf(
				'CTR gap',
				`max(positionOneCTR − positionCTR, floor) = ${ctr.ctrGap}.`,
				'Multiplied into monthly customers.',
				ctr.ctrGap
			)
		},
		...(exists
			? {
					gbp: {
						compositeScore: leaf('Composite', 'From signals.', 'Penalty input.', gbpPart.compositeScore),
						compositePenaltyRaw: leaf('Raw penalty', '(100−score)/100.', 'Before cap.', gbpPart.compositePenaltyRaw),
						appliedPenalty: leaf('Applied penalty', 'capped.', '1−throughput.', gbpPart.appliedPenalty),
						maxPenaltyCap: leaf('Cap', String(BENCHMARKS.gbpMaxPenaltyCap), 'Engine.', gbpPart.maxPenaltyCap),
						throughput: leaf('Throughput', '1 − appliedPenalty.', 'Demand through listing.', gbpPart.throughput)
					}
				}
			: {
					gbp: {
						noListingPenalty: leaf(
							'No listing penalty',
							`BENCHMARKS.gbpNoListingPenalty applied → ${/** @type {Record<string, unknown>} */ (gd.gbp).noListingPenalty}.`,
							'Throughput = 1 − this penalty.',
							/** @type {Record<string, unknown>} */ (gd.gbp).noListingPenalty
						),
						throughput: leaf(
							'Throughput',
							`1 − noListingPenalty = ${/** @type {Record<string, unknown>} */ (gd.gbp).throughput}.`,
							'Demand multiplier.',
							/** @type {Record<string, unknown>} */ (gd.gbp).throughput
						)
					}
				}),
		revenue: {
			scaledMonthlySearches: leaf(
				'Scaled monthly searches',
				`request.monthlySearches = ${monthly}.`,
				'Volume side of monthly customers.',
				rev.scaledMonthlySearches
			),
			monthlyCustomers: leaf(
				'Monthly customers',
				`${monthly} × ctrGap × throughput × retention × ${BENCHMARKS.callToPurchaseRate} ≈ ${rev.monthlyCustomers}.`,
				'× avgSale → monthly revenue.',
				rev.monthlyCustomers
			),
			monthlyRevenue: leaf(
				'Monthly revenue $',
				`monthlyCustomers × avgSaleValue (${avg}).`,
				'×12 → annual gap.',
				rev.monthlyRevenue
			),
			annualGapUnrounded: leaf('Annual before round', 'monthlyRevenue × 12.', 'Rounded to value.', rev.annualGapUnrounded),
			annualGapRounded: leaf('Annual rounded', 'Math.round(annual gap).', 'Same as data.value.', rev.annualGapRounded),
			avgSaleValue: leaf('Avg job $', `request.avgSaleValue = ${avg}.`, 'Revenue multiplier.', rev.avgSaleValue),
			siteRetentionRate: leaf(
				'Retention',
				howRet + ` → ${rev.siteRetentionRate}.`,
				'From PSI or explicit.',
				rev.siteRetentionRate
			),
			callToPurchaseRate: leaf(
				'Call conversion',
				String(BENCHMARKS.callToPurchaseRate),
				'BENCHMARKS.callToPurchaseRate.',
				rev.callToPurchaseRate
			),
			monthsPerYear: leaf('Months', '12.', 'Annualization.', rev.monthsPerYear)
		}
	};

	return {
		success: leaf(
			'Request succeeded',
			`calcGbpGap(gbp, monthlySearches=${monthly}, avgSaleValue=${avg}, years=${years}, retention from ${howRet}, vertical="${vert}"). Map pack position defaults to 1 in this route.`,
			'Same core as Layer 1 GBP gap before modifiers.',
			true
		),
		data: {
			value: leaf(
				'Annual GBP opportunity ($)',
				exists
					? `round(monthlyCustomers × 12) from gapDerivation.revenue; monthlyCustomers = ${monthly} × ctrGap × throughput × retention × ${BENCHMARKS.callToPurchaseRate}.`
					: `No listing branch: scaledMonthlySearches × ctrGap × (1−noListingPenalty) × retention × callToPurchase × avgSale × 12.`,
				'Headline dollar gap before Layer 1 tenure/economic/discount.',
				data.value
			),
			gbpExists: leaf(
				'Whether GBP had place_id',
				`request.gbp?.place_id present → ${data.gbpExists}.`,
				'Branches gapDerivation shape.',
				data.gbpExists
			),
			...(exists
				? {
						compositeScore: leaf(
							'Composite /100',
							`Sum of nine signals from request.gbp.`,
							'Feeds throughput in gapDerivation.gbp.',
							data.compositeScore
						)
					}
				: {}),
			appliedPenalty: leaf(
				'Penalty applied',
				exists ? `min((100−composite)/100, cap)` : `noListingPenalty constant path.`,
				'Reduces throughput.',
				data.appliedPenalty
			),
			...(exists ? { signals } : {}),
			...(exists && data.repairList != null
				? {
						repairList: leaf(
							'Repair list rows',
							'pointsLost × costPerPoint per weak signal.',
							'Prioritized fixes in UI.',
							data.repairList
						)
					}
				: {}),
			gapDerivation: gapDerivationExpl,
			detail: leaf(
				'Detail block',
				'status, score, pointsLost, repairList when listing exists.',
				'UI / traffic light.',
				data.detail
			)
		}
	};
}

function explainWeightedRankGap(res, req) {
	if (!res.success) return explainError(res, 'weighted-rank-gap', req);
	const data = /** @type {Record<string, unknown>} */ (res.data);
	const inputs = /** @type {Record<string, unknown>} */ (data.inputs || {});
	const hh = Number(inputs.households);
	const ret = Number(inputs.siteRetentionRate);
	const trades = Array.isArray(req.trades) ? req.trades : [];
	const city = String(req.city ?? '');
	const howHh =
		req.households != null
			? `request.households = ${req.households}`
			: `getCityHouseholds("${city}", 50000) → ${hh}`;
	const howRet =
		req.siteRetentionRate != null
			? `request.siteRetentionRate = ${req.siteRetentionRate}`
			: `getSiteRetentionRate(request.psiScore=${req.psiScore ?? 'default 100'}) → ${ret}`;
	const detail = /** @type {Record<string, unknown>} */ (data.detail || {});
	const tb = Array.isArray(detail.tradeBreakdown) ? detail.tradeBreakdown : [];
	const kb = Array.isArray(detail.keywordBreakdown) ? detail.keywordBreakdown : [];

	return {
		success: leaf(
			'Request succeeded',
			`${howHh}; ${howRet}; calcWeightedRankGap(trades×${trades.length}).`,
			'Layer 2 rank gap engine.',
			true
		),
		data: {
			value: leaf(
				'Total annual rank gap ($)',
				`Sum of each trade’s calcRankGap (weights informational today): ${data.value}.`,
				'Layer 2 headline.',
				data.value
			),
			displayValue: leaf(
				'Formatted $',
				'formatCurrency(value).',
				'Cards / PDFs.',
				data.displayValue
			),
			detail: {
				status: leaf(
					'Status bucket',
					`value thresholds → ${detail.status}.`,
					'Traffic light.',
					detail.status
				),
				avgPosition: leaf(
					'Average position number',
					'Mean of parseInt(position)||99 per keyword, averaged across trades.',
					'Summary stat — not dollars.',
					detail.avgPosition
				),
				tradeBreakdown: tb.map((t, i) => {
					const row = /** @type {Record<string, unknown>} */ (t);
					return {
						trade: leaf(
							`Trade ${i + 1}`,
							`request.trades[${i}].trade.`,
							'Seasonal divisor (HVAC vs default).',
							row.trade
						),
						weight: leaf(
							'Revenue % label',
							`request.trades[${i}].weightPct — display only; sum uses weight=1 in engine.`,
							'UI label.',
							row.weight
						),
						value: leaf(
							'Trade annual gap',
							`Sum of keyword annual gaps for this trade → ${row.value}.`,
							'Adds to total value.',
							row.value
						),
						weightedValue: leaf(
							'Same as value here',
							'Engine uses weight=1 per trade today.',
							'Matches value.',
							row.weightedValue
						)
					};
				}),
				keywordBreakdown: kb.map((row, i) => {
					const kw = /** @type {Record<string, unknown>} */ (row);
					return {
						keyword: leaf(
							`Keyword row ${i + 1}`,
							`From request.trades[].rank.keywords; keyword="${kw.keyword}".`,
							'One row in calcRankGap.',
							kw.keyword
						),
						position: leaf(
							'Map pack position',
							`position string "${kw.position}" → parseInt or 99.`,
							'mapPackCTR lookup.',
							kw.position
						),
						annualGap: leaf(
							'Annual $ this keyword',
							`scaledMonthlyVolume × ctrGap × ${ret} × ${BENCHMARKS.callToPurchaseRate} × avgSale × (12/seasonalDivisor).`,
							'Sums to trade value.',
							kw.annualGap
						),
						trade: leaf('Trade name', 'Which trade row.', 'Grouping.', kw.trade),
						weightedAnnualGap: leaf(
							'Weighted gap',
							'Same as annualGap with weight=1.',
							'Display.',
							kw.weightedAnnualGap
						)
					};
				}),
				keywords: leaf(
					'Alias of keywordBreakdown',
					'Engine copies keywordBreakdown to keywords.',
					'Debug.',
					detail.keywords
				)
			},
			inputs: {
				households: leaf(
					'Households used',
					`${howHh}.`,
					'cityScale = households / 73000 × 1.2 for volume.',
					inputs.households
				),
				siteRetentionRate: leaf(
					'Retention used',
					`${howRet}.`,
					'Multiplies every keyword monthly value.',
					inputs.siteRetentionRate
				),
				tradeCount: leaf(
					'Number of trades',
					`request.trades.length = ${inputs.tradeCount}.`,
					'Loop count.',
					inputs.tradeCount
				)
			}
		}
	};
}

function explainSearchVolume(res, req) {
	if (!res.success) return explainError(res, 'search-volume', req);
	const d = /** @type {Record<string, unknown>} */ (res.data);
	const trade = String(req.trade ?? '');
	const city = String(req.city ?? '');
	return {
		success: leaf(
			'Request succeeded',
			`fetchSearchVolume(request.trade="${trade}", request.city="${city}", DATAFORSEO_LOGIN/PASSWORD) — live Google Ads keyword layer.`,
			'Ad-hoc demand check before running full benchmark-volumes + city-households scaling.',
			true
		),
		data: {
			liveVolume: leaf(
				'Live volume payload',
				`Vendor JSON from DataForSEO for the combined keyword \`${trade} ${city}\` (search_volume + location).`,
				'Compare to `benchmark-volumes` Sudbury index pack when calibrating a single head term.',
				d.liveVolume
			),
			source: leaf(
				'Vendor tag',
				'Hard-coded `dataforseo` in this route.',
				'Support distinguishes live API from stubbed or cached numbers.',
				d.source
			),
			keyword: leaf(
				'Composite keyword label',
				`Built as \`\${request.trade} \${request.city}\` → "${d.keyword}".`,
				'Not used in math — mirrors what was sent to DataForSEO for the live pull.',
				d.keyword
			)
		}
	};
}

function explainPagespeed(res, req) {
	if (!res.success) return explainError(res, 'pagespeed', req);
	const d = /** @type {Record<string, unknown>} */ (res.data);
	const perf = d.performance;
	const sr = d.siteRetentionRate;
	const dataExplained = explainDiagnosticValue(d, ['pagespeed'], {
		diagnosticData: {},
		intakeInputs: {},
		_pagespeedUrl: req.url
	});
	return {
		success: leaf(
			'Request succeeded',
			`fetchPageSpeedLayer(url=${JSON.stringify(req.url)}, GOOGLE_PAGESPEED_API_KEY); then server adds siteRetentionRate = getSiteRetentionRate(performance=${perf}) → ${sr}.`,
			'Layer 2 pipeline; matches `POST /api/calc/pagespeed` in Postman.',
			true
		),
		data:
			typeof dataExplained === 'object' && dataExplained !== null && !Array.isArray(dataExplained)
				? {
						.../** @type {Record<string, unknown>} */ (dataExplained),
						siteRetentionRate: leaf(
							'Site retention (server-added)',
							`NOT from Google JSON — computed here: getSiteRetentionRate(${perf}) = ${sr}.`,
							'Same mapping as site-retention endpoint; feeds calcRankGap / calcGbpGap when passed through Layer 2.',
							sr
						),
						siteRetentionRatePct: leaf(
							'Retention percent string (server-added)',
							`Math.round(${sr} × 100) + '%' = ${d.siteRetentionRatePct}.`,
							'Display-only string next to gauges.',
							d.siteRetentionRatePct
						)
					}
				: dataExplained,
		...(res.error != null
			? {
					error: leaf(
						'Orchestrator warning',
						'fetchPageSpeedLayer returned `error` without throwing — partial PSI failure.',
						'Show warning; performance may be 0.',
						res.error
					)
				}
			: {})
	};
}

function explainRankLookup(res, req) {
	if (!res.success) return explainError(res, 'rank-lookup', req);
	const d = res.data;
	return {
		success: leaf(
			'Request succeeded',
			`fetchDataForSEORankLayer("${req.businessName}", "${req.trade}", "${req.city}", credentials).`,
			'Same rank object as Layer 2 pipeline.',
			true
		),
		data: explainDiagnosticValue(d, ['rank'], {
			diagnosticData: {},
			intakeInputs: {},
			_fakeRankLookup: {
				businessName: req.businessName,
				trade: req.trade,
				city: req.city
			}
		}),
		...(res.error != null
			? {
					error: leaf(
						'Orchestrator error',
						'Non-throwing error from fetchDataForSEORankLayer.',
						'Partial failure.',
						res.error
					)
				}
			: {})
	};
}

function explainGoogleIdentity(res, req) {
	if (!res.success) return explainError(res, 'google-identity', req);
	const mode = res.mode === 'full' ? 'fetchGoogleDetailsFull' : 'fetchGoogleDetailsLight';
	return {
		success: leaf(
			'Request succeeded',
			`${mode}(businessName="${req.businessName}", city="${req.city}", …).`,
			'Identity for downstream DataForSEO + gap.',
			true
		),
		mode: leaf(
			'Places mode',
			`request.mode === 'full' ? full : light → ${res.mode}.`,
			'full = richer GBP fields.',
			res.mode
		),
		data: explainDiagnosticValue(res.data, ['places'], {
			diagnosticData: {},
			intakeInputs: {},
			_googleIdentity: { request: req }
		})
	};
}

function explainDataforseoLayer(res, req) {
	if (!res.success) return explainError(res, 'dataforseo-layer', req);
	return {
		success: leaf(
			'Request succeeded',
			`fetchDataForSEOLayer("${req.identifier}", city="${req.city}", trade="${req.trade}", …).`,
			'Q&A + business_info + index volume sum.',
			true
		),
		data: explainDiagnosticValue(res.data, ['dataforseo'], {
			diagnosticData: {},
			intakeInputs: {},
			_dataforseoLayer: req
		})
	};
}

/** @type {Record<string, (res: Record<string, unknown>, req: Record<string, unknown>) => unknown>} */
const CALC_HANDLERS = {
	'site-retention': explainSiteRetention,
	'ranking-ctr': explainRankingCtr,
	'tenure-rate': explainTenureRate,
	'economic-rate': explainEconomicRate,
	modifiers: explainModifiers,
	'city-households': explainCityHouseholds,
	'benchmark-volumes': explainBenchmarkVolumes,
	'composite-score': explainCompositeScore,
	'gbp-gap': explainGbpGap,
	'weighted-rank-gap': explainWeightedRankGap,
	'search-volume': explainSearchVolume,
	pagespeed: explainPagespeed,
	'rank-lookup': explainRankLookup,
	'google-identity': explainGoogleIdentity,
	'dataforseo-layer': explainDataforseoLayer,
	diagnostic: explainDiagnostic
};

/**
 * @param {string} routeId
 * @param {Record<string, unknown>} responseBody
 * @param {Record<string, unknown>} requestBody
 * @returns {unknown | null}
 */
export function explainCalcRoute(routeId, responseBody, requestBody) {
	const fn = CALC_HANDLERS[routeId];
	if (!fn) return null;
	return fn(responseBody, requestBody || {});
}
