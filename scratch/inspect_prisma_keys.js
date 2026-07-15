import prisma from './src/lib/server/db/index.js';

async function main() {
    console.log('Prisma keys:', Object.keys(prisma).filter(k => !k.startsWith('_')));
}

main().catch(console.error);
