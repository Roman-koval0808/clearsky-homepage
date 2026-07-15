import { json } from '@sveltejs/kit';
import { getSiteRetentionRate } from '$lib/clearsky/clearsky-engine.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

const RETENTION_TABLE = [
	{ range: '90 – 100', retentionRate: 1.0, abandonment: '0%', status: 'Green' },
	{ range: '70 – 89', retentionRate: 0.9, abandonment: '10%', status: 'Amber' },
	{ range: '50 – 69', retentionRate: 0.85, abandonment: '15%', status: 'Amber' },
	{ range: '0 – 49', retentionRate: 0.8, abandonment: '20%', status: 'Red' }
];

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { psiScore, mobile, desktop } = body;

		let score = psiScore;
		if (score == null && mobile != null && desktop != null) {
			score = Math.round((Number(mobile) + Number(desktop)) / 2);
		}

		if (score == null) {
			return json(
				attachExplainer(
					'site-retention',
					{
						success: false,
						error: 'psiScore (or mobile + desktop) is required'
					},
					body
				),
				{ status: 400 }
			);
		}

		const retentionRate = getSiteRetentionRate(score);
		const abandonment = Math.round((1 - retentionRate) * 100) + '%';
		const status = score >= 90 ? 'Green' : score >= 70 ? 'Amber' : score >= 50 ? 'Amber' : 'Red';

		return json(
			attachExplainer(
				'site-retention',
				{
					success: true,
					data: {
						psiScore: score,
						...(mobile != null && { mobile: Number(mobile) }),
						...(desktop != null && { desktop: Number(desktop) }),
						...(mobile != null &&
							desktop != null && {
								averageFormula: `(${mobile} + ${desktop}) / 2 = ${score}`
							}),
						retentionRate,
						abandonment,
						status,
						lookupTable: RETENTION_TABLE,
						note: 'PSI Performance score averaged across mobile + desktop determines the retention rate'
					}
				},
				body
			)
		);
	} catch (err) {
		return json(attachExplainer('site-retention', { success: false, error: err.message }, {}), {
			status: 500
		});
	}
}
