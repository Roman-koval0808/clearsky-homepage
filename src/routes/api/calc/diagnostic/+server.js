import { json } from '@sveltejs/kit';
import { calculateDiagnostic } from '$lib/clearsky/clearsky-engine.js';
import { attachExplainer } from '$lib/clearsky/response-explainer.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { diagnosticData, intakeInputs } = body;

		if (!diagnosticData) {
			return json(
				attachExplainer('diagnostic', { success: false, error: 'diagnosticData object is required' }, body),
				{ status: 400 }
			);
		}

		const result = calculateDiagnostic(diagnosticData, intakeInputs || {});

		return json(attachExplainer('diagnostic', { success: true, data: result }, body));
	} catch (err) {
		return json(attachExplainer('diagnostic', { success: false, error: err.message }, {}), { status: 500 });
	}
}
