import { json } from '@sveltejs/kit';
import { BENCHMARKS } from '$lib/clearsky/clearsky-engine.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { gbp, yearsInBusiness } = body;

		if (!gbp) {
			return json(
				attachExplainer(
					'composite-score',
					{
						success: true,
						data: {
							gbpExists: false,
							compositeScore: 0,
							compositePenalty: BENCHMARKS.gbpNoListingPenalty,
							note: 'No GBP data provided — treated as no listing',
							signals: []
						}
					},
					body
				)
			);
		}

		const b = BENCHMARKS;
		const years = yearsInBusiness || b.yearsInBusinessDefault;

		const signals = [
			{ name: 'Star rating', earned: b.getGbpRatingScore(gbp.rating), max: 35 },
			{ name: 'Review count', earned: b.getGbpReviewScore(gbp.reviewCount, years), max: 25 },
			{ name: 'Photos', earned: b.getGbpPhotoScore(gbp.photos?.length || gbp.photoCount || 0), max: 8 },
			{ name: 'Hours complete', earned: b.getGbpHoursScore(!!gbp.opening_hours || !!gbp.hasHours), max: 5 },
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
			{ name: 'Services listed', earned: b.getGbpServicesScore(gbp.services?.length || gbp.serviceCount || 0), max: 7 }
		];

		const compositeScore = Math.min(100, signals.reduce((sum, s) => sum + s.earned, 0));
		const rawPenalty = (100 - compositeScore) / 100;
		const cappedPenalty = Math.min(rawPenalty, BENCHMARKS.gbpMaxPenaltyCap);

		const signalsWithLoss = signals.map((s) => ({
			...s,
			pointsLost: s.max - s.earned,
			percentage: Math.round((s.earned / s.max) * 100) + '%'
		}));

		const throughput = Math.round((1 - cappedPenalty) * 10000) / 10000;

		return json(
			attachExplainer(
				'composite-score',
				{
					success: true,
					data: {
						gbpExists: true,
						compositeScore,
						maxScore: 100,
						rawPenalty: Math.round(rawPenalty * 10000) / 10000,
						cappedPenalty: Math.round(cappedPenalty * 10000) / 10000,
						throughput,
						maxPenaltyCap: BENCHMARKS.gbpMaxPenaltyCap,
						status: compositeScore >= 80 ? 'green' : compositeScore >= 50 ? 'amber' : 'red',
						signals: signalsWithLoss,
						penaltyFormula: `penalty = min((100 − ${compositeScore}) ÷ 100, ${BENCHMARKS.gbpMaxPenaltyCap}) = ${cappedPenalty}`,
						throughputFormula: `throughput = 1 − ${cappedPenalty} = ${throughput}`,
						note: 'Higher compositeScore = healthier GBP. In the gap formula, multiply by throughput (1 − penalty). E.g. score 80 → penalty 0.20 → throughput 0.80 → 80% of opportunity passes through.'
					}
				},
				body
			)
		);
	} catch (err) {
		return json(attachExplainer('composite-score', { success: false, error: err.message }, {}), {
			status: 500
		});
	}
}
