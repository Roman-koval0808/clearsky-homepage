import { json } from '@sveltejs/kit';
import { BENCHMARKS, MARKET_CLUSTERS, getCityHouseholds } from '$lib/clearsky/clearsky-engine.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { city } = body;

		if (!city) {
			return json(attachExplainer('city-households', { success: false, error: 'city is required' }, body), {
				status: 400
			});
		}

		const key = city.toLowerCase().trim();
		const cluster = MARKET_CLUSTERS[key];
		const households = getCityHouseholds(city);
		const scalingFactor = households / BENCHMARKS.sudburyHouseholds;
		const withUplift = scalingFactor * BENCHMARKS.captiveMarketUplift;

		return json(
			attachExplainer(
				'city-households',
				{
					success: true,
					data: {
						city,
						households,
						indexCity: 'Sudbury',
						indexHouseholds: BENCHMARKS.sudburyHouseholds,
						scalingFactor: Math.round(scalingFactor * 10000) / 10000,
						captiveMarketUplift: BENCHMARKS.captiveMarketUplift,
						scalingFactorWithUplift: Math.round(withUplift * 10000) / 10000,
						tier: cluster?.tier || 'unknown',
						locationCode: cluster?.locationCode || null,
						knownClusters: Object.entries(MARKET_CLUSTERS).map(([name, c]) => ({
							city: name,
							households: c.households,
							tier: c.tier
						})),
						formula: `scaledVolume = sudburyVolume × (${households} ÷ ${BENCHMARKS.sudburyHouseholds}) × ${BENCHMARKS.captiveMarketUplift}`
					}
				},
				body
			)
		);
	} catch (err) {
		return json(attachExplainer('city-households', { success: false, error: err.message }, {}), {
			status: 500
		});
	}
}
