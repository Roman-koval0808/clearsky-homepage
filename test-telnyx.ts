import { UnifiedPipelineEngine } from './src/lib/server/unified-pipeline';
import prisma from './src/lib/server/db';

async function test() {
    console.log('🧪 Starting Telnyx Pipeline Test (Direct Logic Check)');
    
    const phone = '+15550101234';
    const business_id = 'biz_apex_001';

    // 1. Initial Call (Emergency)
    console.log('\n--- SCENARIO 1: First Emergency Call ---');
    const result1 = await UnifiedPipelineEngine.process({
        provider: 'telnyx_voice',
        event_type: 'voicemail_received',
        external_id: `tel_v_test_1_${Date.now()}`,
        business_external_id: business_id,
        customer_phone: phone,
        customer_name: 'John Smith',
        text_content: 'Emergency! This is John Smith. My roof is leaking right now after the repair you did. I need someone here ASAP!',
    });

    console.log('Result 1 Success:', result1.success);
    if (result1.trace) {
        console.log('Trace Summary:');
        result1.trace.split('\n').filter(l => l.includes('Step 3') || l.includes('Step 4') || l.includes('SIG-COMM')).forEach(l => console.log(l));
    }

    // 2. Duplicate Call (Suppression Check)
    console.log('\n--- SCENARIO 2: Duplicate Call within 5 mins ---');
    const result2 = await UnifiedPipelineEngine.process({
        provider: 'telnyx_voice',
        event_type: 'voicemail_received',
        external_id: `tel_v_test_2_${Date.now()}`,
        business_external_id: business_id,
        customer_phone: phone,
        customer_name: 'John Smith',
        text_content: 'I am calling again, roof is still leaking!',
    });

    console.log('Result 2 Success:', result2.success);
    console.log('Is Suppressed:', (result2 as any).is_suppressed);
    if (result2.trace) {
        console.log('Trace Summary:');
        result2.trace.split('\n').filter(l => l.includes('Step 4')).forEach(l => console.log(l));
    }

    process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
