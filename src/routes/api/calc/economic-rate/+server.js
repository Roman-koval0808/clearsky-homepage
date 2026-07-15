import { json } from '@sveltejs/kit';
import { BENCHMARKS } from '$lib/clearsky/clearsky-engine.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { city, marketTier } = body;

		if (!city && !marketTier) {
			return json(
				attachExplainer('economic-rate', { success: false, error: 'city or marketTier is required' }, body),
				{ status: 400 }
			);
		}

		const resolvedTier = marketTier ||
			BENCHMARKS.marketDemandLookup[(city || '').toLowerCase().trim()] ||
			'neutral';
		const ecoTier = BENCHMARKS.marketDemandTiers[resolvedTier] || BENCHMARKS.marketDemandTiers.neutral;

		return json(
			attachExplainer(
				'economic-rate',
				{
					success: true,
					data: {
						...(city && { city }),
						marketTier: resolvedTier,
						economicRate: ecoTier.rate,
						economicLabel: ecoTier.label,
						effect:
							ecoTier.rate >= 0
								? `+${Math.round(ecoTier.rate * 100)}% uplift`
								: `${Math.round(ecoTier.rate * 100)}% reduction`,
						lookupTable: Object.entries(BENCHMARKS.marketDemandTiers).map(([tier, val]) => ({
							tier,
							rate: val.rate,
							label: val.label,
							percentage: (val.rate >= 0 ? '+' : '') + Math.round(val.rate * 100) + '%'
						})),
						cityLookup: Object.entries(BENCHMARKS.marketDemandLookup).map(([c, tier]) => ({
							city: c,
							tier,
							rate: BENCHMARKS.marketDemandTiers[tier]?.rate
						})),
						formula: `modifiedValue = baseValue × (1 + ${ecoTier.rate}) for economic portion`
					}
				},
				body
			)
		);
	} catch (err) {
		return json(attachExplainer('economic-rate', { success: false, error: err.message }, {}), {
			status: 500
		});
	}
}
