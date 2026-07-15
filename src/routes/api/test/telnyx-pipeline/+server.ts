import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UnifiedPipelineEngine } from '$lib/server/unified-pipeline';

/**
 * SIMULATE TELNYX VOICE -> PIPELINE -> A2P
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { from, transcript, business_id } = body;

        // Map Telnyx payload to Unified Pipeline
        const result = await UnifiedPipelineEngine.process({
            provider: 'telnyx_voice',
            event_type: 'voicemail_received',
            external_id: `tel_v_${Date.now()}`,
            business_external_id: business_id || 'biz_apex_001',
            customer_phone: from || '+15550109999',
            customer_name: 'John Smith', // In real world, maybe resolved via reverse lookup or CRM
            text_content: transcript || 'Emergency! My roof is leaking after the repair they did last week. Water is coming into my kitchen right now!',
            metadata: {
                call_control_id: `cc_${Math.random().toString(36).substring(7)}`,
                recording_url: 'https://example.com/recording.mp3'
            }
        });

        return json(result);

    } catch (err: any) {
        return json({ success: false, error: err.message }, { status: 500 });
    }
};
