import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const biz = await prisma.business.findFirst({
        where: { OR: [{ id: 'biz_apex_001' }, { business_id: 'biz_apex_001' }] }
    });
    console.log('Business found:', JSON.stringify(biz, null, 2));
    
    const anyBiz = await prisma.business.findFirst();
    console.log('First business in DB:', JSON.stringify(anyBiz, null, 2));
}

main().finally(() => prisma.$disconnect());
