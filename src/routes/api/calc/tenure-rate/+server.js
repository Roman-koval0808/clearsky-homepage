import { json } from '@sveltejs/kit';
import { BENCHMARKS } from '$lib/clearsky/clearsky-engine.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { yearsInBusiness } = body;

		if (yearsInBusiness == null) {
			return json(
				attachExplainer('tenure-rate', { success: false, error: 'yearsInBusiness is required' }, body),
				{ status: 400 }
			);
		}

		const years = Number(yearsInBusiness);
		const tiers = BENCHMARKS.brandTenureTiers;
		const tier = tiers.find((t) => years >= t.minYears) || tiers[tiers.length - 1];

		return json(
			attachExplainer(
				'tenure-rate',
				{
					success: true,
					data: {
						yearsInBusiness: years,
						tenureRate: tier.rate,
						tenureLabel: tier.label,
						effect:
							tier.rate >= 0
								? `+${Math.round(tier.rate * 100)}% uplift (brand trust bonus)`
								: `${Math.round(tier.rate * 100)}% reduction (new/building brand penalty)`,
						lookupTable: tiers.map((t) => ({
							minYears: t.minYears,
							rate: t.rate,
							label: t.label,
							percentage: (t.rate >= 0 ? '+' : '') + Math.round(t.rate * 100) + '%'
						})),
						formula: `modifiedValue = baseValue × (1 + ${tier.rate}) for tenure portion`
					}
				},
				body
			)
		);
	} catch (err) {
		return json(attachExplainer('tenure-rate', { success: false, error: err.message }, {}), { status: 500 });
	}
}
