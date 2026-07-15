import {
	calcWeightedRankGap,
	calculateDiagnostic,
	getSiteRetentionRate,
	getCityHouseholds,
	formatCurrency
} from '$lib/clearsky/clearsky-engine.js';
import {
	fetchDataForSEORankLayer,
	fetchPageSpeedLayer,
	fetchDataForSEOLayer
} from '$lib/clearsky/api-orchestrator.js';
import { fetchGoogleDetailsLight } from '$lib/clearsky/google-helpers.js';

import {
	GOOGLE_PAGESPEED_API_KEY,
	DATAFORSEO_LOGIN,
	DATAFORSEO_PASSWORD,
	GOOGLE_MAPS_API_KEY
} from '$env/static/private';
import { DataForSEOError } from '$lib/clearsky/dataforseo-google-ads.js';
import { json } from '@sveltejs/kit';
import { runWithRevenueReport, getRevenueReportStore } from '$lib/clearsky/revenue-report-context.js';
import { buildLayer2ReportTxt } from '$lib/clearsky/layer2-report-txt.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

/** @param {{ request: Request }} event */
export async function POST({ request }) {
	try {
		const {
			businessName,
			city,
			trade,
			secondaryTrade,
			revenueSplit,
			websiteUrl: inputWebsite,
			yearsInBusiness,
			annualRevenue,
			avgSaleValue,
			avgSaleValueSecondary
		} = await request.json();

		return await runWithRevenueReport(async () => {
		const years = Number(yearsInBusiness) || 5;
		const finalCity = (city || '').toLowerCase().trim();
		const avgSaleValuePrimary =
			Number(avgSaleValue) || (trade?.toLowerCase() === 'hvac' ? 3000 : 1500);
		const avgSaleValueSecond =
			Number(avgSaleValueSecondary) || (secondaryTrade?.toLowerCase() === 'hvac' ? 3000 : 1500);
		const callToPurchaseRate = 0.10;
		const primarySplitInput = Number(revenueSplit?.primary ?? (secondaryTrade ? 70 : 100));
		const secondarySplitInput = secondaryTrade
			? Number(revenueSplit?.secondary ?? 100 - primarySplitInput)
			: 0;
		const primarySplit = Math.max(
			0,
			Math.min(100, Number.isNaN(primarySplitInput) ? 100 : primarySplitInput)
		);
		const secondarySplit = secondaryTrade
			? Math.max(
					0,
					Math.min(
						100,
						Number.isNaN(secondarySplitInput) ? 100 - primarySplit : secondarySplitInput
					)
				)
			: 0;
		const splitTotal = secondaryTrade ? primarySplit + secondarySplit : 100;
		const primaryWeight = secondaryTrade ? primarySplit / (splitTotal || 1) : 1;
		const secondaryWeight = secondaryTrade ? secondarySplit / (splitTotal || 1) : 0;

		if (!businessName || !city) {
			return json(
				attachExplainer('revenue-layer2', {
					success: false,
					error: 'BUSINESS_NAME_AND_CITY_REQUIRED'
				})
			);
		}

		const gbpDetails = await fetchGoogleDetailsLight(
			businessName,
			city,
			GOOGLE_MAPS_API_KEY,
			inputWebsite
		);
		const rating = gbpDetails?.rating || 0;
		const reviews_count = gbpDetails?.reviewCount || 0;
		const cid = gbpDetails?.cid;
		const finalWebsite = gbpDetails?.website || inputWebsite;

		const qaRes = cid
			? await fetchDataForSEOLayer(
					`cid:${cid}`,
					city,
					trade,
					DATAFORSEO_LOGIN,
					DATAFORSEO_PASSWORD,
					businessName
				)
			: { qa: { count: 0, answeredCount: 0 }, searchVolume: 0 };
		const qaResSecondary =
			secondaryTrade && cid
				? await fetchDataForSEOLayer(
						`cid:${cid}`,
						city,
						secondaryTrade,
						DATAFORSEO_LOGIN,
						DATAFORSEO_PASSWORD,
						businessName
					)
				: { qa: { count: 0, answeredCount: 0 }, searchVolume: 0 };

		const monthlySearches = qaRes.searchVolume;
		const monthlySearchesSecondary = qaResSecondary.searchVolume;

		const rankRes = await fetchDataForSEORankLayer(
			businessName,
			trade,
			city,
			DATAFORSEO_LOGIN,
			DATAFORSEO_PASSWORD
		);
		const rank = rankRes.data || rankRes;
		const rankResSecondary = secondaryTrade
			? await fetchDataForSEORankLayer(
					businessName,
					secondaryTrade,
					city,
					DATAFORSEO_LOGIN,
					DATAFORSEO_PASSWORD
				)
			: null;
		const rankSecondary = rankResSecondary?.data || null;

		const psiRes = await fetchPageSpeedLayer(finalWebsite, GOOGLE_PAGESPEED_API_KEY);
		const performanceScore = psiRes.data?.performance || 50;
		const siteRetentionRate = getSiteRetentionRate(performanceScore);

		const engineResult = calculateDiagnostic({
			business: {
				name: businessName,
				city,
				trade,
				monthlySearchVolume: monthlySearches,
				vertical: 'trades'
			},
			revenue: { annualRevenue, avgSaleValue: avgSaleValuePrimary },
			operations: { yearsInBusiness },
			selfReported: { annualRevenue, avgSaleValue: avgSaleValuePrimary, yearsInBusiness },
			gbp: {
				rating: rating,
				reviewCount: reviews_count,
				qa: qaRes.qa,
				services: qaRes.services || [],
				place_id: gbpDetails?.cid || gbpDetails?.name || businessName
			},
			rank
		});

		const households = getCityHouseholds(city);

		const weightedLayer2Base = calcWeightedRankGap(
			[
				{
					trade,
					rank,
					avgSaleValue: avgSaleValuePrimary,
					weightPct: Math.round(primaryWeight * 100)
				},
				...(secondaryTrade
					? [
							{
								trade: secondaryTrade,
								rank: rankSecondary || {
									keywords: [],
									localPackRank: 'none',
									foundInPackCount: 0
								},
								avgSaleValue: avgSaleValueSecond,
								weightPct: Math.round(secondaryWeight * 100)
							}
						]
					: [])
			],
			households,
			siteRetentionRate
		);

		const weightedLayer2Gap = Math.round(weightedLayer2Base.value);

		const reportText = buildLayer2ReportTxt({
			generatedAt: new Date().toISOString(),
			inputs: {
				businessName,
				city,
				trade,
				secondaryTrade: secondaryTrade || null,
				revenueSplit: { primary: primarySplit, secondary: secondarySplit },
				websiteUrl: inputWebsite,
				yearsInBusiness: years,
				annualRevenue,
				avgSaleValue: avgSaleValuePrimary,
				avgSaleValueSecondary: secondaryTrade ? avgSaleValueSecond : null
			},
			households,
			city,
			siteRetentionRate,
			performanceScore,
			layer1GbpGapValue: engineResult.rawGaps.gbp.value,
			weightedRankResult: { ...weightedLayer2Base, value: weightedLayer2Gap },
			finalLayer2Gap: weightedLayer2Gap,
			metrics: {
				monthlySearches,
				monthlySearchesSecondary: secondaryTrade ? monthlySearchesSecondary : null,
				siteRetentionRate: Math.round(siteRetentionRate * 100) + '%',
				callToPurchaseRate: Math.round(callToPurchaseRate * 100) + '%'
			},
			calls: getRevenueReportStore()?.calls ?? []
		});

		return json(
			attachExplainer('revenue-layer2', {
				success: true,
				business: {
					name: businessName,
					city,
					website: finalWebsite,
					years: yearsInBusiness,
					trade,
					secondaryTrade: secondaryTrade || null
				},
				layer1: {
					value: engineResult.rawGaps.gbp.value,
					status: engineResult.healthScores.gbp.status,
					detail: {
						stars: rating,
						count: reviews_count,
						qaCount: qaRes.qa.count
					}
				},
				layer2: {
					...weightedLayer2Base,
					value: weightedLayer2Gap,
					displayValue: formatCurrency(weightedLayer2Gap)
				},
				metrics: {
					monthlySearches,
					monthlySearchesSecondary: secondaryTrade ? monthlySearchesSecondary : null,
					siteRetentionRate: Math.round(siteRetentionRate * 100) + '%',
					callToPurchaseRate: Math.round(callToPurchaseRate * 100) + '%'
				},
				reportText
			})
		);
		});
	} catch (error) {
		console.error('[Layer 2 API] Fatal Error:', error);
		if (error instanceof DataForSEOError) {
			return json(
				attachExplainer('revenue-layer2', { success: false, error: error.message, code: error.code }),
				{ status: 502 }
			);
		}
		return json(attachExplainer('revenue-layer2', { success: false, error: error.message }), {
			status: 500
		});
	}
}
