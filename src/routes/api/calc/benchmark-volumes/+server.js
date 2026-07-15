import { json } from '@sveltejs/kit';
import { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } from '$env/static/private';
import { BENCHMARKS, getTradeKey } from '$lib/clearsky/clearsky-engine.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';
import {
	DataForSEOError,
	fetchIndexMarketKeywordVolumes
} from '$lib/clearsky/dataforseo-google-ads.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { trade } = body;

		if (!trade) {
			return json(
				attachExplainer(
					'benchmark-volumes',
					{
						success: false,
						error: 'trade is required (e.g. "plumbing", "hvac")'
					},
					body
				),
				{ status: 400 }
			);
		}

		const tradeKey = getTradeKey(trade);
		const indexPack = await fetchIndexMarketKeywordVolumes(
			DATAFORSEO_LOGIN,
			DATAFORSEO_PASSWORD,
			trade
		);
		const keywords = indexPack.keywords;
		const totalVolume = keywords.reduce((sum, kw) => sum + kw.volume, 0);

		return json(
			attachExplainer(
				'benchmark-volumes',
				{
					success: true,
					data: {
						trade,
						resolvedTradeKey: tradeKey,
						indexCity: 'Sudbury',
						indexHouseholds: BENCHMARKS.sudburyHouseholds,
						indexLocationCode: indexPack.indexLocationCode,
						volumeSource: 'dataforseo',
						keywords,
						totalSudburyVolume: totalVolume,
						note: 'Live Google Ads search volumes at the index market (Sudbury, ON) from DataForSEO.'
					}
				},
				body
			)
		);
	} catch (err) {
		if (err instanceof DataForSEOError) {
			return json(
				attachExplainer('benchmark-volumes', { success: false, error: err.message, code: err.code }, {}),
				{ status: 502 }
			);
		}
		return json(attachExplainer('benchmark-volumes', { success: false, error: err.message }, {}), {
			status: 500
		});
	}
}
