import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding consolidated ClearSky reference data...');

    // 1. Business
    const business = await prisma.business.upsert({
        where: { business_id: 'biz_apex_001' },
        update: {},
        create: {
            business_id: 'biz_apex_001',
            name: 'APEX Contracting',
            market_id: 'market_timmins',
            gbp_location_id: 'gbp_location_1199'
        }
    });

    // 2. Business Configuration
    await prisma.businessConfiguration.upsert({
        where: { business_id: business.id },
        update: {},
        create: {
            business_id: business.id,
            consultant_id: 'cons_sarah_001',
            consultant_name: 'Sarah Jenkins',
            consultant_review_required: true,
            primary_internal_owner: 'consultant',
            approval_route: 'consultant_then_client',
            review_reply_policy: 'draft_only',
            brand_tone: 'professional'
        }
    });

    // 3. Client Orchestrator Profile
    await prisma.clientOrchestratorProfile.upsert({
        where: { business_id: business.id },
        update: {},
        create: {
            business_id: business.id,
            automation_level: 'standard'
        }
    });

    // 4. Action Library
    const actions = [
        // REV Domain
        {
            action_id: 'ACT-REV-001',
            name: 'create_review_reply_draft',
            domain: 'REV',
            is_public_facing: true,
            default_execution_mode: 'approval_required',
            default_owner: 'consultant',
            required_params: ['customer_name', 'rating', 'platform', 'brand_tone', 'review_text']
        },
        {
            action_id: 'ACT-REV-002',
            name: 'post_review_reply',
            domain: 'REV',
            is_public_facing: true,
            default_execution_mode: 'approval_required',
            default_owner: 'consultant',
            required_params: ['customer_name', 'rating', 'platform']
        },
        {
            action_id: 'ACT-REV-004',
            name: 'log_review_complaint_theme',
            domain: 'REV',
            is_public_facing: false,
            default_execution_mode: 'automatic',
            default_owner: 'system',
            required_params: ['ai_summary', 'sentiment', 'complaint_topics']
        },
        // A2P Domain
        {
            action_id: 'ACT-A2P-001',
            name: 'alert_business_owner',
            domain: 'A2P',
            is_public_facing: false,
            default_execution_mode: 'automatic',
            default_owner: 'system',
            required_params: ['customer_name', 'ai_summary', 'urgency_level']
        },
        {
            action_id: 'ACT-A2P-002',
            name: 'create_crm_lead',
            domain: 'A2P',
            is_public_facing: false,
            default_execution_mode: 'automatic',
            default_owner: 'system',
            required_params: ['customer_name', 'phone_number', 'intent']
        },
        {
            action_id: 'ACT-A2P-003',
            name: 'log_a2p_interaction',
            domain: 'A2P',
            is_public_facing: false,
            default_execution_mode: 'automatic',
            default_owner: 'system',
            required_params: ['provider', 'event_type', 'ai_summary']
        },
        {
            action_id: 'ACT-A2P-004',
            name: 'create_emergency_dispatch_alert',
            domain: 'A2P',
            is_public_facing: false,
            default_execution_mode: 'automatic_immediate',
            default_owner: 'system',
            required_params: ['customer_name', 'urgency_level', 'emergency_type']
        },
        {
            action_id: 'ACT-A2P-005',
            name: 'draft_callback_script',
            domain: 'A2P',
            is_public_facing: false,
            default_execution_mode: 'approval_required',
            default_owner: 'consultant',
            required_params: ['customer_name', 'ai_summary']
        },
        {
            action_id: 'ACT-A2P-006',
            name: 'flag_churn_risk_in_profile',
            domain: 'A2P',
            is_public_facing: false,
            default_execution_mode: 'automatic',
            default_owner: 'system',
            required_params: ['business_id', 'risk_score']
        },
        {
            action_id: 'ACT-A2P-007',
            name: 'send_sms_followup',
            domain: 'A2P',
            is_public_facing: false,
            default_execution_mode: 'approval_required',
            default_owner: 'consultant',
            required_params: ['customer_name', 'phone_number']
        }
    ];

    for (const action of actions) {
        await prisma.actionLibrary.upsert({
            where: { action_id: action.action_id },
            update: action,
            create: action
        });
    }

    // 5. Signal Action Mappings
    const mappings = [
        // A2P Domain Mappings
        { signal_rule_id: 'SIG-COMM-000', action_id: 'ACT-A2P-004', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-COMM-000', action_id: 'ACT-A2P-001', is_primary: false, is_secondary: true },
        { signal_rule_id: 'SIG-COMM-000', action_id: 'ACT-A2P-003', is_primary: false, is_secondary: true },
        
        { signal_rule_id: 'SIG-COMM-001', action_id: 'ACT-A2P-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-COMM-001', action_id: 'ACT-A2P-005', is_primary: false, is_secondary: true },
        { signal_rule_id: 'SIG-COMM-001', action_id: 'ACT-A2P-003', is_primary: false, is_secondary: true },

        { signal_rule_id: 'SIG-COMM-002', action_id: 'ACT-A2P-002', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-COMM-002', action_id: 'ACT-A2P-003', is_primary: false, is_secondary: true },

        { signal_rule_id: 'SIG-COMM-003', action_id: 'ACT-A2P-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-COMM-003', action_id: 'ACT-A2P-006', is_primary: false, is_secondary: true },
        { signal_rule_id: 'SIG-COMM-003', action_id: 'ACT-A2P-003', is_primary: false, is_secondary: true },

        { signal_rule_id: 'SIG-COMM-004', action_id: 'ACT-A2P-005', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-COMM-004', action_id: 'ACT-A2P-007', is_primary: false, is_secondary: true },
        { signal_rule_id: 'SIG-COMM-004', action_id: 'ACT-A2P-003', is_primary: false, is_secondary: true },

        { signal_rule_id: 'SIG-COMM-005', action_id: 'ACT-A2P-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-COMM-005', action_id: 'ACT-A2P-003', is_primary: false, is_secondary: true },

        { signal_rule_id: 'SIG-COMM-006', action_id: 'ACT-A2P-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-COMM-006', action_id: 'ACT-A2P-006', is_primary: false, is_secondary: true },
        { signal_rule_id: 'SIG-COMM-006', action_id: 'ACT-A2P-003', is_primary: false, is_secondary: true },

        { signal_rule_id: 'SIG-COMM-007', action_id: 'ACT-A2P-003', is_primary: true, is_secondary: false },

        // REV Domain Mappings
        { signal_rule_id: 'SIG-TRUST-001', action_id: 'ACT-REV-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-001', action_id: 'ACT-REV-004', is_primary: false, is_secondary: true },
        
        { signal_rule_id: 'SIG-TRUST-002', action_id: 'ACT-REV-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-003', action_id: 'ACT-REV-001', is_primary: true, is_secondary: false },
        
        { signal_rule_id: 'SIG-TRUST-004', action_id: 'ACT-REV-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-004', action_id: 'ACT-REV-004', is_primary: false, is_secondary: true },
        
        { signal_rule_id: 'SIG-TRUST-005', action_id: 'ACT-REV-004', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-006', action_id: 'ACT-REV-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-007', action_id: 'ACT-REV-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-008', action_id: 'ACT-REV-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-009', action_id: 'ACT-REV-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-010', action_id: 'ACT-REV-004', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-011', action_id: 'ACT-REV-004', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-012', action_id: 'ACT-REV-004', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-013', action_id: 'ACT-REV-004', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-014', action_id: 'ACT-REV-004', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-015', action_id: 'ACT-REV-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-016', action_id: 'ACT-REV-001', is_primary: true, is_secondary: false },
        
        { signal_rule_id: 'SIG-TRUST-017', action_id: 'ACT-REV-001', is_primary: true, is_secondary: false },
        { signal_rule_id: 'SIG-TRUST-017', action_id: 'ACT-REV-004', is_primary: false, is_secondary: true }
    ];

    // Clear existing mappings to avoid primary key conflicts with updated business_id logic
    await prisma.signalActionMapping.deleteMany({ where: { business_id: null } });

    for (const mapping of mappings) {
        await prisma.signalActionMapping.create({
            data: mapping
        });
    }

    // 6. Safety Rules
    const safetyRules = [
        {
            rule_id: 'SAF-000',
            rule_name: 'Emergency actions bypass all safety blocks',
            conditions: {
                signal_rule_id: { operator: '=', value: 'SIG-COMM-000' }
            },
            block_reason: 'null — never blocked',
            severity: 0
        },
        {
            rule_id: 'SAF-001',
            rule_name: 'Block automatic posting of public replies',
            conditions: {
                action_id: { operator: '=', value: 'ACT-REV-002' },
                execution_mode: { operator: '=', value: 'automatic' }
            },
            block_reason: 'Safety policy prevents automatic public posting',
            severity: 10
        },
        {
            rule_id: 'SAF-002',
            rule_name: 'Block automatic execution of approval-required A2P actions',
            conditions: {
                action_id: { operator: 'in', value: ['ACT-A2P-005', 'ACT-A2P-007'] },
                execution_mode: { operator: '=', value: 'automatic' }
            },
            block_reason: 'Callback scripts and SMS require human review',
            severity: 10
        },
        {
            rule_id: 'SAF-003',
            rule_name: 'Block SMS follow-up if caller not opted in',
            conditions: {
                action_id: { operator: '=', value: 'ACT-A2P-007' },
                sms_opted_in: { operator: '=', value: false }
            },
            block_reason: 'SMS opt-in not confirmed — ACT-A2P-007 suppressed',
            severity: 9
        },
        {
            rule_id: 'SAF-004',
            rule_name: 'Low confidence AI block',
            conditions: {
                ai_confidence_score: { operator: '<', value: 0.75 },
                action_is_public_facing: { operator: '=', value: true }
            },
            block_reason: 'AI confidence too low for public-facing actions',
            severity: 8
        }
    ];

    for (const rule of safetyRules) {
        await prisma.safetyComplianceRule.upsert({
            where: { rule_id: rule.rule_id },
            update: rule,
            create: rule
        });
    }

    // 7. Orchestrator Rules
    const orchestratorRules = [
        {
            rule_id: 'ORC-REV-001',
            rule_name: 'Suppress Response Needed if Risk Detected',
            signal_rule_id: 'SIG-TRUST-001',
            suppress_signals: ['SIG-TRUST-008'],
            scope: 'global'
        },
        {
            rule_id: 'ORC-A2P-001',
            rule_name: 'Emergency signal suppresses all other A2P signals',
            signal_rule_id: 'SIG-COMM-000',
            suppress_signals: ['SIG-COMM-001', 'SIG-COMM-002', 'SIG-COMM-003', 'SIG-COMM-004', 'SIG-COMM-005', 'SIG-COMM-006', 'SIG-COMM-007'],
            scope: 'global'
        },
        {
            rule_id: 'ORC-A2P-002',
            rule_name: 'Churn risk suppresses general inquiry',
            signal_rule_id: 'SIG-COMM-003',
            suppress_signals: ['SIG-COMM-007'],
            scope: 'global'
        }
    ];

    for (const rule of orchestratorRules) {
        await prisma.orchestratorRule.upsert({
            where: { rule_id: rule.rule_id },
            update: rule,
            create: rule
        });
    }

    console.log('✅ Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
