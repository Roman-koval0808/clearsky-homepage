import { json } from '@sveltejs/kit';
import prisma from '$lib/server/db';
import { UnifiedPipelineEngine } from '$lib/server/unified-pipeline';

export async function handleTelnyxVoiceWebhook(body: any, requestUrl: string) {
    const getModel = (name: string) => {
        const lower = name.toLowerCase();
        const plural = lower.endsWith('s') ? lower : lower + 's';
        return (prisma as any)[name] || (prisma as any)[lower] || (prisma as any)[plural];
    };

    console.log(`[Telnyx Voice Webhook Received] Event: ${body.data?.event_type || 'unknown'}`);
    const payload = body.data?.payload || body;
    const eventType = body.data?.event_type || 'call.interaction';
    
    const transcription = payload.transcription?.text || payload.text || null;
    const from = payload.from || 'Unknown Caller';
    const to = payload.to || 'Unknown Receiver';
    const to_label = payload.to_label || 'Unknown Label';
    const callId = payload.call_control_id || 'no-id';
    
    let unstructuredText = `To: ${to} (${to_label})\nVoice Call from: ${from}\nCall ID: ${callId}\nStatus: ${eventType}`;
    
    if (transcription) {
        unstructuredText += `\n\nTranscription:\n${transcription}`;
    }
    
    const id = crypto.randomUUID();
    const provider = 'telnyx_voice';

    const result = await UnifiedPipelineEngine.process({
        provider,
        event_type: transcription ? 'voice_transcription' : eventType,
        external_id: callId,
        customer_phone: from,
        text_content: unstructuredText, // Use full context for the event record
        metadata: {
            to_number: to,
            to_label: to_label,
            call_control_id: callId,
            transcription_only: transcription
        }
    });

    return { 
        success: true, 
        event_id: result.event_id || 'duplicate_skipped',
        is_duplicate: result.is_duplicate || false,
        handoff: 'unified_pipeline'
    };
}
