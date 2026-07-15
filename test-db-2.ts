import prisma from './src/lib/server/db/index.js';

async function test() {
    const profile = await prisma.customerProfile.findFirst({
        where: { display_name: 'Margaret T.' }
    });
    console.log("Profile:", profile);

    if (profile) {
        const identityWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const events = await prisma.event.findMany({
            where: {
                customer_profile_id: profile.id,
                created_at: { gte: identityWindow }
            }
        });
        console.log("Recent Events:", events.length, events.map(e => ({ id: e.id, created: e.created_at })));
    }
}

test().finally(() => process.exit(0));
