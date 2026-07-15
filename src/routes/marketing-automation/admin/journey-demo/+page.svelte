<script lang="ts">
    import { onMount } from 'svelte';

    type Tier = 1 | 2 | 3 | 4 | 5;
    type Bucket = 'research' | 'comparison' | 'active' | 'emergency';

    interface JourneyNode {
        id: number;
        phase: string;
        time: string;
        action: string;
        response: string;
        state: {
            score: number;
            bucket: Bucket;
            tier: Tier;
            tierLabel: string;
            identity: string;
        };
        icon: string;
    }

    const JOURNEY: JourneyNode[] = [
        {
            id: 1,
            phase: 'First Touch',
            time: 'Oct 12, 10:45 AM',
            action: 'Visitor arrives via Google Search. Reads blog post: "How to stop freezing pipes". Navigates to About Us.',
            response: 'Pixel generates anonymous ID. Intent Reader classifies as early-stage. Dynamic hero switches to soft-capture (Email newsletter).',
            state: { score: 12, bucket: 'research', tier: 5, tierLabel: 'First Touch (20%)', identity: 'cs_7f3a9b2c1d4e' },
            icon: '🔍'
        },
        {
            id: 2,
            phase: 'Return Visit',
            time: 'Oct 15, 2:10 PM',
            action: 'Returns directly to site. Browses Pricing and Service Areas pages.',
            response: 'Fingerprint match restores prior session score. Score crosses 25. Bucket upgrades to Comparison. Value propositions prioritized in UI.',
            state: { score: 32, bucket: 'comparison', tier: 3, tierLabel: 'Device Recognized (70%)', identity: 'fp_7c4e2a...b901' },
            icon: '📱'
        },
        {
            id: 3,
            phase: 'High Intent',
            time: 'Oct 15, 2:25 PM',
            action: 'Spends 4 minutes using the Bathroom Visualizer tool. Strong commitment signal.',
            response: 'Score hits 57. Bucket upgrades to Active. Orchestrator forces Aggressive Capture: LeadGrabber shrinks to Name & Phone only.',
            state: { score: 57, bucket: 'active', tier: 3, tierLabel: 'Device Recognized (70%)', identity: 'fp_7c4e2a...b901' },
            icon: '⚡'
        },
        {
            id: 4,
            phase: 'Conversion',
            time: 'Oct 15, 2:32 PM',
            action: 'Submits consultation form with name, email, and phone number.',
            response: 'Identity Resolved. Hub creates permanent profile. All prior fingerprint history stitched to "Sarah Jenkins". Cross-channel comms unlocked.',
            state: { score: 85, bucket: 'active', tier: 1, tierLabel: 'Named (100%)', identity: 'Sarah Jenkins (hub_rf_0291)' },
            icon: '🎯'
        },
        {
            id: 5,
            phase: 'Job Complete',
            time: 'Nov 20, 4:00 PM',
            action: 'Bathroom renovation finishes. Rep marks job "Complete" in CRM.',
            response: 'Orchestrator evaluates constraints. Since Sarah is Tier 1, an automated A2P review request is queued and sent via SMS.',
            state: { score: 95, bucket: 'active', tier: 1, tierLabel: 'Named (100%)', identity: 'Sarah Jenkins (hub_rf_0291)' },
            icon: '⭐'
        },
        {
            id: 6,
            phase: 'Repeat Business',
            time: 'Jan 10 (Next Year)',
            action: 'Clicks an organic search result for a new plumbing issue.',
            response: 'Fingerprint or cookie instantly identifies Sarah. Score has decayed to 15, but she remains Tier 1. Website greets her by name. Rep dashboard alerted.',
            state: { score: 15, bucket: 'research', tier: 1, tierLabel: 'Named (100%)', identity: 'Sarah Jenkins (hub_rf_0291)' },
            icon: '🔄'
        }
    ];

    const BUCKET_COLORS = {
        research: { color: '#14532d', bg: '#f0fdf4', label: 'Research' },
        comparison: { color: '#1e3a8a', bg: '#eff6ff', label: 'Comparison' },
        active: { color: '#78350f', bg: '#fffbeb', label: 'Active Project' },
        emergency: { color: '#7f1d1d', bg: '#fef2f2', label: 'Emergency' }
    };

    const TIER_COLORS = {
        1: { color: '#047857', bg: '#d1fae5' }, // Green (Named)
        2: { color: '#0369a1', bg: '#e0f2fe' }, // Blue
        3: { color: '#b45309', bg: '#fef3c7' }, // Amber
        4: { color: '#6d28d9', bg: '#ede9fe' }, // Purple
        5: { color: '#475569', bg: '#f1f5f9' }  // Slate (Anon)
    };

    onMount(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    });

</script>

<div class="demo-container">
    <header class="demo-header reveal">
        <h1>Customer Journey: Sarah Jenkins</h1>
        <p>A narrative timeline demonstrating how ClearSky progressively resolves identity and adapts state.</p>
    </header>

    <div class="timeline-wrapper">
        <div class="timeline-track"></div>

        {#each JOURNEY as node, index (node.id)}
            <div class="timeline-node reveal reveal-delay-{index % 4}">
                <!-- Center dot -->
                <div class="node-marker" style="background: {TIER_COLORS[node.state.tier].bg}; border-color: {TIER_COLORS[node.state.tier].color}">
                    <span class="node-icon">{node.icon}</span>
                </div>

                <!-- Content Card -->
                <div class="node-content {index % 2 === 0 ? 'left' : 'right'}">
                    <div class="node-time">{node.phase} &bull; {node.time}</div>
                    
                    <div class="card">
                        <div class="state-badges">
                            <span class="badge" style="background: {TIER_COLORS[node.state.tier].bg}; color: {TIER_COLORS[node.state.tier].color}">
                                Tier {node.state.tier}: {node.state.tierLabel}
                            </span>
                            <span class="badge" style="background: {BUCKET_COLORS[node.state.bucket].bg}; color: {BUCKET_COLORS[node.state.bucket].color}">
                                {BUCKET_COLORS[node.state.bucket].label}
                            </span>
                            <span class="badge score-badge">
                                Score: {node.state.score}
                            </span>
                        </div>

                        <div class="identity-box">
                            <span class="id-label">Active Identity:</span>
                            <code class="id-value {node.state.tier === 1 ? 'resolved' : ''}">{node.state.identity}</code>
                        </div>

                        <div class="action-block">
                            <h4>Visitor Action</h4>
                            <p>{node.action}</p>
                        </div>

                        <div class="response-block">
                            <h4>System Response</h4>
                            <p>{node.response}</p>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .demo-container {
        padding: 40px;
        max-width: 1000px;
        margin: 0 auto;
        font-family: var(--sans, system-ui, sans-serif);
        color: #111714;
    }

    .demo-header {
        text-align: center;
        margin-bottom: 60px;
    }

    .demo-header h1 {
        font-size: 32px;
        font-weight: 800;
        margin: 0 0 12px;
        color: #0D1F14;
    }

    .demo-header p {
        font-size: 16px;
        color: #4A5E52;
        margin: 0;
    }

    /* Scroll Reveal Animations */
    .reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    
    .reveal.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }

    /* Timeline */
    .timeline-wrapper {
        position: relative;
        padding: 20px 0;
    }

    .timeline-track {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 4px;
        background: #E8E4DC;
        transform: translateX(-50%);
        border-radius: 4px;
    }

    .timeline-node {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 60px;
    }

    .timeline-node:last-child {
        margin-bottom: 0;
    }

    .node-marker {
        position: absolute;
        left: 50%;
        top: 24px;
        transform: translate(-50%, -50%);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 4px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        background: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        transition: transform 0.3s;
    }

    .timeline-node:hover .node-marker {
        transform: translate(-50%, -50%) scale(1.1);
    }

    .node-icon {
        font-size: 20px;
    }

    .node-content {
        width: 45%;
        position: relative;
    }

    .node-content.left {
        margin-right: 55%;
        text-align: right;
    }

    .node-content.right {
        margin-left: 55%;
        text-align: left;
    }

    .node-time {
        font-size: 14px;
        font-weight: 700;
        color: #8A9E92;
        margin-bottom: 12px;
        letter-spacing: 0.02em;
    }

    .card {
        background: white;
        border: 1px solid #E8E4DC;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        text-align: left;
        position: relative;
        transition: box-shadow 0.3s, transform 0.3s;
    }

    .card:hover {
        box-shadow: 0 12px 32px rgba(0,0,0,0.08);
        transform: translateY(-2px);
    }

    /* Connecting arrows */
    .card::before {
        content: '';
        position: absolute;
        top: 24px;
        width: 0;
        height: 0;
        border: 10px solid transparent;
    }

    .node-content.left .card::before {
        right: -20px;
        border-left-color: #E8E4DC;
    }
    
    .node-content.left .card::after {
        content: '';
        position: absolute;
        top: 25px;
        right: -18px;
        width: 0;
        height: 0;
        border: 9px solid transparent;
        border-left-color: white;
    }

    .node-content.right .card::before {
        left: -20px;
        border-right-color: #E8E4DC;
    }

    .node-content.right .card::after {
        content: '';
        position: absolute;
        top: 25px;
        left: -18px;
        width: 0;
        height: 0;
        border: 9px solid transparent;
        border-right-color: white;
    }

    /* Internal Card UI */
    .state-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
    }

    .badge {
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    .score-badge {
        background: #111714;
        color: white;
    }

    .identity-box {
        background: #F8F6F1;
        padding: 10px 14px;
        border-radius: 8px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .id-label {
        font-size: 12px;
        font-weight: 600;
        color: #4A5E52;
    }

    .id-value {
        font-family: monospace;
        font-size: 13px;
        color: #8A9E92;
        background: white;
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid #E8E4DC;
    }

    .id-value.resolved {
        color: #047857;
        font-weight: 700;
        background: #d1fae5;
        border-color: #a7f3d0;
    }

    .action-block, .response-block {
        margin-bottom: 16px;
    }

    .response-block {
        margin-bottom: 0;
        padding-top: 16px;
        border-top: 1px dashed #E8E4DC;
    }

    h4 {
        margin: 0 0 6px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #8A9E92;
    }

    .action-block h4 { color: #1e3a8a; }
    .response-block h4 { color: #1B5E3B; }

    p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: #111714;
    }

    @media (max-width: 768px) {
        .timeline-track { left: 24px; }
        .node-marker { left: 24px; }
        .node-content.left, .node-content.right {
            width: calc(100% - 60px);
            margin-left: 60px;
            margin-right: 0;
            text-align: left;
        }
        .node-content.left .card::before, .node-content.left .card::after { display: none; }
        .node-content.right .card::before { left: -20px; border-right-color: #E8E4DC; }
        .node-content.right .card::after { left: -18px; border-right-color: white; }
    }
</style>
