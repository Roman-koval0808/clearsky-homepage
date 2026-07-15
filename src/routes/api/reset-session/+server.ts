import { json } from '@sveltejs/kit';
import prisma from '$lib/server/db';

export async function POST({ request }) {
    try {
        const { sessionId } = await request.json();
        if (!sessionId) {
            return json({ success: false, error: 'sessionId required' }, { status: 400 });
        }

        // Unlink all events for this session from any customer profile
        // (does NOT delete the profile — other sessions may still reference it)
        const searchPatterns = [
            `"session_id":"${sessionId}"`,
            `"sessionId":"${sessionId}"`,
        ];

        const result = await prisma.event.updateMany({
            where: {
                OR: searchPatterns.map(p => ({
                    unstructured_text: { contains: p }
                }))
            },
            data: { customer_profile_id: null }
        });

        return json({ success: true, unlinked: result.count });
    } catch (e: any) {
        return json({ success: false, error: e.message }, { status: 500 });
    }
}
