import prisma from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const id = params.id;
    let isAnonymous = false;
    let profile = null;
    let events = [];

    // Check if ID is a session ID (anonymous)
    if (id.startsWith('sess_') || id.includes('-')) {
        // Might be a UUID session or sess_...
        // Let's see if it's a profile ID first
        profile = await prisma.customerProfile.findUnique({
            where: { id }
        });

        if (!profile) {
            // It's a session ID
            isAnonymous = true;
            events = await prisma.websiteEvent.findMany({
                where: { session_id: id },
                orderBy: { occurred_at: 'asc' }
            });

            if (events.length === 0) {
                throw error(404, 'Visitor not found');
            }
        }
    } else {
        profile = await prisma.customerProfile.findUnique({
            where: { id }
        });
    }

    if (profile && !isAnonymous) {
        events = await prisma.websiteEvent.findMany({
            where: { customer_profile_id: profile.id },
            orderBy: { occurred_at: 'asc' }
        });
    }

    // AI/Logic Simulation (The "Analyzing" part)
    const viewedService = events.some(e => e.page_url?.includes('hot-water') || e.page_url?.includes('leak-detection') || e.page_url?.includes('bathroom-renovations'));
    const viewedPricing = events.some(e => e.page_url?.includes('pricing'));
    const promoFired = events.some(e => e.event_type.includes('promo_shown'));
    const promoClicked = events.some(e => e.event_type.includes('promo_click') || e.event_type.includes('claim'));
    const formSubmitted = events.some(e => e.event_type.includes('submit'));
    const sessions = new Set(events.map(e => e.session_id).filter(Boolean));
    const returnedVisitor = sessions.size > 1;
    const currentScore = events.reduce((max, e) => Math.max(max, e.engagement_score || 0), 0);
    const lastSeen = events.length > 0 ? events[events.length - 1].occurred_at : (profile?.updated_at || new Date());

    return {
        id,
        isAnonymous,
        profile,
        events,
        analysis: {
            viewedService,
            viewedPricing,
            promoFired,
            promoClicked,
            formSubmitted,
            returnedVisitor,
            currentScore,
            lastSeen,
            sessionCount: sessions.size
        }
    };
};
