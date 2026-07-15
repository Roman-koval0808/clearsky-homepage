import { json } from '@sveltejs/kit';
import { GOOGLE_MAPS_API_KEY, DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } from '$env/static/private';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';
import {
	fetchGoogleDetailsFull,
	fetchGoogleDetailsLight
} from '$lib/clearsky/google-helpers.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { businessName, city, websiteUrl, mode } = body;

		if (!businessName || !city) {
			return json(
				attachExplainer(
					'google-identity',
					{
						success: false,
						error: 'businessName and city are required'
					},
					body
				),
				{ status: 400 }
			);
		}

		const useFullMode = mode === 'full';

		const result = useFullMode
			? await fetchGoogleDetailsFull(
					businessName,
					city,
					GOOGLE_MAPS_API_KEY,
					DATAFORSEO_LOGIN,
					DATAFORSEO_PASSWORD,
					websiteUrl
				)
			: await fetchGoogleDetailsLight(businessName, city, GOOGLE_MAPS_API_KEY, websiteUrl);

		if (!result) {
			return json(
				attachExplainer(
					'google-identity',
					{
						success: false,
						error: `No Google Places candidate found for "${businessName}" in "${city}"`
					},
					body
				)
			);
		}

		return json(
			attachExplainer(
				'google-identity',
				{
					success: true,
					mode: useFullMode ? 'full' : 'light',
					data: result
				},
				body
			)
		);
	} catch (err) {
		return json(attachExplainer('google-identity', { success: false, error: err.message }, {}), { status: 500 });
	}
}
