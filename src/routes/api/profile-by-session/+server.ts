import { json } from '@sveltejs/kit';
import prisma from '$lib/server/db';

export async function GET({ url }) {
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId) {
        return json({ success: false, error: 'sessionId required' }, { status: 400 });
    }

    try {
        // Search for an event linked to this session that also has a resolved customer profile.
        // The session_id is stored in the unstructured_text JSON blob for pixel events.
        // We cast to text and search both variants of the key.
        const eventWithProfile = await prisma.websiteEvent.findFirst({
            where: {
                customer_profile_id: { not: null },
                session_id: sessionId
            },
            include: { customer_profile: true },
            orderBy: { occurred_at: 'desc' }
        });

        if (eventWithProfile?.customer_profile) {
            return json({ success: true, profile: eventWithProfile.customer_profile });
        }

        return json({ success: true, profile: null });
    } catch (e: any) {
        return json({ success: false, error: e.message }, { status: 500 });
    }
}
