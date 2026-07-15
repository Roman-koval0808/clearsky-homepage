import { json } from '@sveltejs/kit';
import { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } from '$env/static/private';
import { fetchDataForSEORankLayer } from '$lib/clearsky/api-orchestrator.js';
import { DataForSEOError } from '$lib/clearsky/dataforseo-google-ads.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { businessName, trade, city } = body;

		if (!businessName || !trade || !city) {
			return json(
				attachExplainer(
					'rank-lookup',
					{
						success: false,
						error: 'businessName, trade, and city are required'
					},
					body
				),
				{ status: 400 }
			);
		}

		const result = await fetchDataForSEORankLayer(
			businessName,
			trade,
			city,
			DATAFORSEO_LOGIN,
			DATAFORSEO_PASSWORD
		);

		return json(
			attachExplainer('rank-lookup', { success: true, data: result.data, error: result.error }, body)
		);
	} catch (err) {
		if (err instanceof DataForSEOError) {
			return json(
				attachExplainer('rank-lookup', { success: false, error: err.message, code: err.code }, {}),
				{ status: 502 }
			);
		}
		return json(attachExplainer('rank-lookup', { success: false, error: err.message }, {}), { status: 500 });
	}
}
