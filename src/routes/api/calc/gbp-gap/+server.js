import { json } from '@sveltejs/kit';
import { calcGbpGap, getSiteRetentionRate } from '$lib/clearsky/clearsky-engine.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { gbp, monthlySearches, avgSaleValue, yearsInBusiness, siteRetentionRate, psiScore, vertical } =
			body;

		if (!monthlySearches || !avgSaleValue) {
			return json(
				attachExplainer(
					'gbp-gap',
					{
						success: false,
						error: 'monthlySearches and avgSaleValue are required'
					},
					body
				),
				{ status: 400 }
			);
		}

		const retention =
			siteRetentionRate != null
				? siteRetentionRate
				: getSiteRetentionRate(Number(psiScore) || 100);

		const result = calcGbpGap(
			gbp || null,
			monthlySearches,
			avgSaleValue,
			yearsInBusiness || 5,
			retention,
			vertical || 'trades'
		);

		return json(attachExplainer('gbp-gap', { success: true, data: result }, body));
	} catch (err) {
		return json(attachExplainer('gbp-gap', { success: false, error: err.message }, {}), { status: 500 });
	}
}
