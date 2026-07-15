import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SignalEngine } from '$lib/server/signal-engine';
import { z } from 'zod';

const EvaluateSchema = z.object({
    event_id: z.string().uuid()
});

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { event_id } = EvaluateSchema.parse(body);

        const result = await SignalEngine.evaluate(event_id);
        
        return json({
            success: true,
            event_id,
            signal_count: result.signal_count,
            trace: result.trace
        });
    } catch (err: any) {
        console.error('[Signal Evaluate Endpoint] Error:', err);
        return json({ 
            success: false, 
            error: err.message || 'Internal evaluation error'
        }, { status: 500 });
    }
};
