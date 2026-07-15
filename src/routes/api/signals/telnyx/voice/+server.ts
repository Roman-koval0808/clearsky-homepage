import { json } from '@sveltejs/kit';
import { handleTelnyxVoiceWebhook } from '$lib/server/voice-handler';

/**
 * TELNYX VOICE INBOUND WEBHOOK
 */
export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const result = await handleTelnyxVoiceWebhook(body, request.url);
        return json(result);
    } catch (err: any) {
        console.error('[Telnyx Voice Webhook Error]', err);
        return json({ success: false, error: err.message }, { status: 500 });
    }
};
