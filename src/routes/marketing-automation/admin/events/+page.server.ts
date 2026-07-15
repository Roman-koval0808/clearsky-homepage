import prisma from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const page = Number(url.searchParams.get('page') || '1');
    const take = 50;
    const skip = (page - 1) * take;

    const totalCount = await prisma.websiteEvent.count();

    const events = await prisma.websiteEvent.findMany({
        orderBy: { occurred_at: 'desc' },
        include: { customer_profile: true },
        take,
        skip
    });

    const analysisEvents = await prisma.websiteEvent.findMany({
        orderBy: { occurred_at: 'desc' },
        take: 300 // Fetch a bit more for better analysis
    });

    const topPagesMap = new Map<string, number>();
    const intentStats = { active: 0, comparison: 0, research: 0, unclassified: 0 };
    const typeStats = { passive: 0, active: 0 };

    analysisEvents.forEach(ev => {
        if (ev.page_url && ev.page_url !== 'N/A') {
            const path = new URL(ev.page_url, 'http://localhost').pathname;
            topPagesMap.set(path, (topPagesMap.get(path) || 0) + 1);
        }

        const intent = (ev.intent_bucket || 'unclassified').toLowerCase();
        if (intentStats[intent as keyof typeof intentStats] !== undefined) {
            intentStats[intent as keyof typeof intentStats]++;
        } else {
            intentStats.unclassified++;
        }

        if (ev.event_type.includes('submit') || ev.event_type.includes('promo_click') || ev.event_type.includes('claim')) {
            typeStats.active++;
        } else {
            typeStats.passive++;
        }
    });

    const topPages = Array.from(topPagesMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, count]) => ({ path, count }));

    return { 
        events,
        pagination: {
            page,
            totalPages: Math.ceil(totalCount / take),
            totalCount
        },
        analysis: {
            topPages,
            intentStats,
            typeStats
        }
    };
};
