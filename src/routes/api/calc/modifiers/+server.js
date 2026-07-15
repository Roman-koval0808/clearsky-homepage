import { json } from '@sveltejs/kit';
import { applyModifiers, BENCHMARKS } from '$lib/clearsky/clearsky-engine.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { baseValue, yearsInBusiness, marketTier, city, applyDiscount } = body;

		if (baseValue == null) {
			return json(attachExplainer('modifiers', { success: false, error: 'baseValue is required' }, body), {
				status: 400
			});
		}

		const resolvedTier =
			marketTier || BENCHMARKS.marketDemandLookup[(city || '').toLowerCase().trim()] || 'neutral';
		const years = Number(yearsInBusiness) || 5;

		const adjustedValue = applyModifiers(baseValue, years, resolvedTier);
		const withDiscount = applyDiscount !== false ? Math.round(adjustedValue * 0.85) : adjustedValue;

		const tenureTier =
			BENCHMARKS.brandTenureTiers.find((t) => years >= t.minYears) ||
			BENCHMARKS.brandTenureTiers[BENCHMARKS.brandTenureTiers.length - 1];
		const ecoTier =
			BENCHMARKS.marketDemandTiers[resolvedTier] || BENCHMARKS.marketDemandTiers.neutral;

		return json(
			attachExplainer(
				'modifiers',
				{
					success: true,
					data: {
						baseValue,
						adjustedValue,
						withUltraConservativeDiscount: withDiscount,
						breakdown: {
							tenureRate: tenureTier.rate,
							tenureLabel: tenureTier.label,
							yearsInBusiness: years,
							economicRate: ecoTier.rate,
							economicLabel: ecoTier.label,
							marketTier: resolvedTier,
							discountApplied: applyDiscount !== false ? '15%' : 'none'
						}
					}
				},
				body
			)
		);
	} catch (err) {
		return json(attachExplainer('modifiers', { success: false, error: err.message }, {}), { status: 500 });
	}
}
