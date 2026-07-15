import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { registerReviewMonitor } from '$lib/server/dataforseo-monitor';

/**
 * ADMIN ENDPOINT: Register Review Monitoring
 * 
 * Securely trigger a DataForSEO registration task.
 * Usually called from an admin panel or during onboarding.
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { location_id, city } = await request.json();
        const origin = new URL(request.url).origin;

        if (!location_id || !city) {
            return json({ success: false, error: 'Missing location_id or city' }, { status: 400 });
        }

        // Note: In production, add authentication check here!
        
        const result = await registerReviewMonitor(location_id, city, origin);

        return json(result);

    } catch (err) {
        return json({ success: false, error: 'Internal error' }, { status: 500 });
    }
};
