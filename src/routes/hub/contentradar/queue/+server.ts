import { json } from '@sveltejs/kit';
import { UnifiedPipelineEngine } from '$lib/server/unified-pipeline';

export async function POST({ request }) {
	try {
		const data = await request.json();

		// This endpoint handles ContentRadar queue items (e.g. from Blog/FAQ forms)
		// Schema: { question_text, source_page, source_form, timestamp, session_id }
		// For the pixel hack we also might receive event, label, bucket

		const textContent =
			data.question_text ||
			(data.label ? `Question submitted: ${data.label}` : 'Question submitted');

		const payload = {
			provider: 'contentradar',
			event_type: 'question_queue',
			external_id: (data.session_id || data.sessionId || 'anon') + '_' + Date.now(),
			text_content: textContent,
			occurred_at: new Date(data.timestamp || Date.now()),
			metadata: data
		};

		console.log(`\n[contentradar-queue] POST /hub/contentradar/queue`);
		console.log(JSON.stringify({
			endpoint: "POST /hub/contentradar/queue",
			timestamp: payload.occurred_at,
			question_text: data.question_text,
			source_page: data.source_page,
			source_form: data.source_form,
			session_id: data.session_id || data.sessionId,
			client_id: "clearsky_client_042" // Mock client ID for logging format
		}, null, 2));

		const result = await UnifiedPipelineEngine.process(payload);

		return json({ success: true, queued: true, result });
	} catch (e: any) {
		return json({ success: false, error: e.message }, { status: 422 });
	}
}
