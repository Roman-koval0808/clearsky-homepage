import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UnifiedPipelineEngine } from '$lib/server/unified-pipeline';

/**
 * TELNYX SMS INBOUND WEBHOOK
 * 
 * Specifically designed to handle Telnyx 'message.received' webhooks.
 * Documentation: https://developers.telnyx.com/docs/api/v2/messaging/Webhooks
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		console.log(`[Telnyx SMS Webhook Received] ID: ${body.data?.id || 'unknown'}`);
		
		// Telnyx webhooks wrap data in a 'data' object
		const payload = body.data?.payload || body;
		
		/**
		 * Extracting data (Telnyx Mapping)
		 */
		const from = payload.from?.phone_number || payload.from || 'Unknown Sender';
		const to = payload.to?.[0]?.phone_number || payload.to || 'Unknown Receiver';
		const text = payload.text || '';
		
		if (!text) {
			return json({ success: true, status: 'ignored_no_text' });
		}

		const unstructuredText = `To: ${to}\nFrom: ${from}\n\n${text}`;
		
		// Trigger the Unified Pipeline
		// This handles: Identity Resolution, De-duplication (Step 4), AI Extraction, and Signal Detection
		const result = await UnifiedPipelineEngine.process({
			provider: 'telnyx_sms',
			event_type: 'sms_received',
			external_id: payload.id || body.data?.id || 'unknown',
			customer_phone: from,
			text_content: text,
			metadata: {
				to_number: to,
				full_text: unstructuredText
			}
		});

		if (result.is_duplicate || result.is_suppressed) {
			console.log(`[Telnyx SMS] Webhook blocked by de-duplication guard.`);
			return json({ 
				success: true, 
				status: result.is_duplicate ? 'duplicate_blocked' : 'identity_suppressed',
				event_id: result.event_id 
			});
		}

		return json({ 
			success: true, 
			message: 'SMS signal accepted and processed via unified pipeline.',
			event_id: result.event_id 
		});

	} catch (err: any) {
		console.error('[Telnyx Webhook Error]', err);
		return json({ success: false, error: err.message || 'Invalid Telnyx payload' }, { status: 400 });
	}
};
