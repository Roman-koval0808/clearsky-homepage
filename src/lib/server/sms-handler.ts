import { json } from '@sveltejs/kit';
import prisma from '$lib/server/db';
import { UnifiedPipelineEngine } from '$lib/server/unified-pipeline';

export async function handleTelnyxSmsWebhook(payload: any) {
    // Log the event type for visibility
    const eventType = payload.data?.event_type || 'unknown';
    console.log(`[Telnyx SMS Webhook Received] Event: ${eventType}`);

    // Store raw log for auditing
    await prisma.rawWebhookLog.create({
        data: {
            provider: 'telnyx_sms',
            event_type: eventType,
            external_id: payload.data?.payload?.id || 'unknown',
            raw_payload: payload
        }
    });

    // We only care about received messages for the signal engine
    if (eventType === 'message.received') {
        const msg = payload.data.payload;
        const fromNumber = msg.from?.phone_number;
        const toNumber = msg.to?.[0]?.phone_number;
        const text = msg.text;

        if (!text) {
            console.log('--- [SMS WEBHOOK] SKIPPED: No text content ---');
            return { success: true, message: 'no_content' };
        }

        // Trigger the Unified Pipeline
        const result = await UnifiedPipelineEngine.process({
            provider: 'telnyx_sms',
            event_type: 'sms_received',
            external_id: msg.id,
            business_external_id: 'biz_apex_001', 
            customer_phone: fromNumber,
            text_content: text,
            metadata: {
                to_number: toNumber,
                direction: 'inbound'
            }
        });

        return { 
            success: true, 
            event_id: result.event_id,
            ai_protocol: result.ai_protocol || null,
            handoff: 'unified_pipeline'
        };
    }

    return { success: true, status: 'ignored' };
}
