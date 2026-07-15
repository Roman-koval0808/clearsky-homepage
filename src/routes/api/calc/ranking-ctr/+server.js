import { json } from '@sveltejs/kit';
import { BENCHMARKS } from '$lib/clearsky/clearsky-engine.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

const MIN_CTR_GAP_FLOOR = BENCHMARKS.minCtrGapFloor;

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { position } = body;

		if (position == null) {
			return json(
				attachExplainer(
					'ranking-ctr',
					{
						success: false,
						error: 'position is required (1, 2, 3, or "none")'
					},
					body
				),
				{ status: 400 }
			);
		}

		const posKey = String(position);
		const positionOneCTR = BENCHMARKS.positionOneCTR;
		const currentCTR = BENCHMARKS.mapPackCTR[posKey] || BENCHMARKS.mapPackCTR['none'];
		const rawGap = positionOneCTR - currentCTR;
		const ctrGap = Math.max(rawGap, MIN_CTR_GAP_FLOOR);

		return json(
			attachExplainer('ranking-ctr', {
				success: true,
				data: {
					position: posKey,
					positionOneCTR,
					currentCTR,
					rawCtrGap: Math.round(rawGap * 10000) / 10000,
					minGapFloor: MIN_CTR_GAP_FLOOR,
					appliedCtrGap: Math.round(ctrGap * 10000) / 10000,
					floorApplied: rawGap < MIN_CTR_GAP_FLOOR,
					interpretation: `At position ${posKey}: ${Math.round(currentCTR * 100)}% CTR vs ${Math.round(positionOneCTR * 100)}% at #1 → ${Math.round(ctrGap * 100)}% gap used in formula`,
					lookupTable: Object.entries(BENCHMARKS.mapPackCTR).map(([pos, ctr]) => ({
						position: pos,
						ctr,
						rawGap: Math.round((positionOneCTR - ctr) * 100) / 100,
						appliedGap: Math.round(Math.max(positionOneCTR - ctr, MIN_CTR_GAP_FLOOR) * 100) / 100,
						floorApplied: positionOneCTR - ctr < MIN_CTR_GAP_FLOOR
					})),
					note: `If #1 in map pack, CTR gap would be 0 but we apply a floor of ${MIN_CTR_GAP_FLOOR} (${Math.round(MIN_CTR_GAP_FLOOR * 100)}%) — there is always some opportunity lost.`
				}
			}, body)
		);
	} catch (err) {
		return json(attachExplainer('ranking-ctr', { success: false, error: err.message }, {}), { status: 500 });
	}
}
