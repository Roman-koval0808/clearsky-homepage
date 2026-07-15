import prisma from '../src/lib/server/db.js';

async function checkDb() {
    const business = await prisma.business.findUnique({
        where: { business_id: 'biz_apex_001' }
    });
    console.log('Business:', JSON.stringify(business, null, 2));

    const event = await prisma.event.findUnique({
        where: { provider_event_id: 'gbp_review_88421' }
    });
    console.log('Event:', JSON.stringify(event, null, 2));
    
    process.exit(0);
}

checkDb();
