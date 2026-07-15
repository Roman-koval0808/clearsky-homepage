import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { processGbpReview } from '$lib/server/review-pipeline';

/**
 * GOOGLE BUSINESS PROFILE REVIEW WEBHOOK
 * 
 * Implements the 9-step processing pipeline via shared library.
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const rawPayload = await request.json();
        const origin = new URL(request.url).origin;
        
        const result = await processGbpReview(rawPayload, origin);
        
        return json(result, { status: result.success ? 200 : 500 });
    } catch (err) {
        return json({ 
            success: false, 
            error: 'Internal processing error'
        }, { status: 500 });
    }
};
