import { json } from '@sveltejs/kit';
import { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } from '$env/static/private';
import { fetchSearchVolume } from '$lib/clearsky/google-helpers.js';
import { DataForSEOError } from '$lib/clearsky/dataforseo-google-ads.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { trade, city } = body;

		if (!trade || !city) {
			return json(
				attachExplainer('search-volume', { success: false, error: 'trade and city are required' }, body),
				{
					status: 400
				}
			);
		}

		const liveVolume = await fetchSearchVolume(trade, city, DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD);

		return json(
			attachExplainer(
				'search-volume',
				{
					success: true,
					data: {
						liveVolume,
						source: 'dataforseo',
						keyword: `${trade} ${city}`
					}
				},
				body
			)
		);
	} catch (err) {
		if (err instanceof DataForSEOError) {
			return json(
				attachExplainer('search-volume', { success: false, error: err.message, code: err.code }, {}),
				{ status: 502 }
			);
		}
		return json(attachExplainer('search-volume', { success: false, error: err.message }, {}), { status: 500 });
	}
}
