import { json } from '@sveltejs/kit';
import { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } from '$env/static/private';
import { fetchDataForSEOLayer } from '$lib/clearsky/api-orchestrator.js';
import { DataForSEOError } from '$lib/clearsky/dataforseo-google-ads.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { identifier, city, trade, businessName } = body;

		if (!identifier || !city || !trade) {
			return json(
				attachExplainer(
					'dataforseo-layer',
					{
						success: false,
						error: 'identifier, city, and trade are required'
					},
					body
				),
				{ status: 400 }
			);
		}

		const result = await fetchDataForSEOLayer(
			identifier,
			city,
			trade,
			DATAFORSEO_LOGIN,
			DATAFORSEO_PASSWORD,
			businessName || null
		);

		return json(attachExplainer('dataforseo-layer', { success: true, data: result }, body));
	} catch (err) {
		if (err instanceof DataForSEOError) {
			return json(
				attachExplainer('dataforseo-layer', { success: false, error: err.message, code: err.code }, {}),
				{ status: 502 }
			);
		}
		return json(attachExplainer('dataforseo-layer', { success: false, error: err.message }, {}), {
			status: 500
		});
	}
}
