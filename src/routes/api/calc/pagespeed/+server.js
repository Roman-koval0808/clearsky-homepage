import { json } from '@sveltejs/kit';
import { GOOGLE_PAGESPEED_API_KEY } from '$env/static/private';
import { fetchPageSpeedLayer } from '$lib/clearsky/api-orchestrator.js';
import { getSiteRetentionRate } from '$lib/clearsky/clearsky-engine.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { url } = body;

		if (!url) {
			return json(attachExplainer('pagespeed', { success: false, error: 'url is required' }, body), {
				status: 400
			});
		}

		const result = await fetchPageSpeedLayer(url, GOOGLE_PAGESPEED_API_KEY);
		const performanceScore = result.data?.performance || 0;
		const siteRetentionRate = getSiteRetentionRate(performanceScore);

		return json(
			attachExplainer(
				'pagespeed',
				{
					success: true,
					data: {
						...result.data,
						siteRetentionRate,
						siteRetentionRatePct: Math.round(siteRetentionRate * 100) + '%'
					},
					error: result.error
				},
				body
			)
		);
	} catch (err) {
		return json(attachExplainer('pagespeed', { success: false, error: err.message }, {}), { status: 500 });
	}
}
