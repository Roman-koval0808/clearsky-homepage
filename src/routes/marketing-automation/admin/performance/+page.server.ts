import prisma from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const events = await prisma.websiteEvent.findMany({
        where: {
            OR: [
                { event_type: { contains: 'promo' } },
                { event_type: { contains: 'submit' } }
            ]
        }
    });

    let shown = 0;
    let clicked = 0;
    let forms = 0;

    for (const ev of events) {
        if (ev.event_type === 'promo_shown') {
            shown++;
        } else if (ev.event_type === 'promo_claim_submit') {
            clicked++;
            forms++; // A promo claim counts as both a click and a form submission
        } else if (ev.event_type.includes('submit')) {
            forms++; // General forms
        }
    }

    // Rough conversion logic for the single rule
    const ignored = Math.max(0, shown - forms);
    const cvrVal = shown > 0 ? (forms / shown * 100) : 0;
    const cvr = Math.min(100, cvrVal).toFixed(1) + '%';

    // Generate time series data for the last 7 days
    const now = new Date();
    const dates = [];
    const impressionsData = [];
    const capturesData = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        const dailyImpressions = events.filter(e => e.event_type === 'promo_shown' && e.occurred_at >= dayStart && e.occurred_at <= dayEnd).length;
        const dailyCaptures = events.filter(e => (e.event_type === 'promo_claim_submit' || e.event_type.includes('submit')) && e.occurred_at >= dayStart && e.occurred_at <= dayEnd).length;
        
        dates.push(dateStr);
        impressionsData.push(dailyImpressions);
        capturesData.push(dailyCaptures);
    }

    return {
        chartData: { dates, impressions: impressionsData, captures: capturesData },
        promos: [
            {
                name: '20% Discount (Service + Pricing)',
                shown,
                clicked,
                forms,
                ignored,
                cvr
            }
        ]
    };
};
