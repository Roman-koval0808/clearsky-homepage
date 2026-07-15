import prisma from './src/lib/server/db';

async function check() {
    const events = await prisma.event.findMany({
        orderBy: { created_at: 'desc' },
        take: 5,
        select: { id: true, provider: true, event_type: true, created_at: true, customer_profile_id: true }
    });
    console.log("Recent events:", events);

    const profile = await prisma.customerProfile.findFirst({
        where: { phone_number: '+15550101234' }
    });
    console.log("Profile for +15550101234:", profile);

    if (profile) {
        const matching = await prisma.event.findMany({
            where: { customer_profile_id: profile.id }
        });
        console.log("Events for profile:", matching);
    }
}

check().catch(console.error).finally(() => process.exit(0));
