import { json } from '@sveltejs/kit';
import {
	calcWeightedRankGap,
	getSiteRetentionRate,
	getCityHouseholds
} from '$lib/clearsky/clearsky-engine.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { trades, city, households, siteRetentionRate, psiScore } = body;

		if (!trades || !Array.isArray(trades) || trades.length === 0) {
			return json(
				attachExplainer(
					'weighted-rank-gap',
					{
						success: false,
						error: 'trades array is required with at least one entry'
					},
					body
				),
				{ status: 400 }
			);
		}

		const resolvedHouseholds = households || getCityHouseholds(city || '', 50000);
		const retention =
			siteRetentionRate != null
				? siteRetentionRate
				: getSiteRetentionRate(Number(psiScore) || 100);

		const result = calcWeightedRankGap(trades, resolvedHouseholds, retention);

		return json(
			attachExplainer(
				'weighted-rank-gap',
				{
					success: true,
					data: {
						...result,
						inputs: {
							households: resolvedHouseholds,
							siteRetentionRate: retention,
							tradeCount: trades.length
						}
					}
				},
				body
			)
		);
	} catch (err) {
		return json(
			attachExplainer('weighted-rank-gap', { success: false, error: err.message }, {}),
			{ status: 500 }
		);
	}
}
