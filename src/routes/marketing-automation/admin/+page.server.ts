import prisma from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const totalProfiles = await prisma.customerProfile.count();
    
    // For anonymous visitors, we count unique session_ids in WebsiteEvent that have no profile
    const anonymousEvents = await prisma.websiteEvent.findMany({
        where: { customer_profile_id: null },
        select: { session_id: true }
    });
    const uniqueAnonSessions = new Set(anonymousEvents.map(e => e.session_id).filter(Boolean));

    // Calculate average score across all profiles and anonymous sessions
    const allEvents = await prisma.websiteEvent.findMany({
        select: { engagement_score: true }
    });
    const avgScore = allEvents.length > 0 
        ? Math.round(allEvents.reduce((acc, curr) => acc + (curr.engagement_score || 0), 0) / allEvents.length)
        : 0;

    // Recent events
    const recentActivity = await prisma.websiteEvent.findMany({
        orderBy: { occurred_at: 'desc' },
        take: 10,
        include: { customer_profile: true }
    });

    // Time-series data for the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentEventsRaw = await prisma.websiteEvent.findMany({
        where: { occurred_at: { gte: sevenDaysAgo } },
        select: { occurred_at: true }
    });

    const dates = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        
        // Count events on this day
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        const count = recentEventsRaw.filter(e => e.occurred_at >= dayStart && e.occurred_at <= dayEnd).length;
        
        dates.push(dateStr);
        counts.push(count);
    }

    return {
        totalVisitors: totalProfiles + uniqueAnonSessions.size,
        knownLeads: totalProfiles,
        anonymousVisitors: uniqueAnonSessions.size,
        averageScore: avgScore,
        recentActivity,
        chartData: { dates, counts }
    };
};
