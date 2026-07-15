import { json } from '@sveltejs/kit';
import { handleTelnyxVoiceWebhook } from '$lib/server/voice-handler';

/**
 * COMPATIBILITY BRIDGE
 * Lead-Grabber-V1 forwards Voice to /webhooks/telnyx/voice
 */
export async function POST({ request }) {
    console.log('--- [VOICE BRIDGE] Forwarding to Unified Pipeline ---');
    try {
        const body = await request.json();
        const result = await handleTelnyxVoiceWebhook(body, request.url);
        return json(result);
    } catch (err: any) {
        return json({ success: false, error: err.message }, { status: 500 });
    }
}
