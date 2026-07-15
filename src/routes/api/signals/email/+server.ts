import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UnifiedPipelineEngine } from '$lib/server/unified-pipeline';

/**
 * GENERIC EMAIL INBOUND WEBHOOK
 * 
 * This endpoint is designed to be called by services like Postmark, SendGrid, or Mailgun
 * when a new email is received for a tracked address.
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		console.log(`[Email Webhook Received] From: ${body.From || body.from || 'unknown'}`);
		
		/**
		 * Extracting data (Generic Mapping)
		 * Most providers send 'From', 'Subject', and 'TextBody'
		 */
		const from = body.From || body.from || 'unknown@example.com';
		const subject = body.Subject || body.subject || 'No Subject';
		const text = body.TextBody || body.text || body.body || '';
		
		const unstructuredText = `From: ${from}\nSubject: ${subject}\n\n${text}`;
		
		// Trigger the Unified Pipeline
		const result = await UnifiedPipelineEngine.process({
			provider: 'email_provider',
			event_type: 'email_received',
			external_id: body.MessageID || body.message_id || `eml_${Date.now()}`,
			customer_phone: null, // Email provider, no phone
			customer_name: body.FromName || body.from_name || null,
			text_content: text,
			metadata: {
				from_email: from,
				subject: subject,
				full_text: unstructuredText
			}
		});

		if (result.is_duplicate || result.is_suppressed) {
			return json({ 
				success: true, 
				status: result.is_duplicate ? 'duplicate_blocked' : 'identity_suppressed',
				event_id: result.event_id 
			});
		}

		return json({ 
			success: true, 
			message: 'Email signal accepted and processed via unified pipeline.',
			event_id: result.event_id 
		});

	} catch (err: any) {
		console.error('[Email Webhook Error]', err);
		return json({ success: false, error: err.message || 'Invalid payload' }, { status: 400 });
	}
};
