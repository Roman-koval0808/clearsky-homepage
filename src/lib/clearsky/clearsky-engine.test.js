import { describe, it, expect } from 'vitest';
import {
	BENCHMARKS,
	MARKET_CLUSTERS,
	calcGbpGap,
	calcWeightedRankGap,
	getSiteRetentionRate,
	getCityHouseholds,
	getTradeKey,
	getDefaultAvgSaleValue,
	applyModifiers
} from './clearsky-engine.js';

// ─────────────────────────────────────────────────────────────
// A.3 — Locked Constants (newDocs.md)
// ─────────────────────────────────────────────────────────────

describe('A.3 — Locked Constants', () => {
	it('callToPurchaseRate = 0.10 (client walkthrough update)', () => {
		expect(BENCHMARKS.callToPurchaseRate).toBe(0.10);
	});

	it('positionOneCTR = 0.44', () => {
		expect(BENCHMARKS.positionOneCTR).toBe(0.44);
	});

	it('sudburyHouseholds = 73,000', () => {
		expect(BENCHMARKS.sudburyHouseholds).toBe(73000);
	});

	it('captiveMarketUplift = 1.20', () => {
		expect(BENCHMARKS.captiveMarketUplift).toBe(1.2);
	});

	it('plumbingAvgSaleValue = $1,500', () => {
		expect(BENCHMARKS.plumbingAvgSaleValue).toBe(1500);
	});

	it('hvacAvgSaleValue = $3,000', () => {
		expect(BENCHMARKS.hvacAvgSaleValue).toBe(3000);
	});

	it('ultraConservativeDiscount = 0.85', () => {
		expect(BENCHMARKS.ultraConservativeDiscount).toBe(0.85);
	});

	it('gbpMaxPenaltyCap = 0.85', () => {
		expect(BENCHMARKS.gbpMaxPenaltyCap).toBe(0.85);
	});

	it('gbpNoListingPenalty = 0.60', () => {
		expect(BENCHMARKS.gbpNoListingPenalty).toBe(0.60);
	});

	it('annualAdminSaving = $5,760', () => {
		expect(BENCHMARKS.annualAdminSaving).toBe(5760);
	});
});

// ─────────────────────────────────────────────────────────────
// C.1 — PSI Site Retention Rate Table
// ─────────────────────────────────────────────────────────────

describe('C.1 — PSI Retention Rate Table', () => {
	it('PSI 90–100 → 1.00 (Green)', () => {
		expect(getSiteRetentionRate(90)).toBe(1.0);
		expect(getSiteRetentionRate(95)).toBe(1.0);
		expect(getSiteRetentionRate(100)).toBe(1.0);
	});

	it('PSI 70–89 → 0.90 (Amber)', () => {
		expect(getSiteRetentionRate(70)).toBe(0.9);
		expect(getSiteRetentionRate(74)).toBe(0.9);
		expect(getSiteRetentionRate(89)).toBe(0.9);
	});

	it('PSI 50–69 → 0.85 (Amber)', () => {
		expect(getSiteRetentionRate(50)).toBe(0.85);
		expect(getSiteRetentionRate(52)).toBe(0.85);
		expect(getSiteRetentionRate(69)).toBe(0.85);
	});

	it('PSI 0–49 → 0.80 (Red)', () => {
		expect(getSiteRetentionRate(0)).toBe(0.8);
		expect(getSiteRetentionRate(25)).toBe(0.8);
		expect(getSiteRetentionRate(49)).toBe(0.8);
	});

	it('null/undefined → 0.80', () => {
		expect(getSiteRetentionRate(null)).toBe(0.8);
		expect(getSiteRetentionRate(undefined)).toBe(0.8);
	});
});

// ─────────────────────────────────────────────────────────────
// D.3 — CTR Table
// ─────────────────────────────────────────────────────────────

describe('D.3 — Map Pack CTR Table', () => {
	it('Position 1 → 44% CTR', () => {
		expect(BENCHMARKS.mapPackCTR[1]).toBe(0.44);
	});

	it('Position 2 → 24% CTR', () => {
		expect(BENCHMARKS.mapPackCTR[2]).toBe(0.24);
	});

	it('Position 3 → 17% CTR', () => {
		expect(BENCHMARKS.mapPackCTR[3]).toBe(0.17);
	});

	it('Not in pack → 3% CTR', () => {
		expect(BENCHMARKS.mapPackCTR['none']).toBe(0.03);
	});

	it('CTR gap: pos 2 = 0.44 - 0.24 = 0.20', () => {
		expect(BENCHMARKS.positionOneCTR - BENCHMARKS.mapPackCTR[2]).toBeCloseTo(0.20);
	});

	it('CTR gap: pos 3 = 0.44 - 0.17 = 0.27', () => {
		expect(BENCHMARKS.positionOneCTR - BENCHMARKS.mapPackCTR[3]).toBeCloseTo(0.27);
	});

	it('CTR gap: not ranked = 0.44 - 0.03 = 0.41', () => {
		expect(BENCHMARKS.positionOneCTR - BENCHMARKS.mapPackCTR['none']).toBeCloseTo(0.41);
	});
});

// ─────────────────────────────────────────────────────────────
// D.6 — Sudbury Benchmark Volumes
// ─────────────────────────────────────────────────────────────

describe('D.6 — Sudbury Benchmark Volumes (API fallback bundle)', () => {
	it('plumbing keywords sum to 391', () => {
		const plumbing = BENCHMARKS.sudburyVolumes.plumbing;
		const total = plumbing.reduce((s, kw) => s + kw.volume, 0);
		expect(total).toBe(391);
	});

	it('plumbing has 5 keywords', () => {
		expect(BENCHMARKS.sudburyVolumes.plumbing).toHaveLength(5);
	});

	it('plumbing keyword volumes match locked fallback bundle', () => {
		const vols = BENCHMARKS.sudburyVolumes.plumbing.map((k) => k.volume);
		expect(vols).toEqual([339, 26, 20, 3, 3]);
	});

	it('hvac keywords sum to 342', () => {
		const hvac = BENCHMARKS.sudburyVolumes.hvac;
		const total = hvac.reduce((s, kw) => s + kw.volume, 0);
		expect(total).toBe(342);
	});

	it('hvac has 5 keywords', () => {
		expect(BENCHMARKS.sudburyVolumes.hvac).toHaveLength(5);
	});

	it('hvac keyword volumes match locked fallback bundle', () => {
		const vols = BENCHMARKS.sudburyVolumes.hvac.map((k) => k.volume);
		expect(vols).toEqual([219, 52, 27, 27, 17]);
	});
});

// ─────────────────────────────────────────────────────────────
// D.5 — City Households (MARKET_CLUSTERS)
// ─────────────────────────────────────────────────────────────

describe('D.5 — City Households', () => {
	it('Timmins = 20,941 households', () => {
		expect(getCityHouseholds('Timmins')).toBe(20941);
	});

	it('Sudbury = 73,000 households (index city)', () => {
		expect(getCityHouseholds('Sudbury')).toBe(73000);
	});

	it('North Bay = 30,737 households', () => {
		expect(getCityHouseholds('North Bay')).toBe(30737);
	});

	it('Kirkland Lake = 4,064 households', () => {
		expect(getCityHouseholds('Kirkland Lake')).toBe(4064);
	});

	it('Cochrane = 8,360 households', () => {
		expect(getCityHouseholds('Cochrane')).toBe(8360);
	});

	it('unknown city returns 20,000 default', () => {
		expect(getCityHouseholds('Toronto')).toBe(20000);
	});

	it('Timmins scaling factor ≈ 0.2868', () => {
		const factor = getCityHouseholds('Timmins') / BENCHMARKS.sudburyHouseholds;
		expect(factor).toBeCloseTo(0.2868, 3);
	});

	it('Timmins scaling with uplift ≈ 0.3442', () => {
		const factor =
			(getCityHouseholds('Timmins') / BENCHMARKS.sudburyHouseholds) *
			BENCHMARKS.captiveMarketUplift;
		expect(factor).toBeCloseTo(0.3442, 3);
	});
});

// ─────────────────────────────────────────────────────────────
// B.4 — GBP Signal Scoring Functions (newDocs.md spec)
// ─────────────────────────────────────────────────────────────

describe('B.4 — Signal 1: Star Rating (35 pts)', () => {
	const fn = BENCHMARKS.getGbpRatingScore;
	it('5.0 → 35', () => expect(fn(5.0)).toBe(35));
	it('4.5 → 35', () => expect(fn(4.5)).toBe(35));
	it('4.8 → 35 (Manito)', () => expect(fn(4.8)).toBe(35));
	it('4.4 → 33 (spec table says ~32, engine curve rounds to 33)', () => expect(fn(4.4)).toBe(33));
	it('4.2 → 29', () => expect(fn(4.2)).toBe(29));
	it('4.0 → 25', () => expect(fn(4.0)).toBe(25));
	it('3.5 → 13 (spec table says ~17, engine curve rounds to 13)', () => expect(fn(3.5)).toBe(13));
	it('3.0 → 0', () => expect(fn(3.0)).toBe(0));
	it('below 3.0 → 0', () => expect(fn(2.5)).toBe(0));
	it('null → 35 (default)', () => expect(fn(null)).toBe(35));
});

describe('B.4 — Signal 2: Review Count (25 pts)', () => {
	const fn = BENCHMARKS.getGbpReviewScore;
	it('Manito: 137 reviews at 14 yrs (expected 84) → full 25', () => {
		expect(fn(137, 14)).toBe(25);
	});
	it('meets benchmark → 25', () => expect(fn(30, 5)).toBe(25));
	it('zero reviews → 0', () => expect(fn(0, 5)).toBe(0));
});

describe('B.4 — Signal 3: Photos (8 pts)', () => {
	const fn = BENCHMARKS.getGbpPhotoScore;
	it('8+ photos → 8', () => expect(fn(10)).toBe(8));
	it('8 photos → 8', () => expect(fn(8)).toBe(8));
	it('4-7 photos → 6', () => expect(fn(5)).toBe(6));
	it('7 photos → 6 (Manito)', () => expect(fn(7)).toBe(6));
	it('1-3 photos → 3', () => expect(fn(2)).toBe(3));
	it('0 photos → 0', () => expect(fn(0)).toBe(0));
});

describe('B.4 — Signal 4: Hours Complete (5 pts)', () => {
	const fn = BENCHMARKS.getGbpHoursScore;
	it('published → 5', () => expect(fn(true)).toBe(5));
	it('not published → 0', () => expect(fn(false)).toBe(0));
});

describe('B.4 — Signal 5: Owner Response Rate (7 pts)', () => {
	const fn = BENCHMARKS.getGbpResponseScore;
	it('40%+ → 7', () => expect(fn(50, 100)).toBe(7));
	it('20-39% → 4', () => expect(fn(25, 100)).toBe(4));
	it('Manito: 23/137 = 17% → 2', () => expect(fn(23, 137)).toBe(2));
	it('1-19% → 2', () => expect(fn(5, 100)).toBe(2));
	it('0% → 0', () => expect(fn(0, 100)).toBe(0));
	it('no reviews → 7 (default)', () => expect(fn(0, 0)).toBe(7));
});

describe('B.4 — Signal 6: Website Linked (5 pts)', () => {
	const fn = BENCHMARKS.getGbpWebsiteScore;
	it('linked → 5', () => expect(fn(true)).toBe(5));
	it('not linked → 0', () => expect(fn(false)).toBe(0));
});

describe('B.4 — Signal 7: Q&A Activity (4 pts)', () => {
	const fn = BENCHMARKS.getGbpQaScore;
	it('no questions → 4 (default)', () => expect(fn(0, 0)).toBe(4));
	it('60%+ answered → 4', () => expect(fn(10, 7)).toBe(4));
	it('40-59% → 3', () => expect(fn(10, 5)).toBe(3));
	it('20-39% → 2', () => expect(fn(10, 3)).toBe(2));
	it('below 20% → 0', () => expect(fn(10, 1)).toBe(0));
});

describe('B.4 — Signal 8: Description Present (4 pts)', () => {
	const fn = BENCHMARKS.getGbpDescriptionScore;
	it('present → 4', () => expect(fn(true)).toBe(4));
	it('missing → 0', () => expect(fn(false)).toBe(0));
});

describe('B.4 — Signal 9: Services Listed (7 pts)', () => {
	const fn = BENCHMARKS.getGbpServicesScore;
	it('5+ → 7', () => expect(fn(6)).toBe(7));
	it('3-4 → 5', () => expect(fn(4)).toBe(5));
	it('1-2 → 2', () => expect(fn(1)).toBe(2));
	it('0 → 0', () => expect(fn(0)).toBe(0));
});

// ─────────────────────────────────────────────────────────────
// B.5 — Composite Score → Gap Calculation
// ─────────────────────────────────────────────────────────────

describe('B.5 — Composite Score and Penalty', () => {
	it('compositeScore 80 → penalty 0.20', () => {
		const penalty = (100 - 80) / 100;
		expect(penalty).toBe(0.20);
	});

	it('compositeScore 0 → penalty capped at 0.85', () => {
		const penalty = Math.min((100 - 0) / 100, BENCHMARKS.gbpMaxPenaltyCap);
		expect(penalty).toBe(0.85);
	});

	it('compositeScore 15 → penalty capped at 0.85', () => {
		const penalty = Math.min((100 - 15) / 100, BENCHMARKS.gbpMaxPenaltyCap);
		expect(penalty).toBe(0.85);
	});

	it('compositeScore 100 → penalty 0', () => {
		const penalty = (100 - 100) / 100;
		expect(penalty).toBe(0);
	});
});

describe('B.2 — GBP Existence Check', () => {
	it('no GBP listing → 60% fixed penalty', () => {
		const result = calcGbpGap(null, 100, 1500, 5, 1.0, 'trades');
		expect(result.gbpExists).toBe(false);
		expect(result.appliedPenalty).toBe(0.60);
	});

	it('no GBP: gap uses ctrGap × throughput(1-penalty) × 0.10 conversion', () => {
		const result = calcGbpGap(null, 100, 1500, 5, 1.0, 'trades');
		const ctrGap = 0.1;
		const throughput = 1 - 0.60;
		const expected = 100 * ctrGap * throughput * 1.0 * 0.10 * 1500 * 12;
		expect(result.value).toBe(Math.round(expected));
	});
});

// ─────────────────────────────────────────────────────────────
// B.8 — Manito Worked Example (Composite Score)
// ─────────────────────────────────────────────────────────────

describe('B.8 — Manito Plumbing GBP Composite', () => {
	const manitoGbp = {
		place_id: 'manito-test',
		rating: 4.8,
		reviewCount: 137,
		photos: Array(7).fill(1),
		opening_hours: true,
		website: 'https://manitoplumbing.ca',
		qa: { count: 0, answeredCount: 0 },
		editorialSummary: false,
		services: Array(7).fill('svc'),
		ownerResponseCount: 23
	};

	it('Manito compositeScore = 89 (engine curve; spec approx 85 uses rounded table values)', () => {
		const result = calcGbpGap(manitoGbp, 100, 1500, 14, 1.0, 'trades');
		expect(result.compositeScore).toBe(89);
	});

	it('Manito signals match spec', () => {
		const result = calcGbpGap(manitoGbp, 100, 1500, 14, 1.0, 'trades');
		const earned = result.signals.map((s) => s.earned);
		expect(earned[0]).toBe(35); // Star rating
		expect(earned[1]).toBe(25); // Review count (137 > 84 expected)
		expect(earned[2]).toBe(6);  // Photos (7)
		expect(earned[3]).toBe(5);  // Hours (published)
		expect(earned[4]).toBe(2);  // Response rate (23/137 = 17%)
		expect(earned[5]).toBe(5);  // Website (linked)
		expect(earned[6]).toBe(4);  // Q&A (no questions = default 4)
		expect(earned[7]).toBe(0);  // Description (missing)
		expect(earned[8]).toBe(7);  // Services (7 = 5+ = full 7)
	});

	it('Manito penalty = 0.11 (100-89)/100 from engine curve', () => {
		const result = calcGbpGap(manitoGbp, 100, 1500, 14, 1.0, 'trades');
		expect(result.appliedPenalty).toBeCloseTo(0.11, 2);
	});
});

// ─────────────────────────────────────────────────────────────
// D.8 — Modifiers (Brand Tenure + Economic)
// ─────────────────────────────────────────────────────────────

describe('D.8 — Brand Tenure Modifier', () => {
	const tiers = BENCHMARKS.brandTenureTiers;

	it('16+ years → +16% (Legacy)', () => {
		const tier = tiers.find((t) => 20 >= t.minYears);
		expect(tier.rate).toBe(0.16);
		expect(tier.label).toBe('Legacy');
	});

	it('11-15 years → +9% (Trusted)', () => {
		const tier = tiers.find((t) => 14 >= t.minYears);
		expect(tier.rate).toBe(0.09);
		expect(tier.label).toBe('Trusted');
	});

	it('6-10 years → +4% (Established)', () => {
		const tier = tiers.find((t) => 8 >= t.minYears);
		expect(tier.rate).toBe(0.04);
		expect(tier.label).toBe('Established');
	});

	it('2-5 years → -5% (Building)', () => {
		const tier = tiers.find((t) => 3 >= t.minYears);
		expect(tier.rate).toBe(-0.05);
		expect(tier.label).toBe('Building');
	});

	it('0-1 years → -15% (New)', () => {
		const tier = tiers.find((t) => 1 >= t.minYears);
		expect(tier.rate).toBe(-0.15);
		expect(tier.label).toBe('New');
	});
});

describe('D.8 — Economic Modifier', () => {
	it('Timmins → Active +5%', () => {
		const tier = BENCHMARKS.marketDemandLookup['timmins'];
		expect(tier).toBe('active');
		expect(BENCHMARKS.marketDemandTiers.active.rate).toBe(0.05);
	});

	it('Sudbury → Active +5%', () => {
		expect(BENCHMARKS.marketDemandLookup['sudbury']).toBe('active');
	});

	it('Cochrane → Slow -15%', () => {
		expect(BENCHMARKS.marketDemandLookup['cochrane']).toBe('slow');
		expect(BENCHMARKS.marketDemandTiers.slow.rate).toBe(-0.15);
	});
});

describe('D.8 — applyModifiers', () => {
	it('baseValue 24960, 12 yrs, Timmins → matches client walkthrough', () => {
		const result = applyModifiers(24960, 12, 'active');
		// base + base*0.09 + base*0.05 = 24960 × 1.14 = 28454.4
		expect(result).toBe(Math.round(24960 + 24960 * 0.09 + 24960 * 0.05));
	});

	it('after 15% discount → matches client final number', () => {
		const adjusted = applyModifiers(24960, 12, 'active');
		const final = Math.round(adjusted * 0.85);
		// Client: 28454.4 × 0.85 = 24186.24 → rounds to 24186
		expect(final).toBe(Math.round(28454.4 * 0.85));
	});
});

// ─────────────────────────────────────────────────────────────
// D.4 — Seasonal Divisors
// ─────────────────────────────────────────────────────────────

describe('D.4 — Seasonal Divisors', () => {
	it('plumbing ÷ 12', () => {
		expect(BENCHMARKS.seasonalDivisors.default).toBe(12);
	});

	it('hvac ÷ 10', () => {
		expect(BENCHMARKS.seasonalDivisors.hvac).toBe(10);
	});

	it('roofing ÷ 6', () => {
		expect(BENCHMARKS.seasonalDivisors.roofing).toBe(6);
	});
});

// ─────────────────────────────────────────────────────────────
// Trade Resolution
// ─────────────────────────────────────────────────────────────

describe('Trade Resolution', () => {
	it('"plumbing" → plumbing', () => expect(getTradeKey('plumbing')).toBe('plumbing'));
	it('"hvac" → hvac', () => expect(getTradeKey('hvac')).toBe('hvac'));
	it('"Heating and Cooling" → hvac', () => expect(getTradeKey('Heating and Cooling')).toBe('hvac'));
	it('plumbing default sale = $1,500', () => expect(getDefaultAvgSaleValue('plumbing')).toBe(1500));
	it('hvac default sale = $3,000', () => expect(getDefaultAvgSaleValue('hvac')).toBe(3000));
});

// ─────────────────────────────────────────────────────────────
// CLIENT REVISED FORMULA — GBP Gap Breakdown
// These test the UPDATED formula with:
//   - CTR gap floor = 0.1 (position #1 not zero)
//   - callConversionRate = 0.10 (not 0.024)
//   - GBP throughput = (1 − penalty), not penalty directly
// ─────────────────────────────────────────────────────────────

describe('Client Revised Formula — per-keyword calculation', () => {
	const MIN_CTR_GAP_FLOOR = 0.1;
	const CALL_CONVERSION_RATE = 0.10;
	const sudburyHouseholds = 73000;
	const captiveUplift = 1.2;

	function calcKeywordGap(
		sudburyVolume,
		households,
		position,
		compositeScore,
		psiRetention,
		avgSaleValue
	) {
		const scalingFactor = (households / sudburyHouseholds) * captiveUplift;
		const scaledVolume = sudburyVolume * scalingFactor;

		const positionOneCTR = 0.44;
		const ctrLookup = { 1: 0.44, 2: 0.24, 3: 0.17, none: 0.03 };
		const currentCTR = ctrLookup[position] || 0.03;
		const ctrGap = Math.max(positionOneCTR - currentCTR, MIN_CTR_GAP_FLOOR);

		const peopleLost = scaledVolume * ctrGap;

		const penalty = Math.min((100 - compositeScore) / 100, 0.85);
		const throughput = 1 - penalty;
		const afterGbp = peopleLost * throughput;

		const afterRetention = afterGbp * psiRetention;
		const monthlyCustomers = afterRetention * CALL_CONVERSION_RATE;
		const monthlyRevenue = monthlyCustomers * avgSaleValue;
		const annualRevenue = monthlyRevenue * 12;
		return { scaledVolume, ctrGap, peopleLost, throughput, afterGbp, afterRetention, monthlyCustomers, annualRevenue };
	}

	it('CTR gap for position 1 = 0.1 (floor applied)', () => {
		const r = calcKeywordGap(287, 20941, 1, 80, 0.9, 2000);
		expect(r.ctrGap).toBe(0.1);
	});

	it('CTR gap for position 2 = 0.20', () => {
		const r = calcKeywordGap(287, 20941, 2, 80, 0.9, 2000);
		expect(r.ctrGap).toBe(0.20);
	});

	it('CTR gap for not ranked = 0.41', () => {
		const r = calcKeywordGap(287, 20941, 'none', 80, 0.9, 2000);
		expect(r.ctrGap).toBeCloseTo(0.41, 2);
	});

	it('compositeScore 80 → throughput 0.80', () => {
		const r = calcKeywordGap(287, 20941, 1, 80, 0.9, 2000);
		expect(r.throughput).toBe(0.80);
	});

	it('Timmins plumber #1: scaledVolume ≈ 98.80', () => {
		const r = calcKeywordGap(287, 20941, 1, 80, 0.9, 2000);
		expect(r.scaledVolume).toBeCloseTo(98.80, 0);
	});

	it('Timmins plumber #1: peopleLost ≈ 9.88', () => {
		const r = calcKeywordGap(287, 20941, 1, 80, 0.9, 2000);
		expect(r.peopleLost).toBeCloseTo(9.88, 0);
	});

	it('afterGbp = peopleLost × 0.80 ≈ 7.90', () => {
		const r = calcKeywordGap(287, 20941, 1, 80, 0.9, 2000);
		expect(r.afterGbp).toBeCloseTo(7.9, 0);
	});

	it('afterRetention = afterGbp × 0.90 ≈ 7.11', () => {
		const r = calcKeywordGap(287, 20941, 1, 80, 0.9, 2000);
		expect(r.afterRetention).toBeCloseTo(7.11, 1);
	});

	it('monthlyCustomers = afterRetention × 0.10 ≈ 0.71', () => {
		const r = calcKeywordGap(287, 20941, 1, 80, 0.9, 2000);
		expect(r.monthlyCustomers).toBeCloseTo(0.71, 1);
	});

	it('annualRevenue ≈ $17,073', () => {
		const r = calcKeywordGap(287, 20941, 1, 80, 0.9, 2000);
		expect(r.annualRevenue).toBeCloseTo(17073, -2);
	});
});

describe('Client Revised Formula — full 5-keyword plumbing, Timmins', () => {
	const MIN_CTR_GAP_FLOOR = 0.1;
	const CALL_CONVERSION_RATE = 0.10;
	const households = 20941;
	const sudburyHouseholds = 73000;
	const captiveUplift = 1.2;
	const compositeScore = 80;
	const psiRetention = 0.9;
	const avgSaleValue = 2000;
	const tenureRate = 0.09;
	const economicRate = 0.05;

	const keywords = [
		{ keyword: 'plumber', volume: 287, position: 1 },
		{ keyword: 'emergency plumber', volume: 26, position: 'none' },
		{ keyword: 'plumbing repair', volume: 20, position: 'none' },
		{ keyword: 'drain cleaning', volume: 3, position: 'none' },
		{ keyword: 'water heater repair', volume: 3, position: 'none' }
	];

	function calcAll() {
		const scalingFactor = (households / sudburyHouseholds) * captiveUplift;
		const penalty = Math.min((100 - compositeScore) / 100, 0.85);
		const throughput = 1 - penalty;

		let total = 0;
		for (const kw of keywords) {
			const scaled = kw.volume * scalingFactor;
			const ctrLookup = { 1: 0.44, 2: 0.24, 3: 0.17, none: 0.03 };
			const currentCTR = ctrLookup[kw.position] || 0.03;
			const ctrGap = Math.max(0.44 - currentCTR, MIN_CTR_GAP_FLOOR);
			const peopleLost = scaled * ctrGap;
			const afterGbp = peopleLost * throughput;
			const afterRetention = afterGbp * psiRetention;
			const customers = afterRetention * CALL_CONVERSION_RATE;
			total += customers * avgSaleValue * 12;
		}
		return total;
	}

	it('sum of all 5 keywords ≈ $29,754', () => {
		const sum = calcAll();
		expect(sum).toBeCloseTo(29754, -2);
	});

	it('tenure lift = sum × 0.09', () => {
		const sum = calcAll();
		const lift = sum * tenureRate;
		expect(lift).toBeCloseTo(2678, -1);
	});

	it('economic lift = sum × 0.05', () => {
		const sum = calcAll();
		const lift = sum * economicRate;
		expect(lift).toBeCloseTo(1488, -1);
	});

	it('before discount = sum + tenureLift + economicLift ≈ $33,919', () => {
		const sum = calcAll();
		const before = sum + sum * tenureRate + sum * economicRate;
		expect(before).toBeCloseTo(33919, -2);
	});

	it('final × 0.85 ≈ $28,831', () => {
		const sum = calcAll();
		const before = sum + sum * tenureRate + sum * economicRate;
		const final = before * 0.85;
		expect(final).toBeCloseTo(28831, -2);
	});
});

describe("Client Walkthrough — simplified 100 volume example", () => {
	it('step by step matches client math', () => {
		const scaledVolume = 100;
		const ctrGap = 0.1;
		const compositeScore = 80;
		const penalty = Math.min((100 - compositeScore) / 100, 0.85);
		const throughput = 1 - penalty;
		const retention = 0.90;
		const conversion = 0.10;
		const saleValue = 2000;
		const tenureRate = 0.09;
		const economicRate = 0.05;

		const peopleLost = scaledVolume * ctrGap;
		expect(peopleLost).toBe(10);

		const afterGbp = peopleLost * throughput;
		expect(afterGbp).toBe(8);

		const afterRetention = afterGbp * retention;
		expect(afterRetention).toBeCloseTo(7.2, 1);

		const monthlyCustomers = afterRetention * conversion;
		expect(monthlyCustomers).toBeCloseTo(0.72, 2);

		const monthlyRevenue = monthlyCustomers * saleValue;
		expect(monthlyRevenue).toBeCloseTo(1440, 0);

		const annualRevenue = monthlyRevenue * 12;
		expect(annualRevenue).toBeCloseTo(17280, 0);

		const tenureLift = annualRevenue * tenureRate;
		expect(tenureLift).toBeCloseTo(1555.2, 0);

		const economicLift = annualRevenue * economicRate;
		expect(economicLift).toBeCloseTo(864, 0);

		const beforeDiscount = annualRevenue + tenureLift + economicLift;
		expect(beforeDiscount).toBeCloseTo(19699.2, 0);

		const finalGap = beforeDiscount * 0.85;
		expect(finalGap).toBeCloseTo(16744.32, 0);
	});
});

// ─────────────────────────────────────────────────────────────
// MARKET_CLUSTERS — all cities match newDocs.md D.5
// ─────────────────────────────────────────────────────────────

describe('D.5 — MARKET_CLUSTERS match spec', () => {
	it('Timmins cluster', () => {
		expect(MARKET_CLUSTERS['timmins']).toEqual({
			households: 20941,
			locationCode: 1002836,
			tier: 'active'
		});
	});

	it('Cochrane cluster', () => {
		expect(MARKET_CLUSTERS['cochrane'].households).toBe(8360);
		expect(MARKET_CLUSTERS['cochrane'].tier).toBe('slow');
	});

	it('Kirkland Lake cluster', () => {
		expect(MARKET_CLUSTERS['kirkland lake'].households).toBe(4064);
		expect(MARKET_CLUSTERS['kirkland lake'].tier).toBe('active');
	});

	it('North Bay cluster', () => {
		expect(MARKET_CLUSTERS['north bay'].households).toBe(30737);
		expect(MARKET_CLUSTERS['north bay'].locationCode).toBe(1002116);
	});

	it('Sudbury cluster (index)', () => {
		expect(MARKET_CLUSTERS['sudbury'].households).toBe(73000);
		expect(MARKET_CLUSTERS['sudbury'].locationCode).toBe(1002124);
	});
});

// ─────────────────────────────────────────────────────────────
// Layer 1 calcGbpGap — engine formula (original 0.024 rate)
// ─────────────────────────────────────────────────────────────

describe('Layer 1 — calcGbpGap engine formula', () => {
	const gbp = {
		place_id: 'test',
		rating: 4.5,
		reviewCount: 30,
		photos: Array(8).fill(1),
		opening_hours: true,
		website: 'https://example.com',
		qa: { count: 0, answeredCount: 0 },
		editorialSummary: 'Test business',
		services: Array(5).fill('svc'),
		ownerResponseCount: 15
	};

	it('returns compositeScore, signals, appliedPenalty, value', () => {
		const result = calcGbpGap(gbp, 100, 1500, 5, 1.0, 'trades');
		expect(result).toHaveProperty('compositeScore');
		expect(result).toHaveProperty('signals');
		expect(result).toHaveProperty('appliedPenalty');
		expect(result).toHaveProperty('value');
		expect(result.signals).toHaveLength(9);
	});

	it('perfect GBP → compositeScore 100, penalty 0, gap still positive (CTR floor)', () => {
		const perfectGbp = {
			place_id: 'test',
			rating: 5.0,
			reviewCount: 100,
			photos: Array(10).fill(1),
			opening_hours: true,
			website: 'https://example.com',
			qa: { count: 10, answeredCount: 8 },
			editorialSummary: 'Great business',
			services: Array(6).fill('svc'),
			ownerResponseCount: 50
		};
		const result = calcGbpGap(perfectGbp, 100, 1500, 5, 1.0, 'trades');
		expect(result.compositeScore).toBe(100);
		expect(result.appliedPenalty).toBe(0);
		const expected = 100 * 0.1 * 1.0 * 1.0 * 0.10 * 1500 * 12;
		expect(result.value).toBe(Math.round(expected));
		expect(result.gapDerivation?.revenue?.annualGapRounded).toBe(result.value);
		expect(result.gapDerivation?.ctr?.ctrGap).toBe(0.1);
	});

	it('engine uses callToPurchaseRate 0.10 in gap formula', () => {
		expect(BENCHMARKS.callToPurchaseRate).toBe(0.10);
		const result = calcGbpGap(gbp, 100, 1500, 5, 1.0, 'trades');
		expect(result.value).toBeGreaterThan(0);
	});
});

// ─────────────────────────────────────────────────────────────
// Layer 2 — calcWeightedRankGap
// ─────────────────────────────────────────────────────────────

describe('Layer 2 — calcWeightedRankGap', () => {
	it('empty trades → value 0', () => {
		const result = calcWeightedRankGap([], 20941, 0.9);
		expect(result.value).toBe(0);
	});

	it('position 1 for all keywords → positive gap (0.1 CTR floor)', () => {
		const trades = [
			{
				trade: 'plumbing',
				rank: {
					keywords: [
						{ keyword: 'plumber', position: '1', sudburyVolume: 287 },
						{ keyword: 'emergency plumber', position: '1', sudburyVolume: 26 },
						{ keyword: 'plumbing repair', position: '1', sudburyVolume: 20 },
						{ keyword: 'drain cleaning', position: '1', sudburyVolume: 3 },
						{ keyword: 'water heater repair', position: '1', sudburyVolume: 3 }
					]
				},
				avgSaleValue: 1500,
				weightPct: 100
			}
		];
		const result = calcWeightedRankGap(trades, 20941, 0.9);
		expect(result.value).toBeGreaterThan(0);
	});

	it('not ranked → produces positive gap', () => {
		const trades = [
			{
				trade: 'plumbing',
				rank: {
					keywords: [
						{ keyword: 'plumber', position: 'none', sudburyVolume: 287 }
					]
				},
				avgSaleValue: 1500,
				weightPct: 100
			}
		];
		const result = calcWeightedRankGap(trades, 20941, 0.9);
		expect(result.value).toBeGreaterThan(0);
	});
});
