import prisma from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { calcScoreLive } from '$lib/server/scoring/decay';
import { evalDemotion }  from '$lib/server/scoring/demotion';

export const load: PageServerLoad = async () => {
    // Fetch identified profiles
    const profiles = await prisma.customerProfile.findMany({
        include: {
            website_events: {
                orderBy: { occurred_at: 'desc' }
            }
        },
        orderBy: { updated_at: 'desc' }
    });

    // Fetch anonymous events to group into sessions
    const anonymousEvents = await prisma.websiteEvent.findMany({
        where: { customer_profile_id: null },
        orderBy: { occurred_at: 'desc' }
    });

    // Fetch fingerprint registry to act as the source of truth for scoring & decay
    const allFingerprints = await prisma.fingerprintProfile.findMany();
    const fpMap = new Map(allFingerprints.map(fp => [fp.fingerprint_id, fp]));

    const anonMap = new Map();
    for (const ev of anonymousEvents) {
        if (!ev.session_id) continue;
        if (!anonMap.has(ev.session_id)) {
            anonMap.set(ev.session_id, {
                id: ev.session_id,
                isAnonymous: true,
                events: [],
                lastSeen: ev.occurred_at,
                score: 0
            });
        }
        const s = anonMap.get(ev.session_id);
        s.events.push(ev);
        if (ev.occurred_at > s.lastSeen) s.lastSeen = ev.occurred_at;
        if (ev.engagement_score > s.score) s.score = ev.engagement_score;
    }

    const formattedProfiles = profiles.map(p => {
        const events = p.website_events;
        const fpId = events.find(e => e.fingerprint_id)?.fingerprint_id;
        const fp = fpId ? fpMap.get(fpId) : null;

        const scoreRaw = fp ? fp.score_raw : events.reduce((max, e) => Math.max(max, e.engagement_score || 0), 0);
        const lastEventAt = fp ? fp.last_event_at : (events.length > 0 ? events[0].occurred_at : p.updated_at);
        const topBucket   = fp ? fp.bucket : (events[0]?.intent_bucket ?? 'research');

        const { scoreLive, decayPct, inGrace } = calcScoreLive(scoreRaw, topBucket, lastEventAt);
        const { demoted, newBucket }           = evalDemotion(scoreRaw, topBucket, lastEventAt);

        return {
            id:          p.id,
            isAnonymous: false,
            name:        `${p.first_name || ''} ${p.last_name || ''}`.trim() || null,
            email:       p.email,
            phone:       p.phone_number,
            events,
            sessionCount: new Set(events.map(e => e.session_id).filter(Boolean)).size,
            lastSeen:    lastEventAt,
            scoreRaw,
            scoreLive,
            decayPct,
            inGrace,
            bucket:      demoted ? newBucket : topBucket,
            wasDemoted:  demoted,
        };
    });

    const allVisitors = [
        ...formattedProfiles,
        ...Array.from(anonMap.values()).map(session => {
            const fpId = session.events.find((e: any) => e.fingerprint_id)?.fingerprint_id;
            const fp = fpId ? fpMap.get(fpId) : null;

            const anonBucket    = fp ? fp.bucket : (session.events[0]?.intent_bucket ?? 'research');
            const anonLastEvent = fp ? fp.last_event_at : session.lastSeen;
            const anonScore     = fp ? fp.score_raw : session.score;

            const { scoreLive: anonLive, decayPct: anonDecay, inGrace: anonGrace }
              = calcScoreLive(anonScore, anonBucket, anonLastEvent);
            const { demoted: anonDemoted, newBucket: anonNewBucket }
              = evalDemotion(anonScore, anonBucket, anonLastEvent);

            return {
              id:          session.id,
              isAnonymous: true,
              name:        null,
              fingerprintId: session.events[0]?.fingerprint_id ?? null,
              events:      session.events,
              sessionCount: 1,
              lastSeen:    anonLastEvent,
              scoreRaw:    session.score,
              scoreLive:   anonLive,
              decayPct:    anonDecay,
              inGrace:     anonGrace,
              bucket:      anonDemoted ? anonNewBucket : anonBucket,
              wasDemoted:  anonDemoted,
            };
        })
    ].sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());

    const stats = {
        totalVisitors: allVisitors.length,
        knownLeads: allVisitors.filter(v => !v.isAnonymous).length,
        anonSessions: allVisitors.filter(v => v.isAnonymous).length,
        avgScore: allVisitors.length > 0 ? Math.round(allVisitors.reduce((sum, v) => sum + v.scoreLive, 0) / allVisitors.length) : 0,
        leadStatus: {
            hot: allVisitors.filter(v => v.scoreLive >= 80).length,
            warm: allVisitors.filter(v => v.scoreLive >= 40 && v.scoreLive < 80).length,
            cold: allVisitors.filter(v => v.scoreLive < 40).length,
        },
        buckets: {
            emergency: allVisitors.filter(v => v.bucket === 'emergency').length,
            active: allVisitors.filter(v => v.bucket === 'active').length,
            comparison: allVisitors.filter(v => v.bucket === 'comparison').length,
            research: allVisitors.filter(v => v.bucket === 'research' || v.bucket === 'unclassified').length,
        }
    };

    return { visitors: allVisitors, stats };
};
