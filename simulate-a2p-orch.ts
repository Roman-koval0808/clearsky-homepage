import { UnifiedPipelineEngine } from './src/lib/server/unified-pipeline';
import prisma from './src/lib/server/db';

/**
 * PHASE 10 — End-to-End Testing (Simulator)
 * 
 * This script simulates the full A2P -> Orchestrator chain.
 * Scenario: Known customer John Smith (+15550101234) calls, 
 * leaves an urgent voicemail about a roof leak.
 */
async function runA2PSimulation() {
    console.log('🚀 Starting ClearSky A2P & Orchestrator Simulation');

    const testPhoneNumber = '+15550101234';
    const bizExternalId = 'biz_apex_001';

    // 0. Ensure Business and Profile exist
    const biz = await prisma.business.findUnique({ where: { business_id: bizExternalId } });
    if (!biz) {
        console.error('❌ Error: biz_apex_001 not found. Run migrations and seed first.');
        process.exit(1);
    }

    let profile = await prisma.customerProfile.findFirst({
        where: { business_id: biz.id, phone_number: testPhoneNumber }
    });

    if (!profile) {
        console.log('👤 Creating Customer Profile for John Smith...');
        profile = await prisma.customerProfile.create({
            data: {
                business_id: biz.id,
                phone_number: testPhoneNumber,
                display_name: 'John Smith',
                first_name: 'John',
                last_name: 'Smith'
            }
        });
    }

    console.log('\n--- [TASK 1.4/1.5] Simulating call.initiated ---');
    const callId = `sim_call_${Date.now()}`;
    
    // Simulate Task 1.4/1.5
    const callEvent = await prisma.callEvent.create({
        data: {
            call_event_id: `ce_${Date.now()}`,
            call_id: callId,
            caller_id: testPhoneNumber,
            profile_id: profile.id,
            call_outcome: 'initiated'
        }
    });
    console.log('✅ Call Event logged and Profile bound:', profile.display_name);

    console.log('\n--- [PHASE 4/5/6] Simulating Voicemail -> AI Analysis -> Orchestrator ---');
    
    const transcript = "Emergency! My roof is leaking right now after the repair you did. I need someone here ASAP! Water is coming into my kitchen.";

    // We use the UnifiedPipelineEngine to bridge the gap from A2P event to Orchestrator
    const result = await UnifiedPipelineEngine.process({
        provider: 'telnyx_voice',
        event_type: 'voicemail_received',
        external_id: `tel_v_${Date.now()}`,
        business_external_id: bizExternalId,
        customer_phone: testPhoneNumber,
        customer_name: profile.display_name || 'John Smith',
        text_content: transcript,
        metadata: {
            call_event_internal_id: callEvent.id,
            call_id: callId
        }
    });

    if (result.success) {
        console.log('\n✅ PIPELINE SUCCESS');
        console.log('Event ID:', result.event_id);
        
        console.log('\n--- LOG TRACE SUMMARY ---');
        const lines = result.trace.split('\n');
        
        // Filter for high-level signal/decision logic
        lines.filter(l => 
            l.includes('Identity Resolved') || 
            l.includes('SIG-COMM') || 
            l.includes('MATCHED') ||
            l.includes('ACT-A2P') ||
            l.includes('Decision stored') ||
            l.includes('A2P layer')
        ).forEach(l => console.log(l));

        console.log('\n--- [PHASE 10.5] Testing Identity-Based Suppression ---');
        console.log('Simulating a second call from the same number within 5 minutes...');
        
        const resultSuppressed = await UnifiedPipelineEngine.process({
            provider: 'telnyx_voice',
            event_type: 'voicemail_received',
            external_id: `tel_v_dup_${Date.now()}`,
            business_external_id: bizExternalId,
            customer_phone: testPhoneNumber,
            text_content: "Checking in again on the leak!",
        });

        if (resultSuppressed.success && (resultSuppressed as any).is_suppressed) {
            console.log('✅ SUPPRESSION VERIFIED: Duplicate call blocked via Identity Resolution.');
        } else {
            console.log('❌ SUPPRESSION FAILED: Second call was not blocked.');
        }

    } else {
        console.error('❌ PIPELINE FAILED:', result.error);
    }

    process.exit(0);
}

runA2PSimulation().catch(err => {
    console.error(err);
    process.exit(1);
});
