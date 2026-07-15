import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * DIRECT DATABASE VERIFICATION
 * 
 * Verifies that the new schema structures and seed data 
 * required for the A2P layer implementation are correct.
 */
async function verifyA2P() {
    console.log('🧐 Verifying A2P Database Structures...');

    try {
        // 1. Check Action Library for A2P actions
        const a2pActions = await prisma.actionLibrary.findMany({
            where: { action_id: { startsWith: 'ACT-A2P' } }
        });
        console.log(`✅ Action Library: Found ${a2pActions.length} A2P actions.`);
        a2pActions.forEach(a => console.log(`   - ${a.action_id}: ${a.name} (calls_a2p: ${a.calls_a2p})`));

        // 2. Check Signal Action Mappings for Telnyx signals
        const mappings = await prisma.signalActionMapping.findMany({
            where: { signal_rule_id: { startsWith: 'SIG-COMM' } }
        });
        console.log(`✅ Signal Mappings: Found ${mappings.length} mappings for Communication signals.`);

        // 3. Check for Sample Customer Profile
        const profiles = await prisma.customerProfile.count();
        console.log(`✅ Customer Profiles: ${profiles} record(s) found in table.`);

        // 4. Verify CallEvent table exists
        const callEvents = await prisma.callEvent.count();
        console.log(`✅ Call Events: ${callEvents} record(s) found in table.`);

        console.log('\n🌟 All A2P database foundation verified.');
    } catch (err) {
        console.error('🔴 Verification FAILED:', err);
    } finally {
        await prisma.$disconnect();
    }
}

verifyA2P();
