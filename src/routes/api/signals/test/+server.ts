import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { processGbpReview } from '$lib/server/review-pipeline';
import { UnifiedPipelineEngine } from '$lib/server/unified-pipeline';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { author_name, customer_email, customer_phone, rating, comment, mode } = await request.json();

        // ROUTE 1: Google Business Profile Review
        if (mode === 'review' || !mode) {
            const rawPayload = {
                provider_event_name: 'review.created',
                author_name: author_name || 'Test Reviewer',
                review_id: `test_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                rating: rating || 4,
                starRating: rating || 4,
                name: `locations/123/reviews/${Date.now()}`,
                location_id: 'gbp_location_1199', // Maps to APEX Contracting
                comment: comment || '',
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString(),
                reviewerLanguageCode: 'en'
            };

            const result = await processGbpReview(rawPayload, 'google_business_profile');
            return json({
                success: result.success,
                event_id: result.event_id,
                decision_id: result.decision_id,
                ai_protocol: (result as any).ai_protocol || null,
                logs: result.trace.split('\n').filter((line: string) => line.trim()),
                execution: result.execution,
                outcome: result.outcome,
                feedback: result.feedback,
                decision: (result as any).decision || null,
                evaluation: (result as any).evaluation || null,
                pipeline_status: (result as any).pipeline_status || null
            });
        }

        // ROUTE 2-5: SMS, Voice Call, Email, FAQ (Unified Pipeline)
        let provider = 'telnyx_voice';
        let eventType = 'voicemail_received';
        if (mode === 'sms') { provider = 'telnyx_sms'; eventType = 'sms_received'; }
        else if (mode === 'email') { provider = 'google_workspace_email'; eventType = 'email_received'; }
        else if (mode === 'faq') { provider = 'google_business_profile'; eventType = 'faq_received'; }

        const result = await UnifiedPipelineEngine.process({
            provider,
            event_type: eventType,
            external_id: `test_${mode}_${Date.now()}`,
            business_external_id: 'biz_apex_001',
            customer_phone: customer_phone || ((mode === 'sms' || mode === 'call') ? '+15550009999' : undefined),
            customer_email: customer_email || (mode === 'email' ? 'test@example.com' : undefined),
            customer_name: author_name || (mode === 'email' ? 'Test Sender' : 'Test Caller'),
            text_content: comment || '',
            metadata: {
                is_simulation: true
            }
        });

        // For Unified Pipeline, we need to manually reconstruct some of the trace/feedback fields 
        // because its return object is slightly different than review-pipeline's.
        return json({
            success: result.success,
            event_id: result.event_id,
            decision_id: (result as any).decision_id,
            ai_protocol: (result as any).ai_protocol || null,
            logs: result.trace ? result.trace.split('\n').filter((line: string) => line.trim()) : [],
            execution: (result as any).execution,
            outcome: (result as any).outcome,
            feedback: (result as any).feedback,
            decision: (result as any).decision || null,
            evaluation: (result as any).evaluation || null,
            pipeline_status: (result as any).pipeline_status || null
        });

    } catch (error) {
        console.error('Test API error:', error);
        return json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error',
                logs: []
            },
            { status: 500 }
        );
    }
};
