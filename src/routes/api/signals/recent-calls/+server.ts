import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';

export const GET: RequestHandler = async () => {
    try {
        const events = await prisma.event.findMany({
            where: {
                provider: { not: 'clearsky_pixel' }
            },
            orderBy: { created_at: 'desc' },
            take: 20,
            include: {
                enrichments: true,
                signals: true,
                orchestrator_decisions: {
                    include: {
                        action_queue: {
                            include: {
                                executions: true
                            }
                        }
                    }
                },
                outcomes: true
            }
        });

        return json({ success: true, events });
    } catch (err: any) {
        return json({ success: false, error: err.message }, { status: 500 });
    }
};
