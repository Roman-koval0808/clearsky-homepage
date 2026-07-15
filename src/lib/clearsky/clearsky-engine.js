/**
 * ClearSky Software -- Digital Health Diagnostic
 * Revenue Gap Calculation Engine v1.0
 *
 * This module takes the complete diagnosticData object assembled from all
 * API layers and returns a fully calculated results object ready for the
 * frontend to render.
 *
 * All benchmarks are sourced -- see clearsky-diagnostic-spec.docx for citations.
 *
 * Usage:
 *   const { calculateDiagnostic } = require('./clearsky-engine');
 *   const results = calculateDiagnostic(diagnosticData);
 */

'use strict';

// ─────────────────────────────────────────────────────────────
// BENCHMARK CONSTANTS -- all sourced, do not adjust without citation
// ─────────────────────────────────────────────────────────────

const BENCHMARKS = {
	// Map Pack CTR by position -- BrightLocal / Local SEO Guide
	mapPackCTR: { 1: 0.44, 2: 0.24, 3: 0.17, none: 0.03, organic1: 0.03 },

	// GBP star rating CTR penalty vs 4.5-star baseline -- BrightLocal 2026
	gbpCtrPenalty: {
		high: { min: 4.5, max: 5.0, penalty: 0.0 }, // baseline
		good: { min: 4.0, max: 4.4, penalty: 0.18 },
		low: { min: 3.5, max: 3.9, penalty: 0.31 },
		poor: { min: 3.0, max: 3.4, penalty: 0.44 },
		bad: { min: 0.0, max: 2.9, penalty: 0.6 }
	},

	// Review count credibility threshold -- BrightLocal local consumer research
	reviewCredibilityThreshold: 25,
	reviewCredibilityPenalty: 0.15, // additional CTR penalty below threshold

	// Citation benchmarks -- BrightLocal 2024 local citation study
	citationBenchmark: 40,
	citationMultipliers: [
		{ max: 9, multiplier: 1.28 },
		{ max: 24, multiplier: 1.19 },
		{ max: 39, multiplier: 1.1 },
		{ max: Infinity, multiplier: 1.0 }
	],
	napMismatchMultiplier: 1.08,
	schemaAbsentAiMultiplier: 1.12, // applied to AI visibility risk multiplier

	// Lighthouse performance score to conversion rate -- Portent Page Speed Study 2024
	lighthouseConversionRates: [
		{ minScore: 90, convRate: 0.39 },
		{ minScore: 70, convRate: 0.31 },
		{ minScore: 50, convRate: 0.22 },
		{ minScore: 0, convRate: 0.16 }
	],

	// --- SESSION 18 LOCKED CONSTANTS (updated per client walkthrough) ---
	callToPurchaseRate: 0.10,
	positionOneCTR: 0.44,
	minCtrGapFloor: 0.1,
	clickToCallRate: 0.06,
	sudburyHouseholds: 73000,
	captiveMarketUplift: 1.2,
	plumbingAvgSaleValue: 1500,
	hvacAvgSaleValue: 3000,
	ultraConservativeDiscount: 0.85,
	gbpMaxPenaltyCap: 0.85,
	gbpNoListingPenalty: 0.60,

	// --- ADMIN SAVINGS (SESSION 15/18) ---
	adminHoursPerYear: 480,
	annualAdminSaving: 5760, // 480 × 0.40 × $30. Same for every business.

	// --- TRADES FALLBACK (SUDBURY VOLUMES - D.6) ---
	sudburyVolumes: {
		plumbing: [
			{ keyword: 'plumber', volume: 339 },
			{ keyword: 'emergency plumber', volume: 26 },
			{ keyword: 'plumbing repair', volume: 20 },
			{ keyword: 'drain cleaning', volume: 3 },
			{ keyword: 'water heater repair', volume: 3 }
		],
		hvac: [
			{ keyword: 'hvac', volume: 219 },
			{ keyword: 'furnace repair', volume: 52 },
			{ keyword: 'air conditioning', volume: 27 },
			{ keyword: 'heating and cooling', volume: 27 },
			{ keyword: 'ac repair', volume: 17 }
		]
	},

	// Review count benchmark multiplier (Session 18)
	reviewsPerYearBenchmark: 6,
	yearsInBusinessDefault: 5,
	gbpReviewMaxPoints: 25,
	gbpReviewScoreExponent: 0.8,
	seasonalDivisors: { roofing: 6, hvac: 10, default: 12 },

	// Review response rate benchmark -- BrightLocal 2026
	reviewResponseBenchmark: 0.88,
	reviewResponseFloor: 0.47,

	// Signal scoring functions per Session 18 Spec (The 9 Issues)
	getGbpRatingScore: (rating) => {
		// Accelerating curve: 4.5+ is 35 points, 3.0 is zero.
		if (!rating || rating >= 4.5) return 35;
		if (rating < 3.0) return 0;
		const t = (4.5 - rating) / 1.5;
		const penalty = Math.min(1.0, Math.pow(t, 1.1)); // slightly convex
		return Math.round(35 * (1 - penalty));
	},
	getGbpReviewScore: (reviewCount, yearsInBusiness) => {
		// Session 18 locked curve: penalty on gap vs benchmark
		const expected = Math.max(
			(yearsInBusiness || BENCHMARKS.yearsInBusinessDefault) * BENCHMARKS.reviewsPerYearBenchmark,
			1
		);
		const actual = Math.max(reviewCount || 0, 0);
		const ratio = Math.min(actual / expected, 1.0);
		if (ratio >= 1.0) return BENCHMARKS.gbpReviewMaxPoints;
		const gap = 1.0 - ratio;
		const penalty = Math.min(1.0, Math.pow(gap, BENCHMARKS.gbpReviewScoreExponent));
		return Math.round(BENCHMARKS.gbpReviewMaxPoints * (1 - penalty));
	},
	getGbpPhotoScore: (photoCount) => {
		if (photoCount >= 8) return 8;
		if (photoCount >= 4) return 6;
		if (photoCount >= 1) return 3;
		return 0;
	},
	getGbpHoursScore: (hoursPublished) => (hoursPublished ? 5 : 0),
	getGbpResponseScore: (ownerResponseCount, reviewCount) => {
		if (!reviewCount || reviewCount === 0) return 7;
		const rate = ownerResponseCount / reviewCount;
		if (rate >= 0.4) return 7;
		if (rate >= 0.2) return 4;
		if (rate > 0) return 2;
		return 0;
	},
	getGbpWebsiteScore: (websiteLinked) => (websiteLinked ? 5 : 0),
	getGbpQaScore: (totalQuestions, ownerAnswered) => {
		if (!totalQuestions || totalQuestions === 0) return 4;
		const rate = (ownerAnswered || 0) / totalQuestions;
		if (rate >= 0.6) return 4;
		if (rate >= 0.4) return 3;
		if (rate >= 0.2) return 2;
		return 0;
	},
	getGbpDescriptionScore: (descriptionPresent) => (descriptionPresent ? 4 : 0),
	getGbpServicesScore: (serviceCount) => {
		if (serviceCount >= 5) return 7;
		if (serviceCount >= 3) return 5;
		if (serviceCount >= 1) return 2;
		return 0;
	},

	// ── LAYER 12: Canonical Health Agent -- Session 2 addition
	// Canonical alignment percentage thresholds
	canonicalHealthThresholds: [
		{ minPct: 90, status: 'green', suppressionMult: 1.0, label: 'Fully aligned' },
		{ minPct: 70, status: 'amber', suppressionMult: 1.08, label: 'Minor misalignments' },
		{ minPct: 50, status: 'red', suppressionMult: 1.16, label: 'Significant gaps' },
		{ minPct: 0, status: 'red', suppressionMult: 1.25, label: 'Critical misalignment' }
	],

	// Duplicate GBP listing penalty -- applied on top of suppression multiplier
	duplicateGbpMultiplier: 1.05,

	// AI platform canonical accuracy thresholds
	aiCanonicalAccuracyThreshold: 0.7, // below this = AI platforms misrepresenting the business

	// Canonical suppression applies to these layers
	canonicalSuppressedLayers: ['gbp', 'rank', 'citations', 'aiVisibility'],

	// Personalization Capture Model ceiling -- v1 estimate, calibrate against real client data
	personalizationCaptureCeiling: 0.85,

	// ── Brand Tenure Modifier -- Session 7
	// Unconditional multiplier on capture rate based on years in business.
	// Reflects earned offline trust that exists independent of digital presence.
	// Absence of digital brand equity signals does not reduce this modifier --
	// offline word-of-mouth networks are real even when not measurable digitally.
	// Applied to capture rate only -- does not create implied revenue above zero.
	// Zero capture rate × any modifier = zero. Modifier amplifies existing capture only.
	// Session 17 tenure bands:
	// 16+ legacy trust, 11-15 strong trust, 6-10 established, 2-5 building, 0-1 new.
	brandTenureTiers: [
		{ minYears: 16, rate: 0.16, label: 'Legacy' },
		{ minYears: 11, rate: 0.09, label: 'Trusted' },
		{ minYears: 6, rate: 0.04, label: 'Established' },
		{ minYears: 2, rate: -0.05, label: 'Building' },
		{ minYears: 0, rate: -0.15, label: 'New' }
	],

	// ── Market Demand Index -- economic tier lookup
	// Reflects how much the local economy amplifies or dampens opportunity.
	// Small markets with low competitor density and captive demand run hotter
	// than neutral urban markets for trades businesses.
	marketDemandTiers: {
		booming: { rate: 0.15, label: 'Booming' },
		active: { rate: 0.05, label: 'Active' },
		neutral: { rate: 0.0, label: 'Neutral' },
		slow: { rate: -0.15, label: 'Slow' },
		depressed: { rate: -0.3, label: 'Depressed' }
	},

	// Market demand lookup by city -- Canadian trades markets
	// Key: lowercase city name. Extend as markets are added.
	// Prospect override available at onboarding.
	marketDemandLookup: {
		timmins: 'active',
		sudbury: 'active',
		'north bay': 'active',
		'kirkland lake': 'active',
		cochrane: 'slow',
		kapuskasing: 'slow',
		hearst: 'slow',
		englehart: 'slow',
		'new liskeard': 'slow',
		cobalt: 'slow'
	},

	// ── Competitive Density Index
	// Derived from Layer 8 (paid competitors) + Layer 2A (Map Pack competitors).
	// Paid competitors only in density score -- someone running LSAs is a committed
	// competitor. Organic-only players are a different and lesser threat.
	competitiveDensityTiers: [
		{ maxCompetitors: 1, multiplier: 1.15, label: 'Near-monopoly' },
		{ maxCompetitors: 3, multiplier: 1.08, label: 'Low density' },
		{ maxCompetitors: 6, multiplier: 1.0, label: 'Neutral' },
		{ maxCompetitors: 10, multiplier: 0.92, label: 'High density' },
		{ maxCompetitors: Infinity, multiplier: 0.85, label: 'Very high density' }
	],

	// ── Scenario Recovery Model
	// Three scenarios: Current Reality, Market Opportunity, Full Potential.
	// Applied to Recoverable Revenue and Technical Gap display in results modal.
	scenarioLabels: {
		current: 'Current Reality',
		market: 'Market Opportunity',
		potential: 'Full Potential'
	},

	// ── Diagnostic Confidence
	// Layer confidence weights for spread calculation.
	// Full confidence (1.0) = API data returned and complete.
	// Partial (0.5) = data returned but incomplete or fallback used.
	// Default (0.25) = no data, engine default applied.
	confidenceSpreadMin: 0.2, // minimum spread at full confidence (±20%)
	confidenceSpreadMax: 0.45, // maximum spread at zero confidence (±45%)
	// uncertainty_spread = confidenceSpreadMin + (0.25 × (1 - diagnosticConfidence))

	// Vertical revenue lift benchmarks
	verticalBenchmarks: {
		trades: { lift: 1.0, label: 'Contractors and Trades', pct: '100%', jobHrs: 8, jobUnit: 'job' },
		tourism: {
			lift: 0.8,
			label: 'Tourism and Hospitality',
			pct: '80%',
			jobHrs: 32,
			jobUnit: '4-night booking'
		},
		professional: {
			lift: 0.72,
			label: 'Professional Services',
			pct: '72%',
			jobHrs: 6,
			jobUnit: 'client matter'
		}
	},

	// --- CAPACITY LIFT DEFAULTS (v2.3) ---
	adminHoursPerWeekDefault: 8,
	adminHourlyRateDefault: 30,
	realisticCapacityCeiling: 0.85,
	socialPostingGapRate: 0.05,
	socialEngagementGapRate: 0.05,
	socialResponseGapRate: 0.02
};

// ─────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Average an array of numbers, handling empty arrays gracefully
 */
function avg(arr) {
	if (!arr || arr.length === 0) return 0;
	return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Clamp a value between min and max
 */
function clamp(val, min, max) {
	return Math.max(min, Math.min(max, val));
}

/**
 * Format a number as percentage string for display
 */
function formatPct(n) {
	if (n === null || n === undefined) return '—';
	const p = Math.round(n * 100);
	return p + '%';
}

/**
 * Format a number as currency string for display
 */
function formatCurrency(n) {
	if (n === null || n === undefined) return '—';
	if (n === 0) return '$0';
	if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
	if (n >= 1000) return '$' + Math.round(n / 1000) + 'K';
	return '$' + Math.round(n).toLocaleString();
}

/**
 * Look up a CTR penalty for a given star rating
 */
function getGbpCtrPenalty(rating) {
	const bands = Object.values(BENCHMARKS.gbpCtrPenalty);
	const band = bands.find((b) => rating >= b.min && rating <= b.max);
	return band ? band.penalty : 0.6;
}

/**
 * Look up Lighthouse conversion rate for a given score
 */
function getLighthouseConvRate(score) {
	const tiers = BENCHMARKS.lighthouseConversionRates;
	const tier = tiers.find((t) => score >= t.minScore);
	return tier ? tier.convRate : 0.16;
}

/**
 * Look up site retention rate (Session 15) for a given Lighthouse score.
 * Locked bands: 90+ (1.0), 70-89 (0.90), 50-69 (0.85), <50 (0.80).
 */
function getSiteRetentionRate(performanceScore) {
	const score = performanceScore || 0;
	if (score >= 90) return 1.0;
	if (score >= 70) return 0.9;
	if (score >= 50) return 0.85;
	return 0.8;
}

/**
 * Look up citation multiplier for a given citation count
 */
function getCitationMultiplier(count) {
	const tiers = BENCHMARKS.citationMultipliers;
	const tier = tiers.find((t) => count <= t.max);
	return tier ? tier.multiplier : 1.0;
}

/**
 * Look up engagement multiplier for a given score
 */
function getEngagementMultiplier(score) {
	const tiers = BENCHMARKS.engagementMultipliers;
	const tier = tiers.find((t) => score >= t.minScore);
	return tier ? tier.multiplier : 0.55;
}

/**
 * Look up AI risk multiplier for a given visibility score (0-4)
 */
function getAiRiskMultiplier(score) {
	const clampedScore = clamp(Math.round(score), 0, 4);
	return BENCHMARKS.aiRiskMultipliers[clampedScore] || 1.2;
}

/**
 * Estimate monthly search volume for a trade and city
 * Based on Google Keyword Planner benchmarks for Canadian small markets
 * Under 150,000 population -- ContentRadar provides actual data in production
 */
function estimateMonthlySearchVolume(trade, city, population) {
	// Base estimates for Canadian small market (under 150k population)
	// Primary keyword (e.g. "plumber timmins") -- 180-400 searches/month
	// Adjusted by population relative to 50,000 baseline
	const popFactor = Math.min((population || 50000) / 50000, 3);
	const baseVolume = 250; // conservative midpoint
	return Math.round(baseVolume * popFactor);
}

// ─────────────────────────────────────────────────────────────
// MULTIPLIER CALCULATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Calculate the seasonal multiplier from prospect-reported quarterly inputs
 * Seasonal_Multiplier = (Peak + Q2 + Q3 + Q4) / 4 / 100
 */
function calculateSeasonalMultiplier(seasonal) {
	const { q2 = 85, q3 = 65, q4 = 45 } = seasonal || {};
	return (100 + q2 + q3 + q4) / 4 / 100;
}

/**
 * Calculate engagement readiness score from Layer 9 signals
 * Returns score (0-8) and multiplier
 */
function calculateEngagementScore(engagement) {
	if (!engagement) return { score: 0, multiplier: 1.0 };
	const signals = {
		faqPresent: !!engagement.faqPresent,
		clickToCall: !!engagement.clickToCall,
		bookingWidget: !!engagement.bookingWidget,
		liveChat: !!engagement.liveChat,
		trustSignals: !!engagement.trustSignals,
		emergencyAvailability: !!engagement.emergencyAvailability,
		pricingTransparency: !!engagement.pricingTransparency,
		ctaStrength: (engagement.ctaStrength || 0) >= 3
	};
	const score = Object.values(signals).filter(Boolean).length;
	const multiplier = getEngagementMultiplier(score);
	return { score, multiplier, signals };
}

/**
 * Calculate AI visibility score and risk multiplier from Layer 5
 */
function calculateAiScore(aiVisibility, citations) {
	if (!aiVisibility) return { score: 0, multiplier: 1.0 };
	const platforms = {
		chatgpt: !!aiVisibility.liveResults?.chatgpt,
		gemini: !!aiVisibility.liveResults?.gemini,
		perplexity: !!aiVisibility.liveResults?.perplexity,
		aiOverviews: !!aiVisibility.liveResults?.aiOverviews
	};
	const score = Object.values(platforms).filter(Boolean).length;
	let multiplier = getAiRiskMultiplier(score);

	// Schema absence adds further AI citation risk -- capped at 1.20
	if (citations && !citations.schemaPresent) {
		multiplier = Math.min(multiplier * BENCHMARKS.schemaAbsentAiMultiplier, 1.2);
	}

	return { score, multiplier, platforms };
}

/**
 * Calculate citation multipliers for rank gap adjustment
 */
function calculateCitationMultipliers(citations) {
	if (!citations) return { citationMult: 1.0, napMult: 1.0 };
	const citationMult = getCitationMultiplier(citations.count || 0);
	const napMult =
		citations.napMismatches && citations.napMismatches > 0 ? BENCHMARKS.napMismatchMultiplier : 1.0;
	return { citationMult, napMult };
}

/**
 * LAYER 1: GBP Health Gap (Session 18 Update)
 * Calculates revenue lost due to issues identified across 9 GBP signals.
 * Returns 100-point composite score and detailed repair list.
 */
function calcGbpGap(
	gbp,
	scaledMonthlySearches,
	avgSaleValue,
	yearsInBusiness,
	siteRetentionRate = 1.0,
	vertical = 'trades',
	mapPackPosition = 1
) {
	const positionOneCTR = BENCHMARKS.positionOneCTR;
	const callToPurchaseRate = BENCHMARKS.callToPurchaseRate;
	const MAX_PENALTY = BENCHMARKS.gbpMaxPenaltyCap;
	const MIN_CTR_FLOOR = BENCHMARKS.minCtrGapFloor;

	const positionCTR = BENCHMARKS.mapPackCTR[mapPackPosition] || BENCHMARKS.mapPackCTR['none'];
	const ctrGap = Math.max(positionOneCTR - positionCTR, MIN_CTR_FLOOR);

	// 1. Existence Check
	if (!gbp || !gbp.place_id) {
		const penalty = BENCHMARKS.gbpNoListingPenalty;
		const annualGap =
			scaledMonthlySearches *
			ctrGap *
			(1 - penalty) *
			siteRetentionRate *
			callToPurchaseRate *
			avgSaleValue *
			12;
		const value = Math.round(annualGap);

		const throughputNl = 1 - penalty;
		const monthlyCustomersNl =
			scaledMonthlySearches * ctrGap * throughputNl * siteRetentionRate * callToPurchaseRate;
		const monthlyRevenueNl = monthlyCustomersNl * avgSaleValue;

		console.log('[calcGbpGap] NO LISTING:', {
			scaledMonthlySearches, ctrGap, penalty,
			throughput: throughputNl, siteRetentionRate,
			callToPurchaseRate, avgSaleValue, annualGap: value
		});

		return {
			value,
			gbpExists: false,
			appliedPenalty: penalty,
			detail: { status: 'red', note: 'GBP Listing does not exist', compositeScore: 0 },
			gapDerivation: {
				branch: 'no_listing',
				ctr: {
					positionOneCTR,
					mapPackPosition,
					positionCTR,
					minCtrFloor: MIN_CTR_FLOOR,
					ctrGap
				},
				gbp: { noListingPenalty: penalty, throughput: throughputNl },
				revenue: {
					scaledMonthlySearches,
					monthlyCustomers: monthlyCustomersNl,
					monthlyRevenue: monthlyRevenueNl,
					annualGapUnrounded: annualGap,
					annualGapRounded: value,
					avgSaleValue,
					siteRetentionRate,
					callToPurchaseRate,
					monthsPerYear: 12
				}
			}
		};
	}

	// 2. Signal Scoring (Session 18 100-Point Model)
	const b = BENCHMARKS;
	const signals = [
		{ name: 'Star rating', earned: b.getGbpRatingScore(gbp.rating), max: 35 },
		{
			name: 'Review count',
			earned: b.getGbpReviewScore(gbp.reviewCount, yearsInBusiness),
			max: 25
		},
		{
			name: 'Photos',
			earned: b.getGbpPhotoScore(gbp.photos?.length || 0),
			max: 8
		},
		{ name: 'Hours complete', earned: b.getGbpHoursScore(!!gbp.opening_hours), max: 5 },
		{
			name: 'Owner response rate',
			earned: b.getGbpResponseScore(gbp.ownerResponseCount || 0, gbp.reviewCount || 0),
			max: 7
		},
		{ name: 'Website linked', earned: b.getGbpWebsiteScore(!!gbp.website), max: 5 },
		{
			name: 'GBP Q&A activity',
			earned: b.getGbpQaScore(gbp.qa?.count || 0, gbp.qa?.answeredCount || 0),
			max: 4
		},
		{
			name: 'Description present',
			earned: b.getGbpDescriptionScore(!!gbp.editorialSummary || !!gbp.description),
			max: 4
		},
		{ name: 'Services listed', earned: b.getGbpServicesScore(gbp.services?.length || 0), max: 7 }
	];

	const compositeScore = Math.min(
		100,
		signals.reduce((sum, s) => sum + s.earned, 0)
	);
	const compositePenalty = (100 - compositeScore) / 100;
	const appliedPenalty = Math.min(compositePenalty, MAX_PENALTY);
	const throughput = 1 - appliedPenalty;

	// 3. Gap Calculation (client walkthrough formula):
	//    searches × ctrGap × throughput × retention × conversion × avgSale × 12
	const monthlyCustomers =
		scaledMonthlySearches *
		ctrGap *
		throughput *
		siteRetentionRate *
		callToPurchaseRate;
	const monthlyRevenue = monthlyCustomers * avgSaleValue;
	const annualGap = monthlyRevenue * 12;
	const value = Math.round(annualGap);

	console.log('[calcGbpGap] STEP-BY-STEP:', {
		scaledMonthlySearches,
		mapPackPosition,
		positionCTR,
		ctrGap: `max(${positionOneCTR} - ${positionCTR}, ${MIN_CTR_FLOOR}) = ${ctrGap}`,
		compositeScore,
		penalty: appliedPenalty,
		throughput: `1 - ${appliedPenalty} = ${throughput}`,
		siteRetentionRate,
		callToPurchaseRate,
		avgSaleValue,
		monthlyCustomers: monthlyCustomers.toFixed(4),
		monthlyRevenue: monthlyRevenue.toFixed(2),
		annualGap: value
	});

	const gapDerivation = {
		branch: 'with_listing',
		ctr: {
			positionOneCTR,
			mapPackPosition,
			positionCTR,
			minCtrFloor: MIN_CTR_FLOOR,
			ctrGap
		},
		gbp: {
			compositeScore,
			compositePenaltyRaw: compositePenalty,
			appliedPenalty,
			maxPenaltyCap: MAX_PENALTY,
			throughput
		},
		revenue: {
			scaledMonthlySearches,
			monthlyCustomers,
			monthlyRevenue,
			annualGapUnrounded: annualGap,
			annualGapRounded: value,
			avgSaleValue,
			siteRetentionRate,
			callToPurchaseRate,
			monthsPerYear: 12
		}
	};

	// 4. Per-Signal Cost for Repair List
	const totalPointsLost = 100 - compositeScore;
	const costPerPoint = totalPointsLost > 0 ? Math.round(value / totalPointsLost) : 0;

	const repairList = signals
		.filter((s) => s.earned < s.max)
		.map((s) => {
			const pointsLost = s.max - s.earned;
			return {
				signal: s.name,
				pointsLost,
				annualCost: Math.round(pointsLost * costPerPoint)
			};
		})
		.sort((a, b) => b.annualCost - a.annualCost);

	return {
		value,
		gbpExists: true,
		compositeScore,
		appliedPenalty,
		signals,
		repairList,
		gapDerivation,
		detail: {
			status: compositeScore >= 80 ? 'green' : compositeScore >= 50 ? 'amber' : 'red',
			score: compositeScore,
			pointsLost: totalPointsLost,
			repairList
		}
	};
}

/**
 * LAYER 2: Local Rank Gap (Session 18 Update)
 * Calculates revenue lost due to Map Pack position vs Position 1.
 * Uses Sudbury-indexed volume scaling (D.6).
 */
function calcRankGap(rank, households, avgSaleValue, siteRetentionRate, trade = 'plumbing') {
	if (!rank || !rank.keywords || rank.keywords.length === 0) {
		return { value: 0, detail: { status: 'red', note: 'No rank data' } };
	}

	const cityScale = households / BENCHMARKS.sudburyHouseholds;
	const scalingFactor = cityScale * BENCHMARKS.captiveMarketUplift;

	// Seasonal logic from D.2/D.4: × 12 ÷ seasonalDivisor
	const tradeKey = (trade || '').toLowerCase();
	const isHvac = tradeKey.includes('hvac') || tradeKey.includes('heating') || tradeKey.includes('cooling');
	const isRoofing = tradeKey.includes('roof');
	const seasonalDivisor = isRoofing
		? BENCHMARKS.seasonalDivisors.roofing
		: isHvac
			? BENCHMARKS.seasonalDivisors.hvac
			: BENCHMARKS.seasonalDivisors.default;
	const annualFactor = 12 / seasonalDivisor;

	let totalAnnualGap = 0;
	const keywordDetails = [];
	const numericPositions = [];

	rank.keywords.forEach((kw) => {
		const sudburyVolume = Math.max(0, Number(kw.sudburyVolume || kw.searchVolume) || 0);

		const scaledMonthlyVolume = Math.round(sudburyVolume * scalingFactor);
		const currentPos = parseInt(kw.position) || 99;
		numericPositions.push(currentPos);
		const currentCtr = BENCHMARKS.mapPackCTR[currentPos] || BENCHMARKS.mapPackCTR['none'];
		const ctrGap = Math.max(BENCHMARKS.minCtrGapFloor, BENCHMARKS.positionOneCTR - currentCtr);

		// Annual Gap = (Monthly Volume * CTR Gap * Retention * ConvRate * SaleValue) * 12 / Divisor
		const monthlyValue =
			scaledMonthlyVolume *
			ctrGap *
			siteRetentionRate *
			BENCHMARKS.callToPurchaseRate *
			avgSaleValue;
		const annualGap = monthlyValue * annualFactor;

		totalAnnualGap += annualGap;
		keywordDetails.push({
			keyword: kw.keyword,
			position: kw.position,
			annualGap: Math.round(annualGap)
		});
	});

	return {
		value: Math.round(totalAnnualGap),
		displayValue: formatCurrency(Math.round(totalAnnualGap)),
		detail: {
			status: totalAnnualGap > 50000 ? 'red' : totalAnnualGap > 10000 ? 'amber' : 'green',
			keywords: keywordDetails,
			keywordBreakdown: keywordDetails,
			avgPosition: numericPositions.length ? avg(numericPositions) : 99,
			scalingFactor,
			seasonalDivisor,
			households
		}
	};
}

/**
 * Session 18: Aggregate Layer 2 across primary + secondary trades using intake split.
 */
function calcWeightedRankGap(trades = [], households, siteRetentionRate) {
	if (!Array.isArray(trades) || trades.length === 0) {
		return {
			value: 0,
			displayValue: formatCurrency(0),
			detail: {
				status: 'red',
				note: 'No trades provided',
				tradeBreakdown: [],
				keywordBreakdown: []
			}
		};
	}

	let weightedTotal = 0;
	let weightedAvgPosition = 0;
	let totalWeight = 0;
	const tradeBreakdown = [];
	const keywordBreakdown = [];

	for (const tradeInput of trades) {
		if (!tradeInput?.trade) continue;
		const weightPct = Math.max(0, Math.min(100, Number(tradeInput.weightPct || 0)));
		const weight = 1;

		const rankGap = calcRankGap(
			tradeInput.rank,
			households,
			Number(tradeInput.avgSaleValue || 0),
			siteRetentionRate,
			tradeInput.trade
		);

		const weightedValue = rankGap.value * weight;
		weightedTotal += weightedValue;
		totalWeight += weight;

		const avgPosition = Number(rankGap.detail?.avgPosition || 99);
		weightedAvgPosition += avgPosition * weight;

		tradeBreakdown.push({
			trade: tradeInput.trade,
			weight: weightPct,
			value: Math.round(rankGap.value),
			weightedValue: Math.round(weightedValue)
		});

		for (const keywordItem of rankGap.detail?.keywordBreakdown || []) {
			keywordBreakdown.push({
				...keywordItem,
				trade: tradeInput.trade,
				weightedAnnualGap: Math.round((keywordItem.annualGap || 0) * weight)
			});
		}
	}

	const value = Math.round(weightedTotal);
	const avgPosition =
		totalWeight > 0 ? Math.round((weightedAvgPosition / totalWeight) * 10) / 10 : 99;

	return {
		value,
		displayValue: formatCurrency(value),
		detail: {
			status: value > 50000 ? 'red' : value > 10000 ? 'amber' : 'green',
			avgPosition,
			tradeBreakdown,
			keywordBreakdown,
			keywords: keywordBreakdown
		}
	};
}

/**
 * LAYER 3: Website Performance Gap
 * Calculates revenue lost due to slow website and poor Core Web Vitals
 */
function calcPerformanceGap(lighthouse, monthlySearches, avgCurrentCtr, avgSaleValue, seasonal) {
	if (!lighthouse) return { value: 0, detail: 'Lighthouse data unavailable' };

	const score = lighthouse.performance || 0;
	const currentConvRate = getLighthouseConvRate(score);
	const benchmarkConvRate = getLighthouseConvRate(90); // 90+ score benchmark

	const estMonthlyVisitors = monthlySearches * avgCurrentCtr * BENCHMARKS.clickToSiteRatio;
	const convGap = Math.max(0, benchmarkConvRate - currentConvRate);
	const baseGap = estMonthlyVisitors * convGap * avgSaleValue * 12;

	const value = Math.round(baseGap * seasonal);

	const status = score >= 80 ? 'green' : score >= 50 ? 'amber' : 'red';
	const cwvPass =
		lighthouse.lcp && lighthouse.inp && lighthouse.cls
			? lighthouse.lcp.pass && lighthouse.cls.pass
			: false;

	return {
		value,
		detail: {
			performanceScore: score,
			seoScore: lighthouse.seo,
			accessibilityScore: lighthouse.accessibility,
			bestPracticesScore: lighthouse.bestPractices,
			cwvPass,
			isHttps: lighthouse.isHttps,
			status
		}
	};
}

/**
 * LAYER 4: Content Gap
 * Calculates revenue lost due to missing keyword coverage vs ContentRadar demand
 */
function calcContentGap(contentGap, avgSaleValue, seasonal, engagementMult) {
	if (!contentGap || !contentGap.missing) return { value: 0, detail: 'Content data unavailable' };

	// Sum revenue potential of all missing keywords
	const keywordGap = contentGap.missing.reduce((sum, kw) => {
		const searches = kw.monthlySearches || 100; // default if not provided
		const urgencyWeight = kw.urgency === 'critical' ? 1.5 : kw.urgency === 'high' ? 1.2 : 1.0;
		return (
			sum +
			searches *
				BENCHMARKS.mapPackCTR[1] *
				BENCHMARKS.organicConversionRate *
				avgSaleValue *
				urgencyWeight
		);
	}, 0);

	// PAA gap -- People Also Ask questions not answered on site
	const paaGap = (contentGap.paaGaps || 0) * 80 * BENCHMARKS.organicConversionRate * avgSaleValue;

	const value = Math.round((keywordGap + paaGap) * 12 * seasonal * engagementMult);

	const covered = contentGap.covered || 0;
	const missing = contentGap.missing.length;
	const total = covered + missing;
	const coveragePct = total > 0 ? Math.round((covered / total) * 100) : 0;

	const status = coveragePct >= 70 ? 'green' : coveragePct >= 40 ? 'amber' : 'red';

	return {
		value,
		detail: {
			covered,
			missing,
			coveragePct: coveragePct + '%',
			paaGaps: contentGap.paaGaps || 0,
			topMissingKeywords: contentGap.missing.slice(0, 5).map((k) => k.keyword),
			status
		}
	};
}

/**
 * LAYER 6: Missed Call Gap
 * Calculates revenue lost to unanswered calls that never call back
 */
function calcMissedCallGap(selfReported, monthlySearches, avgCurrentCtr, avgSaleValue, seasonal) {
	const missedCallPct = (selfReported.missedCallPct || 20) / 100;

	// Estimate inbound call volume from search traffic
	const estMonthlyCallsFromSearch = monthlySearches * avgCurrentCtr * BENCHMARKS.clickToCallRate;

	// Revenue per missed call that does not call back
	const missedCallRevenueLoss =
		estMonthlyCallsFromSearch * missedCallPct * BENCHMARKS.noCallbackRate * avgSaleValue;

	const value = Math.round(missedCallRevenueLoss * 12 * seasonal);

	const status = missedCallPct <= 0.15 ? 'green' : missedCallPct <= 0.29 ? 'amber' : 'red';

	return {
		value,
		detail: {
			missedCallPct: Math.round(missedCallPct * 100) + '%',
			estMonthlyMissedCalls: Math.round(estMonthlyCallsFromSearch * missedCallPct),
			estAnnualMissedCalls: Math.round(estMonthlyCallsFromSearch * missedCallPct * 12),
			noCallbackRate: Math.round(BENCHMARKS.noCallbackRate * 100) + '%',
			status
		}
	};
}

/**
 * contentBenchmark -- Capacity-Aware Content Model utility function (NEW v2.3)
 *
 * Scales a content cadence benchmark to the quarterly capacity gap.
 * Floors at minVal when the business is at or near its capacity ceiling.
 * Ramps linearly to maxVal as idle capacity increases.
 *
 * Used for: social posts/month, GBP posts/month, blog pages/month, FAQ updates/quarter.
 * ContentRadar owns scheduling and lead time -- this function outputs targets only.
 *
 * Formula:
 *   IF capacityGap(quarter) <= socialPostingCeilingThreshold  THEN minVal
 *   ELSE MIN(baseVal x (1 + capacityGap(quarter)), maxVal)
 *
 * @param {number} capacityGap  - fractional idle capacity gap for the quarter (0.0 - 1.0)
 * @param {number} minVal       - floor value (at ceiling -- maintain presence only)
 * @param {number} baseVal      - base value used in scaling
 * @param {number} maxVal       - cap value (maximum realistic)
 * @returns {number}
 */
function contentBenchmark(capacityGap, minVal, baseVal, maxVal) {
	if (capacityGap <= BENCHMARKS.socialPostingCeilingThreshold) return minVal;
	return Math.min(baseVal * (1 + capacityGap), maxVal);
}

/**
 * APPLY MODIFIERS (Tenure and Economic) -- Session 18 update
 */
function applyModifiers(baseValue, yearsInBusiness, marketTier = 'neutral') {
	// 1. Brand Tenure Rate
	const tiers = BENCHMARKS.brandTenureTiers;
	const tenureTier =
		tiers.find((t) => (yearsInBusiness || 0) >= t.minYears) || tiers[tiers.length - 1];
	const tenureRate = tenureTier.rate;

	// 2. Economic Rate
	const ecoTier = BENCHMARKS.marketDemandTiers[marketTier] || BENCHMARKS.marketDemandTiers.neutral;
	const ecoRate = ecoTier.rate;

	// Session 18 Formula: base + (base * tenureRate) + (base * ecoRate)
	return Math.round(baseValue + baseValue * tenureRate + baseValue * ecoRate);
}

/**
 * Same math as {@link applyModifiers}, but returns the intermediate lifts for reporting.
 * @param {number} baseValue
 * @param {number} yearsInBusiness
 * @param {string} [marketTier]
 */
function getModifierDerivation(baseValue, yearsInBusiness, marketTier = 'neutral') {
	const tiers = BENCHMARKS.brandTenureTiers;
	const tenureTier =
		tiers.find((t) => (yearsInBusiness || 0) >= t.minYears) || tiers[tiers.length - 1];
	const tenureRate = tenureTier.rate;
	const ecoTier = BENCHMARKS.marketDemandTiers[marketTier] || BENCHMARKS.marketDemandTiers.neutral;
	const ecoRate = ecoTier.rate;
	const tenureLift = baseValue * tenureRate;
	const ecoLift = baseValue * ecoRate;
	const adjusted = Math.round(baseValue + tenureLift + ecoLift);
	return {
		baseValue,
		tenureBandLabel: tenureTier.label,
		tenureRate,
		tenureLift,
		economicTierKey: marketTier,
		economicTierLabel: ecoTier.label,
		ecoRate,
		ecoLift,
		adjusted,
		formulaText: `round(${baseValue} + ${baseValue}×${tenureRate} + ${baseValue}×${ecoRate}) = ${adjusted}`
	};
}

/**
 * LAYER 7: Social Voice Adjustment -- v2.3 (five components)
 *
 * Component 1 (existing): Sentiment multiplier on GBP gap
 * Component 2 (existing): Unanswered mentions to missed call gap
 * Component 3 (NEW v2.3): Posting_Gap -- quarterly capacity-weighted posting shortfall
 * Component 4 (NEW v2.3): Engagement_Gap_Social -- engagement rate below trades benchmark
 * Component 5 (NEW v2.3): Response_Gap -- unanswered comments on posts
 *
 * All Data365 data for Components 3-5 is already retrieved in Layer 7 Phase 1 --
 * no additional API calls required.
 */
function calcSocialAdjustment(
	socialVoice,
	gbpGapValue,
	avgSaleValue,
	annualRevenue,
	quarterlyCapacityGaps
) {
	if (!socialVoice) return { value: 0, detail: 'Social data unavailable' };

	// ── Component 1: Sentiment multiplier on GBP gap (existing)
	let sentimentMultiplierGap = 0;
	if ((socialVoice?.sentimentScore ?? 1) < BENCHMARKS.socialSentimentThreshold) {
		sentimentMultiplierGap = gbpGapValue * BENCHMARKS.socialSentimentUplift;
	}

	// ── Component 2: Unanswered mentions to missed call gap (existing)
	let unansweredMentionsGap = 0;
	if ((socialVoice?.unansweredMentions ?? 0) > BENCHMARKS.unansweredMentionThreshold) {
		unansweredMentionsGap =
			(socialVoice?.unansweredMentions ?? 0) * avgSaleValue * BENCHMARKS.unansweredMentionFactor;
	}

	// ── Component 3: Posting_Gap (NEW v2.3)
	// Quarterly capacity-weighted gap between actual and benchmark posting frequency.
	// Uses Data365 data already retrieved in Phase 1 -- no new API calls.
	// postingFrequencyScore = actualPostsPerMonth / contentBenchmark(quarter, 2, 4, 6), capped at 1.0
	// Posting_Gap = SUM over quarters(
	//   (1 - postingFrequencyScore(q)) x (capacityGap(q) x annualRevenue x 0.25) x socialPostingGapRate x 0.25
	// )
	let postingGap = 0;
	if (quarterlyCapacityGaps && annualRevenue) {
		const quarters = ['q1', 'q2', 'q3', 'q4'];
		const actualPostsPerMonth = socialVoice?.actualPostsPerMonth ?? 0;

		for (const q of quarters) {
			const capGap = quarterlyCapacityGaps[q] || 0;
			const benchmark = contentBenchmark(
				capGap,
				BENCHMARKS.minSocialPostsPerMonth,
				BENCHMARKS.baseSocialPostsPerMonth,
				BENCHMARKS.maxSocialPostsPerMonth
			);
			const postingFrequencyScore =
				benchmark > 0 ? Math.min(actualPostsPerMonth / benchmark, 1.0) : 1.0;
			postingGap +=
				(1 - postingFrequencyScore) *
				(capGap * annualRevenue * 0.25) *
				BENCHMARKS.socialPostingGapRate *
				0.25;
		}
	}

	// ── Component 4: Engagement_Gap_Social (NEW v2.3)
	// engagementRateScore scales 0.0 (below 0.5% engagement) to 1.0 (at or above 2% trades benchmark)
	// Engagement rate = (likes + comments + shares) / followers, avg last 10 posts
	let engagementGapSocial = 0;
	if (annualRevenue) {
		const engRate = socialVoice?.socialEngagementRate ?? 0; // decimal, e.g. 0.018 = 1.8%
		const tradesBenchmark = 0.02; // 2% trades benchmark
		const engagementRateScore = clamp(engRate / tradesBenchmark, 0, 1.0);
		engagementGapSocial =
			(1 - engagementRateScore) * annualRevenue * BENCHMARKS.socialEngagementGapRate;
	}

	// ── Component 5: Response_Gap (NEW v2.3)
	// unansweredComments = comments where customer asked a question, no owner reply within 72hrs
	const unansweredComments = socialVoice?.unansweredComments ?? 0;
	const responseGap = unansweredComments * avgSaleValue * BENCHMARKS.socialResponseGapRate;

	const totalAdjustment =
		sentimentMultiplierGap + unansweredMentionsGap + postingGap + engagementGapSocial + responseGap;

	const sentimentPct = Math.round((socialVoice?.sentimentScore ?? 0) * 100);
	const status = sentimentPct >= 70 ? 'green' : sentimentPct >= 50 ? 'amber' : 'red';

	return {
		value: Math.round(totalAdjustment),
		detail: {
			// Component 1
			sentimentScore: sentimentPct + '%',
			sentimentMultiplierGap: Math.round(sentimentMultiplierGap),
			// Component 2
			unansweredMentions: socialVoice?.unansweredMentions ?? 0,
			unansweredMentionsGap: Math.round(unansweredMentionsGap),
			// Component 3
			postingGap: Math.round(postingGap),
			actualPostsPerMonth: socialVoice?.actualPostsPerMonth ?? 0,
			// Component 4
			socialEngagementRate: Math.round((socialVoice?.socialEngagementRate ?? 0) * 1000) / 10 + '%',
			engagementGapSocial: Math.round(engagementGapSocial),
			// Component 5
			unansweredComments,
			responseGap: Math.round(responseGap),
			// Existing fields
			themes: socialVoice?.themes ?? [],
			reviewVelocity90d: socialVoice?.reviewVelocity90d ?? 0,
			reviewResponseRate: Math.round((socialVoice?.reviewResponseRate ?? 0) * 100) + '%',
			status
		}
	};
}

/**
 * LAYER 8: Paid Marketing Gap
 * Calculates waste in existing ad spend and SERP displacement cost
 */
function calcPaidGap(paidMarketing, selfReported, lighthouse, gbp, contentGap, seasonal) {
	if (!paidMarketing) return { value: 0, detail: 'Paid marketing data unavailable' };

	const totalPaidSpend =
		(selfReported.paidSpend?.google || 0) +
		(selfReported.paidSpend?.facebook || 0) +
		(selfReported.paidSpend?.other || 0);

	// Organic health score determines how much paid spend is being wasted
	const organicHealth = calculateOrganicHealthScore(lighthouse, gbp, contentGap);
	const wasteTier = BENCHMARKS.paidWasteMultipliers.find((t) => organicHealth <= t.maxHealth);
	const wastePct = wasteTier ? wasteTier.wastePct : 0.1;
	const paidEfficiencyGap = totalPaidSpend * (1 - organicHealth) * wastePct * 12;

	// SERP displacement -- competitor LSAs push organic position down
	const competitorLSACount = paidMarketing?.competitorLSAs?.length ?? 0;
	const displacementPositions = competitorLSACount; // each LSA pushes down by ~1 position
	const displacedCtr =
		BENCHMARKS.mapPackCTR[Math.min(3, displacementPositions + 1)] || BENCHMARKS.mapPackCTR['none'];
	// Displacement gap is captured in rank gap -- here we show as context only

	const value = Math.round(paidEfficiencyGap * seasonal);

	const competitorCount =
		competitorLSACount +
		(paidMarketing?.competitorGoogleAds?.length ?? 0) +
		(paidMarketing?.competitorMetaAds?.length ?? 0);
	const status = competitorCount === 0 ? 'green' : competitorCount <= 2 ? 'amber' : 'red';

	return {
		value,
		detail: {
			totalMonthlyPaidSpend: totalPaidSpend,
			organicHealthScore: Math.round(organicHealth * 100) + '%',
			estimatedWastePct: Math.round(wastePct * 100) + '%',
			competitorLSAs: paidMarketing?.competitorLSAs ?? [],
			competitorGoogleAds: paidMarketing?.competitorGoogleAds ?? [],
			competitorMetaAds: paidMarketing?.competitorMetaAds ?? [],
			status
		}
	};
}

/**
 * LAYER 9: Engagement Readiness Gap
 * Calculates revenue lost because visitors don't convert due to poor engagement signals
 * Note: engagementMult is already applied within rank, content, and AI gaps
 * This calculates the direct conversion gap on existing call volume
 */
function calcEngagementGap(
	engagement,
	monthlySearches,
	avgCurrentCtr,
	avgSaleValue,
	seasonal,
	engagementMult
) {
	const { score } = engagement;
	const benchmarkConvRate = BENCHMARKS.callToPurchaseRate;
	const currentConvRate = benchmarkConvRate * engagementMult;

	const estMonthlyCallsFromSearch = monthlySearches * avgCurrentCtr * BENCHMARKS.clickToCallRate;
	const convGap = Math.max(0, benchmarkConvRate - currentConvRate);
	const value = Math.round(estMonthlyCallsFromSearch * convGap * avgSaleValue * 12 * seasonal);

	const status = score >= 7 ? 'green' : score >= 5 ? 'amber' : 'red';

	return {
		value,
		detail: {
			engagementScore: score + '/8',
			conversionMultiplier: Math.round(engagementMult * 100) + '%',
			signals: engagement.signals || {},
			status
		}
	};
}

/**
 * LAYER 10: Conversion Infrastructure Assessment
 * Modifies missed call gap based on presence/absence of automated response
 * A contractor with no auto-response loses all 82% of missed callers
 * A contractor with auto-response can recover 40-60% of them
 */
function calcConversionInfrastructureAdjustment(conversion, missedCallGapValue) {
	if (!conversion) return { adjustment: 0, detail: {} };

	const hasAutoResponse = !!conversion.autoResponsePresent;
	const recoveryRate = hasAutoResponse ? 0.5 : 0; // 50% recovery with auto-response
	const adjustment = hasAutoResponse ? -(missedCallGapValue * recoveryRate) : 0;

	const score = [
		conversion.autoResponsePresent,
		(conversion.ctaUrgency || 0) >= 3,
		(conversion.formFieldCount || 99) <= 4,
		(conversion.contactPathways || 0) >= 2,
		conversion.hoursVisible
	].filter(Boolean).length;

	const status = score >= 4 ? 'green' : score >= 2 ? 'amber' : 'red';

	return {
		adjustment: Math.round(adjustment),
		detail: {
			conversionScore: score + '/5',
			autoResponsePresent: hasAutoResponse,
			ctaUrgency: conversion.ctaUrgency || 0,
			formFieldCount: conversion.formFieldCount || 'not detected',
			contactPathways: conversion.contactPathways || 0,
			status
		}
	};
}

/**
 * CAPACITY LIFT CALCULATION -- v2.3
 *
 * Two distinct components:
 *
 * Component 1 -- Idle capacity revenue
 * The gap between current seasonal utilization and the realistic operating
 * ceiling (85%). This is revenue ClearSky helps generate by fixing visibility,
 * conversion, and personalization. Seasonal -- varies by quarter.
 *
 * Component 2 -- Admin time cost saving
 * ClearSky automation gives back a portion of the owner/manager's admin hours.
 * Valued at the owner's hourly rate. NOT seasonal -- admin burden is fixed
 * regardless of how busy the business is. NOT converted to jobs -- it is a
 * cost saving, not a revenue line.
 *
 * v2.3 changes:
 *   - adminPct (nonBillablePct) retired as input. Replaced by adminHoursPerWeek
 *     collected directly from prospect (default 8).
 *   - capacityTimeSavingRate reduced from 0.80 to 0.40. Conservative v1 baseline.
 *   - Saved_Hrs_Per_Week = adminStaffCount x adminHoursPerWeek x capacityTimeSavingRate
 *
 * @param {Object} selfReported
 *   @param {number} selfReported.adminStaffCount    - staff carrying admin burden (default 1)
 *   @param {number} selfReported.adminHoursPerWeek  - hours/week on admin (default 8)
 *   @param {number} selfReported.adminHourlyRate    - owner hourly value (default 30)
 *   @param {Object} selfReported.seasonal           - quarterly utilization relative to peak
 *   @param {number} selfReported.annualRevenue
 */
function calcCapacityLift(selfReported, avgSaleValue, seasonal, vertical = 'trades') {
	const {
		adminStaffCount = 1,
		adminHoursPerWeek = BENCHMARKS.adminHoursPerWeekDefault,
		adminHourlyRate = BENCHMARKS.adminHourlyRateDefault,
		annualRevenue = 300000,
		seasonal: seasonalInputs = {}
	} = selfReported;

	const { q2 = 85, q3 = 65, q4 = 45 } = seasonalInputs;
	const ceiling = BENCHMARKS.realisticCapacityCeiling; // 0.85

	// ── Component 1: Idle capacity revenue
	// Each quarter's utilization as a fraction of realistic full capacity
	// Q1 = peak = 100% of realistic ceiling = ceiling itself
	const q1Util = ceiling;
	const q2Util = (q2 / 100) * ceiling;
	const q3Util = (q3 / 100) * ceiling;
	const q4Util = (q4 / 100) * ceiling;

	// Addressable gap per quarter = ceiling minus current utilization
	const q1Gap = Math.max(0, ceiling - q1Util); // always 0 -- at ceiling in peak
	const q2Gap = Math.max(0, ceiling - q2Util);
	const q3Gap = Math.max(0, ceiling - q3Util);
	const q4Gap = Math.max(0, ceiling - q4Util);

	// Average addressable gap across the year
	const avgGap = (q1Gap + q2Gap + q3Gap + q4Gap) / 4;
	const idleCapacityValue = Math.round(annualRevenue * avgGap);

	// ── Component 2: Admin time cost saving -- Session 15/16 update
	// Fixed annual saving based on 480 benchmark hours.
	const annualCostSaving = BENCHMARKS.annualAdminSaving;

	// ── Combined capacity value (used in projected revenue)
	const value = idleCapacityValue + annualCostSaving;

	return {
		value,
		detail: {
			// Component 1
			realisticCeiling: Math.round(ceiling * 100) + '%',
			quarterlyGaps: {
				q1: Math.round(q1Gap * 100) + '%',
				q2: Math.round(q2Gap * 100) + '%',
				q3: Math.round(q3Gap * 100) + '%',
				q4: Math.round(q4Gap * 100) + '%'
			},
			avgAnnualGap: Math.round(avgGap * 100) + '%',
			idleCapacityValue,
			// Component 2
			annualCostSaving,
			// Combined
			totalCapacityValue: value
		}
	};
}

/**
 * GROWTH READINESS SCORE (Layer 11)
 * Forward-looking score 0-6 -- not a dollar gap
 */
/**
 * BRAND EQUITY INDEX (Layer 11 sub-component -- NEW Session 7)
 *
 * Measures whether an established business's offline word-of-mouth reputation
 * is being captured and compounded digitally. A new business and a 20-year
 * business may look identical on GBP rating -- but the 20-year business has
 * a pool of thousands of past customers who can refer, recommend, and review.
 * This function scores whether that equity is showing up in measurable signals.
 *
 * Four signals scored 0-1 each. Total index 0-4.
 *
 * Signal 1 -- Review depth vs years in business
 *   Expected accumulation: yearsInBusiness x reviewsPerYearBenchmark (6/yr)
 *   A 10-year business at benchmark has 60 reviews. Pass if actual >= expected.
 *   This is the most direct proxy for word-of-mouth converting to digital proof.
 *
 * Signal 2 -- Branded search presence
 *   Pass if ContentRadar detects the business name as a tracked keyword with
 *   measurable search volume. Branded searches = people who heard the name
 *   somewhere and looked them up -- pure word-of-mouth converted to intent.
 *
 * Signal 3 -- Social following size
 *   Pass if follower count >= population-adjusted benchmark.
 *   Followers are accumulated social proof -- people who chose to stay connected
 *   after a job. In a market < 50K population, 200+ followers is meaningful.
 *
 * Signal 4 -- Unprompted community mentions
 *   Pass if Data365 detects >= 2 mentions in last 90 days where the business
 *   was not tagged but was named by a community member recommending them.
 *   These are the purest word-of-mouth signals in the data.
 *
 * @param {Object} gbp              - Layer 1 GBP data
 * @param {Object} socialVoice      - Layer 7 social data
 * @param {Object} contentGap       - Layer 4 content data
 * @param {Object} selfReported     - Prospect inputs (yearsInBusiness, population)
 * @param {number} population       - Market population (for social benchmark scaling)
 * @returns {Object} { score, signals, detail }
 */
function calcBrandEquityIndex(gbp, socialVoice, contentGap, selfReported, population) {
	const yearsInBusiness = selfReported?.yearsInBusiness || BENCHMARKS.yearsInBusinessDefault;
	const reviewCount = gbp?.reviewCount || 0;
	const followerCount = socialVoice?.followerCount || 0;
	const unpromptedMentions = socialVoice?.unpromptedMentions || 0;
	const brandedSearchDetected = !!contentGap?.brandedSearchPresent;

	// Signal 1: review depth vs years in business
	const expectedReviews = yearsInBusiness * BENCHMARKS.reviewsPerYearBenchmark;
	const reviewDepthPass = reviewCount >= expectedReviews;

	// Signal 2: branded search presence (ContentRadar keyword detection)
	const brandedSearchPass = brandedSearchDetected;

	// Signal 3: social following -- scale benchmark with population
	// Base benchmark 200 followers for market < 50K. Scales up proportionally above that.
	const popFactor = Math.max(1, (population || 50000) / 50000);
	const followerBenchmark = Math.round(BENCHMARKS.brandedSearchFollowerMin * popFactor);
	const socialFollowingPass = followerCount >= followerBenchmark;

	// Signal 4: unprompted community mentions (Data365 -- someone named them without tagging)
	const unpromptedMentionsPass = unpromptedMentions >= BENCHMARKS.brandEquityMentionsMin;

	const signals = {
		reviewDepth: reviewDepthPass,
		brandedSearch: brandedSearchPass,
		socialFollowing: socialFollowingPass,
		unpromptedMentions: unpromptedMentionsPass
	};

	const score = Object.values(signals).filter(Boolean).length;

	return {
		score,
		signals,
		detail: {
			yearsInBusiness,
			reviewCount,
			expectedReviews,
			reviewDepthPass,
			brandedSearchDetected,
			followerCount,
			followerBenchmark,
			socialFollowingPass,
			unpromptedMentions,
			unpromptedMentionsPass
		}
	};
}

/**
 * GROWTH READINESS SCORE (Layer 11)
 * Forward-looking score 0-7 -- not a standalone dollar gap.
 * Seven signals: six infrastructure signals + Brand Equity Index (0-4 collapsed to 0-1).
 *
 * Score 6-7 = Growth-ready    (full 12-month projection applies)
 * Score 4-5 = Partially ready (80% of projection)
 * Score 2-3 = Early stage     (65%)
 * Score 0-1 = Not started     (50%)
 */
function calcGrowthScore(growth, gbp, socialVoice, contentGap, selfReported, population) {
	if (!growth) return { score: 0, label: 'Not started', signals: {}, brandEquity: null };

	const brandEquity = calcBrandEquityIndex(gbp, socialVoice, contentGap, selfReported, population);

	const signals = {
		activeGbpPosting: (growth.gbpPostsLast90d || 0) >= 4,
		reviewGenerationCadence: (growth.reviewsLast90d || 0) >= 9,
		contentPublishing: !!growth.contentPublishingActive,
		referralInfrastructure: !!growth.referralInfraPresent,
		activeSocial: (growth.socialPostFrequency || 0) >= 4,
		maintenancePlan: !!growth.maintenancePlanPresent,
		// Brand Equity Index: passes if score >= 2 (at least half of the four signals present)
		// A business with zero digital word-of-mouth equity fails this regardless of age.
		brandEquityEstablished: brandEquity.score >= 2
	};

	const score = Object.values(signals).filter(Boolean).length;

	const label =
		score >= 6
			? 'Growth-ready'
			: score >= 4
				? 'Partially ready'
				: score >= 2
					? 'Early stage'
					: 'Not started';

	const growthStatement =
		score >= 6
			? 'Your business has the infrastructure and brand equity to compound these gains over time. Our 12-month projection assumes full growth-rate compounding.'
			: score >= 4
				? 'Your business has some growth foundations in place. Strengthening review cadence, referral infrastructure, and digital word-of-mouth capture will accelerate gains beyond the 12-month projection.'
				: score >= 2
					? "Your business has minimal growth infrastructure. ClearSky's Growth module adds the retention, referral, review, and brand equity systems needed to compound your gains."
					: "Every customer relationship currently ends at job completion -- and your word-of-mouth equity is not being captured digitally. ClearSky's Growth module changes that.";

	return { score, label, signals, growthStatement, brandEquity };
}

// ─────────────────────────────────────────────────────────────
// HEALTH SCORE HELPERS
// ─────────────────────────────────────────────────────────────

function getGbpStatus(gbp) {
	if (!gbp) return 'red';
	if (gbp.rating >= 4.5 && gbp.reviewCount >= 40) return 'green';
	if (gbp.rating >= 4.0 && gbp.reviewCount >= 25) return 'amber';
	return 'red';
}

function getRankStatus(rank) {
	if (!rank || !rank.keywords) return 'red';
	const positions = rank.keywords.map((kw) =>
		kw.position === 'none' ? 99 : parseInt(kw.position) || 99
	);
	const avg_ = avg(positions);
	if (avg_ <= 2) return 'green';
	if (avg_ <= 3) return 'amber';
	return 'red';
}

function getCitationStatus(citations) {
	if (!citations) return 'red';
	if (citations.count >= 40 && !citations.napMismatches && citations.schemaPresent) return 'green';
	if (citations.count >= 25 && (!citations.napMismatches || citations.napMismatches <= 1))
		return 'amber';
	return 'red';
}

function getAiStatus(aiScore) {
	if (aiScore >= 3) return 'green';
	if (aiScore >= 1) return 'amber';
	return 'red';
}

/**
 * LAYER 12: Canonical Health Agent
 * Scores canonical alignment across all managed surfaces.
 * Returns a suppression multiplier applied to Layers 1, 2A, 2B, and 5.
 *
 * canonicalHealth object structure (assembled server-side by the canonical agent):
 *   surfacesChecked      {number}  -- total surfaces audited
 *   surfacesAligned      {number}  -- surfaces fully matching canonical NAP record
 *   napMismatches        {number}  -- count of NAP variations found
 *   duplicateGbpFound    {boolean} -- whether a duplicate GBP listing was detected
 *   canonicalTagsMissing {number}  -- website pages missing canonical tags
 *   schemaNapMismatch    {boolean} -- schema markup conflicts with GBP NAP
 *   aiAccuracyScore      {number}  -- 0.0-1.0, accuracy of AI platform representation
 *                                     vs canonical record (Perplexity, ChatGPT, Gemini)
 *   remediationList      {Array}   -- prioritised fixes [{surface, issue, priority}]
 */
function calcCanonicalHealth(canonicalHealth) {
	if (!canonicalHealth) {
		return {
			suppressionMult: 1.08, // conservative default -- partial misalignment assumed
			score: null,
			detail: {
				status: 'amber',
				note: 'Canonical agent data unavailable -- default suppression applied'
			}
		};
	}

	// Calculate alignment percentage
	const { surfacesChecked = 1, surfacesAligned = 0 } = canonicalHealth;
	const alignmentPct =
		surfacesChecked > 0 ? Math.round((surfacesAligned / surfacesChecked) * 100) : 0;

	// Look up suppression multiplier from thresholds
	const tiers = BENCHMARKS.canonicalHealthThresholds;
	const tier = tiers.find((t) => alignmentPct >= t.minPct) || tiers[tiers.length - 1];
	let suppressionMult = tier.suppressionMult;

	// Duplicate GBP listing adds further suppression
	if (canonicalHealth.duplicateGbpFound) {
		suppressionMult = Math.min(suppressionMult * BENCHMARKS.duplicateGbpMultiplier, 1.35);
	}

	// AI platform canonical accuracy below threshold amplifies AI visibility risk
	const aiCanonicalRisk =
		(canonicalHealth.aiAccuracyScore || 1.0) < BENCHMARKS.aiCanonicalAccuracyThreshold;

	const status = tier.status;

	return {
		suppressionMult: Math.round(suppressionMult * 100) / 100,
		alignmentPct,
		aiCanonicalRisk,
		detail: {
			alignmentPct: alignmentPct + '%',
			surfacesChecked: canonicalHealth.surfacesChecked || 0,
			surfacesAligned: canonicalHealth.surfacesAligned || 0,
			napMismatches: canonicalHealth.napMismatches || 0,
			duplicateGbpFound: canonicalHealth.duplicateGbpFound || false,
			canonicalTagsMissing: canonicalHealth.canonicalTagsMissing || 0,
			schemaNapMismatch: canonicalHealth.schemaNapMismatch || false,
			aiAccuracyScore:
				canonicalHealth.aiAccuracyScore != null
					? Math.round(canonicalHealth.aiAccuracyScore * 100) + '%'
					: 'not checked',
			remediationList: canonicalHealth.remediationList || [],
			suppressionLabel: tier.label,
			status
		}
	};
}

function getCanonicalStatus(canonicalResult) {
	if (!canonicalResult || !canonicalResult.detail) return 'amber';
	return canonicalResult.detail.status;
}








/**
 * getBrandTenureModifier
 * Returns the unconditional capture rate modifier based on years in business.
 * Modifier is applied to capture rate only -- does not create implied revenue
 * above zero. Reflects earned offline trust independent of digital presence.
 *
 * @param {number} yearsInBusiness
 * @returns {Object} { modifier, label }
 */
function getBrandTenureModifier(yearsInBusiness) {
	const years = yearsInBusiness || BENCHMARKS.yearsInBusinessDefault;
	const tier = BENCHMARKS.brandTenureTiers.find((t) => years >= t.minYears);
	const resolvedTier =
		tier || BENCHMARKS.brandTenureTiers[BENCHMARKS.brandTenureTiers.length - 1];
	const rate = resolvedTier?.rate || 0;
	return { ...resolvedTier, modifier: 1 + rate };
}

/**
 * getMarketOpportunityMultiplier
 * Combines Market Demand Index and Competitive Density Index into a single
 * Market Opportunity Multiplier applied to Total_Gap.
 *
 * Market Demand: economic tier from lookup table or prospect override.
 * Competitive Density: count of paid competitors from Layer 8 + Layer 2A.
 * Paid-only count -- LSA + Google Ads + Meta Ads. Organic-only players
 * are a lesser threat and not included in the density score.
 *
 * @param {string} city           - Lowercase city name for lookup
 * @param {string} marketTierOverride - Prospect override ('booming'|'strong'|'neutral'|'slow'|'depressed')
 * @param {Object} paidMarketing  - Layer 8 paid competitor data
 * @returns {Object} { multiplier, demandTier, demandMultiplier, densityLabel, densityMultiplier, paidCompetitorCount }
 */
function getMarketOpportunityMultiplier(city, marketTierOverride, paidMarketing) {
	// ── Market Demand Index
	const cityKey = (city || '').toLowerCase().trim();
	const tierKey = marketTierOverride || BENCHMARKS.marketDemandLookup[cityKey] || 'neutral';
	const demandTier = BENCHMARKS.marketDemandTiers[tierKey] || BENCHMARKS.marketDemandTiers.neutral;
	const demandMultiplier =
		typeof demandTier.multiplier === 'number' ? demandTier.multiplier : 1 + (demandTier.rate || 0);

	// ── Competitive Density Index -- paid competitors only
	const lsaCount = paidMarketing?.competitorLSAs?.length || 0;
	const googleAdsCount = paidMarketing?.competitorGoogleAds?.length || 0;
	const metaAdsCount = paidMarketing?.competitorMetaAds?.length || 0;
	const paidCompetitorCount = lsaCount + googleAdsCount + metaAdsCount;

	const densityTier =
		BENCHMARKS.competitiveDensityTiers.find((t) => paidCompetitorCount <= t.maxCompetitors) ||
		BENCHMARKS.competitiveDensityTiers[BENCHMARKS.competitiveDensityTiers.length - 1];

	const multiplier = Math.round(demandMultiplier * densityTier.multiplier * 100) / 100;

	return {
		multiplier,
		demandTier: tierKey,
		demandLabel: demandTier.label,
		demandMultiplier,
		densityLabel: densityTier.label,
		densityMultiplier: densityTier.multiplier,
		paidCompetitorCount
	};
}

/**
 * calcDiagnosticConfidence
 * Scores data confidence per layer (0.0–1.0) and returns an overall
 * diagnosticConfidence score used to calculate the uncertainty spread
 * for the three-scenario recovery range.
 *
 * Full (1.0)   = API data returned and complete
 * Partial (0.5)= data returned but incomplete or fallback used
 * Default(0.25)= no data, engine default applied
 *
 * @param {Object} diagnosticData - Full diagnostic input object
 * @returns {Object} { diagnosticConfidence, layerConfidence, uncertaintySpread }
 */
function calcDiagnosticConfidence(diagnosticData) {
	const {
		gbp,
		rank,
		citations,
		lighthouse,
		contentGap,
		aiVisibility,
		socialVoice,
		paidMarketing,
		engagement,
		conversion,
		growth,
		canonicalHealth,
		selfReported = {}
	} = diagnosticData;

	const layerConfidence = {
		gbp: gbp?.rating != null ? 1.0 : gbp ? 0.5 : 0.25,
		rank: rank?.keywords?.length >= 5 ? 1.0 : rank ? 0.5 : 0.25,
		citations: citations?.count > 0 ? 1.0 : citations ? 0.5 : 0.25,
		performance: lighthouse?.performance != null ? 1.0 : lighthouse ? 0.5 : 0.25,
		content: contentGap?.missing?.length > 0 ? 1.0 : contentGap ? 0.5 : 0.25,
		aiVisibility: aiVisibility?.liveResults != null ? 1.0 : aiVisibility ? 0.5 : 0.25,
		missedCalls: selfReported?.missedCallPct != null ? 1.0 : 0.5,
		social: socialVoice?.sentimentScore != null ? 1.0 : socialVoice ? 0.5 : 0.25,
		paid: paidMarketing?.competitorLSAs != null ? 1.0 : paidMarketing ? 0.5 : 0.25,
		engagement: engagement?.faqPresent != null ? 1.0 : engagement ? 0.5 : 0.25,
		conversion: conversion?.autoResponsePresent != null ? 1.0 : conversion ? 0.5 : 0.25,
		growth: growth?.gbpPostsLast90d != null ? 1.0 : growth ? 0.5 : 0.25,
		canonical: canonicalHealth?.surfacesChecked > 0 ? 1.0 : canonicalHealth ? 0.5 : 0.25,
		market:
			selfReported?.marketTierOverride != null ||
			BENCHMARKS.marketDemandLookup[(diagnosticData.business?.city || '').toLowerCase()]
				? 1.0
				: 0.5,
		brandEquity: selfReported?.yearsInBusiness != null ? 1.0 : 0.5
	};

	const confidenceValues = Object.values(layerConfidence);
	const diagnosticConfidence =
		Math.round((confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length) * 100) / 100;

	// uncertainty_spread = min + (0.25 × (1 - confidence))
	const uncertaintySpread =
		Math.round((BENCHMARKS.confidenceSpreadMin + 0.25 * (1 - diagnosticConfidence)) * 1000) / 1000;

	return { diagnosticConfidence, layerConfidence, uncertaintySpread };
}

/**
 * calcScenarioRecovery
 * Calculates the three recovery scenarios for the results modal.
 *
 * Scenario 1 -- Current Reality
 *   What the business recovers today: current capture rate × brand tenure modifier,
 *   constrained by current capacity utilization.
 *
 * Scenario 2 -- Market Opportunity
 *   What becomes recoverable as idle capacity fills to the realistic ceiling.
 *   Capture rate held at current (conservative). Brand tenure modifier applied.
 *
 * Scenario 3 -- Full Potential
 *   What the market can sustain at full personalization score (85% capture),
 *   full capacity, and market opportunity multiplier applied.
 *   Brand tenure modifier applied. Still capped at personalizationCaptureCeiling.
 *
 * All three scenarios apply the confidence-based range (low / mid / high).
 *
 * @param {number} totalGap               - Technical Revenue Gap (mid estimate)
 * @param {Object} personalization        - Result of calcPersonalizationScore()
 * @param {Object} capacityResult         - Result of calcCapacityLift()
 * @param {Object} brandTenure            - Result of getBrandTenureModifier()
 * @param {Object} marketOpportunity      - Result of getMarketOpportunityMultiplier()
 * @param {Object} confidenceResult       - Result of calcDiagnosticConfidence()
 * @returns {Object} { current, market, potential, technicalGap }
 */
function calcScenarioRecovery(
	totalGap,
	personalization,
	capacityResult,
	brandTenure,
	marketOpportunity,
	confidenceResult
) {
	const ceiling = BENCHMARKS.personalizationCaptureCeiling; // 0.85
	const spread = confidenceResult.uncertaintySpread;
	const tenure = brandTenure.modifier;

	// ── Gap range (confidence-based)
	const gapLow = Math.round(totalGap * (1 - spread));
	const gapMid = totalGap;
	const gapHigh = Math.round(totalGap * (1 + spread));

	// ── Scenario 1: Current Reality
	// Current capture rate × tenure modifier, capacity-constrained to avg quarterly utilization
	const currentCapturBase = personalization.captureRateDecimal || 0;
	const currentCaptureAdj = Math.min(currentCapturBase * tenure, ceiling);
	// Capacity constraint: average utilization across quarters as fraction of ceiling
	const avgGapPct = parseFloat(capacityResult.detail.avgAnnualGap) / 100;
	const currentCapacityFactor = Math.max(0, 1 - avgGapPct); // utilization = 1 - gap
	const currentCapture = currentCaptureAdj * currentCapacityFactor;

	const currentLow = Math.round(gapLow * currentCapture);
	const currentMid = Math.round(gapMid * currentCapture);
	const currentHigh = Math.round(gapHigh * currentCapture);

	// ── Scenario 2: Market Opportunity
	// Same capture rate + tenure, but capacity fills to realistic ceiling (full utilization)
	const marketCapture = Math.min(currentCapturBase * tenure, ceiling);

	const marketLow = Math.round(gapLow * marketCapture);
	const marketMid = Math.round(gapMid * marketCapture);
	const marketHigh = Math.round(gapHigh * marketCapture);

	// ── Scenario 3: Full Potential
	// Full personalization score (85% capture) × tenure modifier × market opportunity multiplier
	// Still capped at ceiling -- market opportunity multiplier amplifies but doesn't breach cap
	const fullCaptureBase = ceiling;
	const fullCaptureAdj = Math.min(fullCaptureBase * tenure, ceiling);
	const mktMult = marketOpportunity.multiplier;

	const potentialLow = Math.round(gapLow * fullCaptureAdj * mktMult);
	const potentialMid = Math.round(gapMid * fullCaptureAdj * mktMult);
	const potentialHigh = Math.round(gapHigh * fullCaptureAdj * mktMult);

	return {
		technicalGap: {
			low: gapLow,
			mid: gapMid,
			high: gapHigh,
			display: {
				low: formatCurrency(gapLow),
				mid: formatCurrency(gapMid),
				high: formatCurrency(gapHigh)
			}
		},
		current: {
			label: BENCHMARKS.scenarioLabels.current,
			captureRate: Math.round(currentCapture * 100) + '%',
			low: currentLow,
			mid: currentMid,
			high: currentHigh,
			display: {
				low: formatCurrency(currentLow),
				mid: formatCurrency(currentMid),
				high: formatCurrency(currentHigh)
			}
		},
		market: {
			label: BENCHMARKS.scenarioLabels.market,
			captureRate: Math.round(marketCapture * 100) + '%',
			low: marketLow,
			mid: marketMid,
			high: marketHigh,
			display: {
				low: formatCurrency(marketLow),
				mid: formatCurrency(marketMid),
				high: formatCurrency(marketHigh)
			}
		},
		potential: {
			label: BENCHMARKS.scenarioLabels.potential,
			captureRate: Math.round(fullCaptureAdj * ceiling * 100) + '%',
			marketMultiplier: mktMult.toFixed(2) + 'x',
			low: potentialLow,
			mid: potentialMid,
			high: potentialHigh,
			display: {
				low: formatCurrency(potentialLow),
				mid: formatCurrency(potentialMid),
				high: formatCurrency(potentialHigh)
			}
		},
		meta: {
			uncertaintySpread: formatPct(spread),
			diagnosticConfidence: formatPct(confidenceResult.diagnosticConfidence),
			brandTenureModifier: tenure.toFixed(2) + 'x',
			brandTenureLabel: brandTenure.label,
			marketOpportunityMultiplier: mktMult.toFixed(2) + 'x',
			demandTier: marketOpportunity.demandLabel,
			densityLabel: marketOpportunity.densityLabel
		}
	};
}

/**
 * calculateDiagnostic
 *
 * Takes the complete diagnosticData object and returns a results object
 * ready for the frontend to render.
 *
 * @param {Object} diagnosticData - Complete data from all API layers + self-reported inputs
 * @returns {Object} results - Fully calculated results object
 */
function calculateDiagnostic(diagnosticData, intakeInputs = {}) {
	const {
		business = {},
		selfReported = {},
		gbp = null,
		rank = null,
		citations = null,
		lighthouse = null,
		contentGap = null,
		aiVisibility = null,
		socialVoice = null,
		paidMarketing = null,
		engagement: rawEngagement = null,
		conversion = null,
		growth = null,
		canonicalHealth = null,
		layerErrors = {},
		personalizationSignals: ps = {}
	} = diagnosticData;

	// ── Core inputs (Resilient mapping v2.5)
	const annualRevenue =
		intakeInputs?.annualRevenue ??
		diagnosticData.revenue?.annualRevenue ??
		selfReported.annualRevenue ??
		300000;

	const vertical = business.vertical || 'trades';
	const population = business.population || 50000;
	const trade = business.trade || 'plumber';
	const city = business.city || '';

	const primaryTradeKey = getTradeKey(trade);
	const avgSaleValue =
		diagnosticData.revenue?.avgSaleValue ||
		selfReported.avgSaleValue ||
		getDefaultAvgSaleValue(primaryTradeKey);
	const secondaryTradeName =
		business.secondaryTrade ||
		(Array.isArray(diagnosticData.trades) ? diagnosticData.trades[1]?.name : null) ||
		null;
	const secondaryTradeKey = secondaryTradeName ? getTradeKey(secondaryTradeName) : null;
	const avgSaleValueSecondary =
		diagnosticData.revenue?.avgSaleValueSecondary ||
		selfReported.avgSaleValueSecondary ||
		(secondaryTradeKey ? getDefaultAvgSaleValue(secondaryTradeKey) : null);

	const missedCallsIn =
		diagnosticData.revenue?.missedCallsPerMonth || selfReported.missedCallsPerMonth || 0;

	const capacityUtil =
		diagnosticData.revenue?.capacityUtilization || selfReported.capacityUtilization || 0.75;

	const yearsInBusiness =
		intakeInputs?.yearsInBusiness ??
		diagnosticData.operations?.yearsInBusiness ??
		selfReported.yearsInBusiness ??
		5;

	// ── Multipliers
	const seasonal = calculateSeasonalMultiplier(
		diagnosticData.operations?.seasonal || selfReported.seasonal
	);
	const engResult = calculateEngagementScore(rawEngagement);
	const engagementMult = engResult.multiplier;
	const aiResult = calculateAiScore(aiVisibility, citations);
	const aiMult = aiResult.multiplier;
	const { citationMult, napMult } = calculateCitationMultipliers(citations);

	// ── Layer 12: Canonical health suppression multiplier
	const canonicalResult = calcCanonicalHealth(canonicalHealth);
	const canonicalMult = canonicalResult.suppressionMult;

	// ── Brand Tenure Modifier
	const brandTenure = getBrandTenureModifier(yearsInBusiness);

	// ── Market Opportunity Multiplier
	const marketOpportunity = getMarketOpportunityMultiplier(
		city,
		diagnosticData.operations?.marketTierOverride || selfReported.marketTierOverride,
		paidMarketing
	);

	// ── Diagnostic Confidence
	const confidenceResult = calcDiagnosticConfidence(diagnosticData);

	// ── Monthly search volume estimate (fallback only)
	const monthlySearches =
		business.monthlySearchVolume || estimateMonthlySearchVolume(trade, city, population);

	// ── Average current CTR from rank data
	const ctrMap = BENCHMARKS.mapPackCTR;
	const avgCurrentCtr =
		rank && rank.keywords
			? avg(rank.keywords.map((kw) => ctrMap[kw.position] || ctrMap['none']))
			: ctrMap['none'];

	// ── Calculate all gaps

	// Layer 3: Site retention rate (Session 15)
	const siteRetentionRate = getSiteRetentionRate(
		lighthouse?.performanceScore || lighthouse?.performance || 0
	);

	// --- Session 18 Scaling ---
	const cityHouseholds = business.households || getCityHouseholds(city, population);
	const scalingFactor =
		(cityHouseholds / BENCHMARKS.sudburyHouseholds) * BENCHMARKS.captiveMarketUplift;

	const rankByTrade = diagnosticData.rankByTrade || {};
	const intakeTrades = Array.isArray(diagnosticData.trades) ? diagnosticData.trades : [];
	const gbpTrades = intakeTrades.length
		? intakeTrades.map((t) => t.name).filter(Boolean)
		: [trade];
	if (secondaryTradeName && !gbpTrades.includes(secondaryTradeName)) {
		gbpTrades.push(secondaryTradeName);
	}

	const gbpTradeResults = gbpTrades
		.filter(Boolean)
		.map((tradeName, idx) => {
			const tradeKey = getTradeKey(tradeName);
			const avgSaleValueForTrade =
				idx === 0
					? avgSaleValue
					: avgSaleValueSecondary || avgSaleValue;
			const sudburyMonthlyVolume = getSudburyMonthlyVolume(
				rankByTrade[tradeName],
				tradeKey
			);
			const scaledMonthlySearches = Math.round(sudburyMonthlyVolume * scalingFactor);
			const result = calcGbpGap(
				gbp,
				scaledMonthlySearches,
				avgSaleValueForTrade,
				yearsInBusiness,
				siteRetentionRate,
				vertical
			);
			return {
				trade: tradeName,
				tradeKey,
				avgSaleValue: avgSaleValueForTrade,
				sudburyMonthlyVolume,
				scaledMonthlySearches,
				result
			};
		});

	const gbpGapBase = gbpTradeResults[0]?.result;
	const gbpGapTotal = gbpTradeResults.reduce((sum, item) => sum + item.result.value, 0);
	const gbpGapResult = gbpGapBase
		? {
				...gbpGapBase,
				value: Math.round(gbpGapTotal),
				detail: {
					...gbpGapBase.detail,
					byTrade: gbpTradeResults.map((item) => ({
						trade: item.trade,
						value: Math.round(item.result.value)
					}))
				}
			}
		: calcGbpGap(
				gbp,
				0,
				avgSaleValue,
				yearsInBusiness,
				siteRetentionRate,
				vertical
			);

	// Layer 2 Rank Gap (supports weighted dual-trade intake)
	const weightedTradesInput = intakeTrades
		.map((tradeInput, idx) => {
			const isPrimary = tradeInput.role === 'primary' || idx === 0;
			const mappedAvgSaleValue = isPrimary
				? diagnosticData.revenue?.avgSaleValue || avgSaleValue
				: diagnosticData.revenue?.avgSaleValueSecondary ||
					diagnosticData.revenue?.avgSaleValue ||
					avgSaleValueSecondary ||
					avgSaleValue;
			return {
				trade: tradeInput.name,
				rank: rankByTrade[tradeInput.name] || null,
				avgSaleValue: mappedAvgSaleValue,
				weightPct: Number(tradeInput.revenuePct || 0)
			};
		})
		.filter((tradeInput) => tradeInput.trade);

	const rankGapResult =
		weightedTradesInput.length > 0
			? calcWeightedRankGap(weightedTradesInput, cityHouseholds, siteRetentionRate)
			: calcRankGap(rank, cityHouseholds, avgSaleValue, siteRetentionRate, trade);

	const perfGapResult = calcPerformanceGap(
		lighthouse,
		monthlySearches,
		avgCurrentCtr,
		avgSaleValue,
		seasonal
	);
	const contentGapResult = calcContentGap(contentGap, avgSaleValue, seasonal, engagementMult);
	const missedCallResult = calcMissedCallGap(
		{
			...selfReported,
			annualRevenue,
			avgSaleValue,
			missedCallsPerMonth: missedCallsIn,
			capacityUtilization: capacityUtil
		},
		monthlySearches,
		avgCurrentCtr,
		avgSaleValue,
		seasonal
	);
	const capacityResult = calcCapacityLift(
		{
			...selfReported,
			annualRevenue,
			avgSaleValue,
			missedCallsPerMonth: missedCallsIn,
			capacityUtilization: capacityUtil,
			adminStaffCount: diagnosticData.operations?.adminStaffCount,
			adminHoursPerWeek: diagnosticData.operations?.adminHoursPerWeek
		},
		avgSaleValue,
		seasonal,
		vertical
	);
	const growthResult = calcGrowthScore(
		growth,
		gbp,
		socialVoice,
		contentGap,
		{ ...selfReported, annualRevenue },
		population
	);

	// Extract raw quarterly gap fractions for Social_Adjustment Components 3-5
	const quarterlyCapacityGaps = {
		q1: parseFloat(capacityResult.detail.quarterlyGaps.q1) / 100,
		q2: parseFloat(capacityResult.detail.quarterlyGaps.q2) / 100,
		q3: parseFloat(capacityResult.detail.quarterlyGaps.q3) / 100,
		q4: parseFloat(capacityResult.detail.quarterlyGaps.q4) / 100
	};

	const socialResult = calcSocialAdjustment(
		socialVoice,
		gbpGapResult.value,
		avgSaleValue,
		annualRevenue,
		quarterlyCapacityGaps
	);
	const paidGapResult = calcPaidGap(
		paidMarketing,
		selfReported,
		lighthouse,
		gbp,
		contentGap,
		seasonal
	);
	const engagementResult = calcEngagementGap(
		engResult,
		monthlySearches,
		avgCurrentCtr,
		avgSaleValue,
		seasonal,
		engagementMult
	);
	const convInfraResult = calcConversionInfrastructureAdjustment(
		conversion,
		missedCallResult.value
	);

	// ── Adjusted missed call gap (reduced by conversion infrastructure if auto-response present)
	const adjustedMissedCallGap = Math.max(0, missedCallResult.value + convInfraResult.adjustment);

	// ── Unified Revenue Gap Projection (Session 18 Alignment)
	// Step 1: Combine Layer 1 & Layer 2 bases
	const coreBaseGap = gbpGapResult.value + rankGapResult.value;

	// Step 2: Apply Tenure/Economic Modifiers
	const coreAdjusted = applyModifiers(
		coreBaseGap,
		yearsInBusiness,
		marketOpportunity.demandTier
	);
	const coreUltraConservative = Math.round(
		coreAdjusted * BENCHMARKS.ultraConservativeDiscount
	);

	// Step 3: Sum other technical gaps (Performance, Content, Missed Calls, etc.)
	const secondaryGaps =
		perfGapResult.value +
		contentGapResult.value +
		adjustedMissedCallGap +
		socialResult.value +
		paidGapResult.value +
		engagementResult.value;

	// Step 4: Final Unified Gap
	const totalGap = coreAdjusted + secondaryGaps;

	// ── Projected revenue
	const projectedRevenue = Math.round(annualRevenue + totalGap + capacityResult.value);

	// ── Benchmark lift percentage
	const benchmark = BENCHMARKS.verticalBenchmarks[vertical] || BENCHMARKS.verticalBenchmarks.trades;

	// ── Health scorecard
	const healthScores = {
		gbp: {
			status: layerErrors.gbp ? 'error' : getGbpStatus(gbp),
			rating: gbp?.rating || (layerErrors.gbp ? 'error' : 'not found'),
			reviewCount: gbp?.reviewCount || 0,
			error: layerErrors.gbp
		},
		rank: {
			status: layerErrors.rank ? 'error' : getRankStatus(rank),
			keywords: rank?.keywords || [],
			error: layerErrors.rank
		},
		citations: {
			status: layerErrors.citations ? 'error' : getCitationStatus(citations),
			count: citations?.count || 0,
			benchmark: BENCHMARKS.citationBenchmark,
			napConsistent: !citations?.napMismatches,
			schemaPresent: citations?.schemaPresent || false,
			error: layerErrors.citations
		},
		performance: {
			status: layerErrors.performance
				? 'error'
				: (lighthouse?.performance || 0) >= 80
					? 'green'
					: (lighthouse?.performance || 0) >= 50
						? 'amber'
						: 'red',
			score: lighthouse?.performance || 0,
			cwvPass: (lighthouse?.lcp?.pass && lighthouse?.cls?.pass) || false,
			error: layerErrors.performance
		},
		content: {
			status: layerErrors.content ? 'error' : contentGapResult.detail?.status || 'red',
			coveragePct: contentGapResult.detail?.coveragePct || '0%',
			missing: contentGapResult.detail?.missing || 0,
			error: layerErrors.content
		},
		aiVisibility: {
			status: layerErrors.ai ? 'error' : getAiStatus(aiResult.score),
			score: aiResult.score,
			platforms: aiResult.platforms || {},
			error: layerErrors.ai
		},
		missedCalls: {
			status: missedCallResult.detail?.status || 'red',
			rate: missedCallResult.detail?.missedCallPct || '0%'
		},
		social: {
			status: layerErrors.market ? 'error' : socialResult.detail?.status || 'red',
			sentiment: socialResult.detail?.sentimentScore || '0%',
			themes: socialResult.detail?.themes || [],
			error: layerErrors.market
		},
		paidPressure: {
			status: layerErrors.market ? 'error' : paidGapResult.detail?.status || 'green',
			competitors:
				(paidGapResult.detail?.competitorLSAs?.length || 0) +
				(paidGapResult.detail?.competitorGoogleAds?.length || 0) +
				(paidGapResult.detail?.competitorMetaAds?.length || 0),
			error: layerErrors.market
		},
		engagement: {
			status: engagementResult.detail?.status || 'red',
			score: engResult.score,
			signals: engResult.signals || {}
		},
		conversion: {
			status: layerErrors.content ? 'error' : convInfraResult.detail?.status || 'red',
			score: convInfraResult.detail?.conversionScore || '0/5',
			error: layerErrors.content
		},
		growth: {
			score: growthResult.score,
			label: growthResult.label,
			signals: growthResult.signals,
			brandEquity: growthResult.brandEquity
		},
		// Layer 12 -- canonical health
		canonicalHealth: {
			status: getCanonicalStatus(canonicalResult),
			alignmentPct: canonicalResult.detail?.alignmentPct || 'not checked',
			suppressionMult: canonicalResult.suppressionMult,
			duplicateGbpFound: canonicalResult.detail?.duplicateGbpFound || false,
			napMismatches: canonicalResult.detail?.napMismatches || 0,
			aiAccuracyScore: canonicalResult.detail?.aiAccuracyScore || 'not checked',
			remediationList: canonicalResult.detail?.remediationList || []
		}
	};

	// ── Gap breakdown for display
	const gaps = {
		gbp: gbpGapResult.value,
		rank: rankGapResult.value,
		performance: perfGapResult.value,
		content: contentGapResult.value,
		missedCalls: adjustedMissedCallGap,
		social: socialResult.value,
		paid: paidGapResult.value,
		engagement: engagementResult.value,
		capacityLift: capacityResult.value,
		total: totalGap,
		projected: projectedRevenue,
		// Formatted for display
		display: {
			current: formatCurrency(annualRevenue),
			gap: formatCurrency(totalGap),
			capacity: formatCurrency(capacityResult.value),
			projected: formatCurrency(projectedRevenue)
		}
	};

	// ── Capacity insight plain language
	const capDetail = capacityResult.detail;
	const adminPersonLabel =
		(selfReported.adminStaffCount || 1) === 1
			? 'the owner or manager'
			: `${selfReported.adminStaffCount} people`;
	const capacityInsight = `${adminPersonLabel.charAt(0).toUpperCase() + adminPersonLabel.slice(1)} is currently spending ${capDetail.adminHoursPerWeek} hours per week on admin. ClearSky automation returns approximately ${capDetail.savedHrsPerWeek} of those hours per week. At $${capDetail.adminHourlyRate}/hr that is $${Math.round((capDetail.savedHrsPerWeek * capDetail.adminHourlyRate * 52) / 1000)}K per year in reclaimed time -- without hiring anyone new. Combined with filling ${capDetail.avgAnnualGap} of idle capacity across the year, total addressable value is ${formatCurrency(capDetail.totalCapacityValue)}.`;

	// ── Meta
	const meta = {
		seasonalMultiplier: Math.round(seasonal * 100) + '%',
		aiRiskMultiplier: aiMult.toFixed(2) + 'x',
		engagementMultiplier: Math.round(engagementMult * 100) + '%',
		citationMultiplier: citationMult.toFixed(2) + 'x',
		canonicalMultiplier: canonicalMult.toFixed(2) + 'x', // Layer 12
		benchmarkLift: benchmark.pct,
		verticalLabel: benchmark.label,
		monthlySearches,
		avgCurrentCtr: Math.round(avgCurrentCtr * 100) + '%'
	};

	// ── Scenario Recovery
	// calcScenarioRecovery requires personalization result which is computed
	// externally after calculateDiagnostic(). A pre-personalization pass is
	// run here with captureRateDecimal=0 so the modal can render immediately.
	// The integration layer should call calcScenarioRecovery() again after
	// calcPersonalizationScore() and merge the result into scenarios.
	const scenarioResult = calcScenarioRecovery(
		totalGap,
		{ captureRateDecimal: 0 }, // pre-personalization placeholder
		capacityResult,
		brandTenure,
		marketOpportunity,
		confidenceResult
	);

	return {
		business: {
			name: business.name,
			city: business.city,
			trade: business.trade,
			websiteURL: business.websiteURL,
			gbpRating: gbp?.rating || 'not found',
			reviewCount: gbp?.reviewCount || 0,
			lighthouseScore: lighthouse?.performance || 0,
			mapPackPosition: rank?.keywords?.[0]?.position || 'not in pack'
		},
		healthScores,
		gaps,
		capacityInsight,
		growthStatement: growthResult.growthStatement,
		scenarios: scenarioResult,
		meta: {
			...meta,
			brandTenureModifier: brandTenure.modifier.toFixed(2) + 'x',
			brandTenureLabel: brandTenure.label,
			brandTenureYears: yearsInBusiness || BENCHMARKS.yearsInBusinessDefault,
			marketOpportunityMultiplier: marketOpportunity.multiplier.toFixed(2) + 'x',
			marketDemandTier: marketOpportunity.demandLabel,
			competitiveDensity: marketOpportunity.densityLabel,
			paidCompetitorCount: marketOpportunity.paidCompetitorCount,
			diagnosticConfidence: formatPct(confidenceResult.diagnosticConfidence),
			uncertaintySpread: formatPct(confidenceResult.uncertaintySpread)
		},
		// Raw gap details for debugging / transparency
		rawGaps: {
			gbp: gbpGapResult,
			rank: rankGapResult,
			performance: perfGapResult,
			content: contentGapResult,
			missedCalls: missedCallResult,
			social: socialResult,
			paid: paidGapResult,
			engagement: engagementResult,
			conversion: convInfraResult,
			capacity: capacityResult,
			growth: growthResult,
			canonical: canonicalResult, // Layer 12
			confidence: confidenceResult,
			brandTenure,
			marketOpportunity,
			core: {
				baseGap: coreBaseGap,
				totalRecoverable: coreAdjusted,
				ultraConservative: coreUltraConservative
			},
			layerErrors
		}
	};
}

// MARKET_CLUSTERS — Session 18 D.5
// Household counts for city scaling. Sudbury (1002124) is the index market.
// Keyword volumes are always queried at Sudbury, then scaled using:
//   scaledMonthlySearches = sudburyVolume × (cityHouseholds / 73,000) × 1.20
const MARKET_CLUSTERS = {
	timmins: { households: 20941, locationCode: 1002836, tier: 'active' },
	cochrane: { households: 8360, locationCode: 1002549, tier: 'slow' },
	kapuskasing: { households: 8360, locationCode: 1002549, tier: 'slow' },
	hearst: { households: 8360, locationCode: 1002549, tier: 'slow' },
	'kirkland lake': { households: 4064, locationCode: 1002557, tier: 'active' },
	'mcgarry twp': { households: 4064, locationCode: 1002557, tier: 'active' },
	englehart: { households: 5401, locationCode: null, tier: 'slow' },
	'new liskeard': { households: 5401, locationCode: null, tier: 'slow' },
	cobalt: { households: 5401, locationCode: null, tier: 'slow' },
	'north bay': { households: 30737, locationCode: 1002116, tier: 'active' },
	sudbury: { households: 73000, locationCode: 1002124, tier: 'active' }
};

function getCityHouseholds(city, population) {
	if (!city) return 20000;
	const key = city.toLowerCase().trim();
	return MARKET_CLUSTERS[key]?.households || 20000;
}

function getTradeKey(tradeName = '') {
	const t = (tradeName || '').toLowerCase();
	if (t.includes('hvac') || t.includes('heating') || t.includes('cooling')) return 'hvac';
	if (t.includes('plumb')) return 'plumbing';
	if (t.includes('roof')) return 'roofing';
	if (t.includes('electric')) return 'electrical';
	return 'plumbing';
}

function getDefaultAvgSaleValue(tradeNameOrKey = '') {
	const tradeKey = getTradeKey(tradeNameOrKey);
	return tradeKey === 'hvac'
		? BENCHMARKS.hvacAvgSaleValue
		: BENCHMARKS.plumbingAvgSaleValue;
}

function getSudburyMonthlyVolume(rankData, _tradeKey) {
	const fromRank = Array.isArray(rankData?.keywords)
		? rankData.keywords.reduce(
				(sum, kw) => sum + Number(kw.sudburyVolume || kw.searchVolume || 0),
				0
			)
		: 0;
	return fromRank;
}

/**
 * Calculate organic health score (0-1) used in paid efficiency gap
 */
function calculateOrganicHealthScore(lighthouse, gbp, contentGap) {
	const lighthouseHealth = (lighthouse?.performance || 0) / 100;
	const gbpHealth = (gbp?.rating || 0) / 5;
	const covered = contentGap?.covered || 0;
	const total = covered + (contentGap?.missing?.length || 0);
	const contentHealth = total > 0 ? covered / total : 0;
	return avg([lighthouseHealth, gbpHealth, contentHealth]);
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

export {
	calculateDiagnostic,
	BENCHMARKS,
	MARKET_CLUSTERS,
	calcGbpGap,
	calcWeightedRankGap,
	formatCurrency,
	estimateMonthlySearchVolume,
	getSiteRetentionRate,
	getCityHouseholds,
	getTradeKey,
	getDefaultAvgSaleValue,
	getSudburyMonthlyVolume,
	applyModifiers,
	getModifierDerivation
};
