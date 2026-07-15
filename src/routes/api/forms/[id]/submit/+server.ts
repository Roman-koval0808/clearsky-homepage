import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';
import { UnifiedPipelineEngine } from '$lib/server/unified-pipeline';

/**
 * Public endpoint for form submissions.
 */
export const POST: RequestHandler = async ({ params, request }) => {
	const { id: formId } = params;

	try {
		let data: any;
		try {
			data = await request.json();
		} catch (e) {
			return json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
		}
		
		// 1. Verify form exists
		const form = await prisma.form.findUnique({
			where: { id: formId },
			select: { id: true, title: true }
		});
		
		if (!form) return json({ success: false, error: 'Form not found' }, { status: 404 });

		// 2. Prepare event details
		const unstructuredText = Object.entries(data)
			.map(([key, val]) => `${key}: ${val}`)
			.join('\n');

		// Extract potential review fields
		const authorName = data.name || data.firstName || data.fullName || 'Anonymous Website User';
		const ratingNumeric = Number(data.rating) || 5; // Default to 5 if no rating
		const reviewText = data.message || data.review || data.comment || unstructuredText;

		// 3. Process via Unified Pipeline asynchronously
		const provider = 'clearsky_website_forms';
		const eventType = 'form_submission';

		// Run pipeline in the background so the user doesn't wait
		(async () => {
			try {
				const { UnifiedPipelineEngine } = await import('$lib/server/unified-pipeline');
				const result = await UnifiedPipelineEngine.process({
					provider,
					event_type: eventType,
					external_id: `form_sub_${Date.now()}_${Math.random().toString(36).substring(7)}`,
					customer_name: authorName,
					customer_phone: data.phone || data.phoneNumber || data.tel || undefined,
					customer_email: data.email || data.emailAddress || undefined,
					text_content: reviewText,
					metadata: {
						form_id: formId,
						rating: ratingNumeric,
						raw_data: data
					}
				});

				if (result.event_id) {
					const eventRecord = await prisma.event.findUnique({
						where: { event_id: result.event_id as string },
						select: { id: true }
					});

					if (eventRecord) {
						await prisma.formSubmission.create({
							data: {
								id: crypto.randomUUID(),
								form_id: formId,
								data: data as any,
								event_id: eventRecord.id,
								submitted_at: new Date()
							}
						});
					}
				}
			} catch (e) {
				console.error('[Async Form Pipeline Error]', e);
			}
		})();

		return json({ 
			success: true, 
			message: 'Form submitted successfully. Processing in background.'
		});

	} catch (err: any) {
		console.error('[Form Submission Error]', err);
		return json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
	}
};
