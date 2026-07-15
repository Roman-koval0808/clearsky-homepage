import { json } from '@sveltejs/kit';
import { handleTelnyxSmsWebhook } from '$lib/server/sms-handler';

export async function POST({ request }) {
    try {
        const payload = await request.json();
        const result = await handleTelnyxSmsWebhook(payload);
        return json(result);
    } catch (err: any) {
        return json({ success: false, error: err.message }, { status: 500 });
    }
}
