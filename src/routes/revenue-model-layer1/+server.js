import { json } from '@sveltejs/kit';
import { GOOGLE_MAPS_API_KEY, DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } from '$env/static/private';
import {
	calcGbpGap,
	getSiteRetentionRate,
	applyModifiers,
	formatCurrency,
	BENCHMARKS,
	getCityHouseholds,
	getTradeKey,
	getModifierDerivation
} from '$lib/clearsky/clearsky-engine.js';
import { fetchGoogleDetailsFull } from '$lib/clearsky/google-helpers.js';
import {
	DataForSEOError,
	fetchIndexMarketKeywordVolumes
} from '$lib/clearsky/dataforseo-google-ads.js';
import { runWithRevenueReport, getRevenueReportStore } from '$lib/clearsky/revenue-report-context.js';
import { buildLayer1ReportTxt } from '$lib/clearsky/layer1-report-txt.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

/** @param {{ request: Request }} event */
export async function POST({ request }) {
	try {
		const inputs = await request.json();
		const { businessName, city, trade, yearsInBusiness, websiteUrl, psiScore } = inputs;
		const years = Number(yearsInBusiness) || 5;
		const finalCity = city.toLowerCase().trim();

		if (!businessName || !city || !trade) {
			return json(
				attachExplainer('revenue-layer1', { success: false, error: 'Missing required fields' }),
				{ status: 400 }
			);
		}

		return await runWithRevenueReport(async () => {
		const tradeKey = getTradeKey(trade);
		const defaultAvgSale = tradeKey === 'hvac' ? BENCHMARKS.hvacAvgSaleValue : BENCHMARKS.plumbingAvgSaleValue;
		const avgSaleValue = Number(inputs.avgSaleValue) || defaultAvgSale;
		const psi = Number(psiScore) || 100;
		const siteRetentionRate = getSiteRetentionRate(psi);
		const mapPackPosition = Number(inputs.mapPackPosition) || 1;

		// ── Index-market volume (Google Ads live at Sudbury) + same scaling formula ──
		// Each keyword: indexVolume × (cityHouseholds ÷ 73,000) × 1.20
		// All 5 keywords summed for calcGbpGap.
		const indexPack = await fetchIndexMarketKeywordVolumes(
			DATAFORSEO_LOGIN,
			DATAFORSEO_PASSWORD,
			trade
		);
		const sudburyKeywords = indexPack.keywords;
		const households = getCityHouseholds(city);
		const cityScale = households / BENCHMARKS.sudburyHouseholds;

		const keywordBreakdown = sudburyKeywords.map((kw) => ({
			keyword: kw.keyword,
			sudburyVolume: kw.volume,
			indexLocationCode: indexPack.indexLocationCode,
			volumeSource: indexPack.source,
			scaledVolume: Math.round(kw.volume * cityScale),
			scaledWithUplift: Math.round(kw.volume * cityScale * BENCHMARKS.captiveMarketUplift)
		}));

		const scaledMonthlySearches = Math.round(
			sudburyKeywords.reduce(
				(sum, kw) => sum + kw.volume * cityScale * BENCHMARKS.captiveMarketUplift,
				0
			)
		);

		console.log('[Layer1] INDEX-MARKET VOLUMES (all keywords summed):', {
			trade: tradeKey,
			city: finalCity,
			households,
			sudburyHouseholds: BENCHMARKS.sudburyHouseholds,
			cityScale: cityScale.toFixed(4),
			indexMarket: indexPack.indexMarketName,
			volumeSource: indexPack.source,
			keywordBreakdown,
			scaledMonthlySearches
		});

		// ── GBP data from Google ──
		const gbp = await fetchGoogleDetailsFull(
			businessName,
			city,
			GOOGLE_MAPS_API_KEY,
			DATAFORSEO_LOGIN,
			DATAFORSEO_PASSWORD,
			websiteUrl
		);

		console.log('[Layer1] INPUTS:', {
			businessName,
			city: finalCity,
			trade: tradeKey,
			years,
			avgSaleValue,
			psi,
			siteRetentionRate,
			mapPackPosition,
			scaledMonthlySearches
		});

		// ── GBP Gap calculation (uses Sudbury-scaled volume) ──
		const result = calcGbpGap(
			gbp,
			scaledMonthlySearches,
			avgSaleValue,
			yearsInBusiness,
			siteRetentionRate,
			'trades',
			mapPackPosition
		);

		// ── Modifiers: tenure + economic lift + conservative discount ──
		const marketTier =
			/** @type {Record<string, string>} */ (BENCHMARKS.marketDemandLookup)[finalCity] || 'neutral';
		const baseGap = result.value;
		const adjustedGap = applyModifiers(baseGap, years, marketTier);
		const finalGap = Math.round(adjustedGap * BENCHMARKS.ultraConservativeDiscount);
		const modifierDerivation = getModifierDerivation(baseGap, years, marketTier);

		console.log('[Layer1] MODIFIERS:', {
			baseGap,
			marketTier,
			adjustedGap,
			conservativeDiscount: BENCHMARKS.ultraConservativeDiscount,
			finalGap
		});

		const frontendLayer1 = {
			...result,
			value: finalGap,
			displayValue: formatCurrency(finalGap),
			appliedDiscount: '15% (Conservative)',
			keywordBreakdown,

			scores: {
				starRating: result.signals
					? Math.round((result.signals[0].earned / result.signals[0].max) * 100)
					: 0,
				reviewCount: result.signals
					? Math.round((result.signals[1].earned / result.signals[1].max) * 100)
					: 0,
				photos: result.signals
					? Math.round((result.signals[2].earned / result.signals[2].max) * 100)
					: 0,
				hours: result.signals
					? Math.round((result.signals[3].earned / result.signals[3].max) * 100)
					: 0,
				responseRate: result.signals
					? Math.round((result.signals[4].earned / result.signals[4].max) * 100)
					: 0,
				website: result.signals
					? Math.round((result.signals[5].earned / result.signals[5].max) * 100)
					: 0,
				qa: result.signals
					? Math.round((result.signals[6].earned / result.signals[6].max) * 100)
					: 0,
				description: result.signals
					? Math.round((result.signals[7].earned / result.signals[7].max) * 100)
					: 0,
				services: result.signals
					? Math.round((result.signals[8].earned / result.signals[8].max) * 100)
					: 0
			},

			weightedContribution: {
				starRating: result.signals ? result.signals[0].earned : 0,
				reviewCount: result.signals ? result.signals[1].earned : 0,
				photos: result.signals ? result.signals[2].earned : 0,
				hours: result.signals ? result.signals[3].earned : 0,
				responseRate: result.signals ? result.signals[4].earned : 0,
				website: result.signals ? result.signals[5].earned : 0,
				qa: result.signals ? result.signals[6].earned : 0,
				description: result.signals ? result.signals[7].earned : 0,
				services: result.signals ? result.signals[8].earned : 0
			},

			metrics: {
				rating: gbp.rating,
				reviewCount: gbp.reviewCount,
				targetReviews: (yearsInBusiness || 5) * 6,
				photoCount: gbp.photos?.length || (gbp.photosPresent ? 5 : 0),
				responseRate: Math.round(
					((gbp.ownerResponseCount || 0) / (gbp.reviewCount || 1)) * 100
				),
				totalPenaltyPct: Math.round(result.appliedPenalty * 100) + '%',
				status: result.detail.status
			}
		};

		const reportText = buildLayer1ReportTxt({
			generatedAt: new Date().toISOString(),
			inputs,
			indexPack,
			households,
			sudburyHouseholds: BENCHMARKS.sudburyHouseholds,
			cityScale,
			scaledMonthlySearches,
			mapPackPosition,
			siteRetentionRate,
			avgSaleValue,
			yearsInBusiness: years,
			marketTier,
			baseGap,
			adjustedGap,
			finalGap,
			ultraConservativeDiscount: BENCHMARKS.ultraConservativeDiscount,
			modifierDerivation,
			calcGbpResult: result,
			calls: getRevenueReportStore()?.calls ?? []
		});

		return json(
			attachExplainer('revenue-layer1', {
				success: true,
				business: {
					name: gbp.name,
					address: gbp.formatted_address,
					website: gbp.website
				},
				layer1: frontendLayer1,
				reportText
			})
		);
		});
	} catch (err) {
		console.error('[revenue-model] Error:', err);
		if (err instanceof DataForSEOError) {
			return json(
				attachExplainer('revenue-layer1', { success: false, error: err.message, code: err.code }),
				{ status: 502 }
			);
		}
		const message = err instanceof Error ? err.message : String(err);
		return json(attachExplainer('revenue-layer1', { success: false, error: message }), { status: 500 });
	}
}
