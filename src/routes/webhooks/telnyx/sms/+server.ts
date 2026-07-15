import { json } from '@sveltejs/kit';
import { handleTelnyxSmsWebhook } from '$lib/server/sms-handler';

/**
 * COMPATIBILITY BRIDGE
 * Lead-Grabber-V1 forwards SMS to /webhooks/telnyx/sms
 */
export async function POST({ request }) {
    console.log('--- [SMS BRIDGE] Forwarding to Unified Pipeline ---');
    try {
        const payload = await request.json();
        const result = await handleTelnyxSmsWebhook(payload);
        return json(result);
    } catch (err: any) {
        return json({ success: false, error: err.message }, { status: 500 });
    }
}
