<script lang="ts">
    const mapNodes = [
        { id: 'collection', label: 'Pixel Platform', sub: 'Signal Extraction', href: '/marketing-automation/admin/pixel-demo', status: 'live' },
        { id: 'brain_1', label: 'Intent Buckets', sub: 'State & Decay', href: '/marketing-automation/admin/engine-demo', status: 'live' },
        { id: 'brain_2', label: 'Engagement Score', sub: 'Trajectory', href: '/marketing-automation/admin/engine-demo', status: 'live' },
        { id: 'brain_3', label: 'Orchestrator', sub: 'Decision Engine', href: '/marketing-automation/admin/orchestrator-demo', status: 'core' },
        { id: 'action_1', label: 'ContentRadar', sub: 'Live Conversions', href: '/marketing-automation/admin/contentradar-demo', status: 'live' },
        { id: 'action_2', label: 'Fingerprinting', sub: 'Identity Stitching', href: '/marketing-automation/admin/fingerprinting-demo', status: 'live' },
        { id: 'action_3', label: 'A2P Messaging', sub: 'Compliance', href: '/marketing-automation/admin/a2p-demo', status: 'live' },
        { id: 'action_4', label: 'Customer Journey', sub: 'The Narrative', href: '/marketing-automation/admin/journey-demo', status: 'live' }
    ];

    const pipelineStages = [
        { stage: 1, name: 'Signal Extraction', text: 'Sarah Jenkins visits rightflush.ca/burst-pipe at 10:58 PM, and the system extracts a high-urgency Emergency signal.' },
        { stage: 2, name: 'Rules & Routing', text: 'The Orchestrator recognizes the Emergency intent and routes her immediately to the SLA queue.' },
        { stage: 3, name: 'Identity Resolution', text: 'The Fingerprinting engine stitches her new mobile session to her previous desktop research via capturing her phone number.' },
        { stage: 4, name: 'State Management', text: 'Her profile permanently shifts into the Active bucket, and her Engagement Score jumps to Tier 1.' },
        { stage: 5, name: 'Audience Activation', text: 'ContentRadar fires, alerting the on-call rep with her exact plumbing issue while the dashboard logs the interaction.' },
        { stage: 6, name: 'Cross-Channel Execution', text: 'The A2P Messaging system sends a dual-thread SMS: an acknowledgement to Sarah, and a 15-minute SLA alert to the rep.' },
        { stage: 7, name: 'Measurement', text: 'The Customer Journey node logs the successful conversion, proving ROI on the marketing spend.' }
    ];
</script>

<div class="overview-container">
    <!-- Part 1: Pitch & Value Summary -->
    <header class="pitch-section">
        <h1 class="headline">ClearSky runs your marketing. <br/>You run your business.</h1>
        
        <div class="value-cards">
            <div class="value-card">
                <div class="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <h3>Protected Market</h3>
                <p>One contractor per trade per market. Total exclusivity. We never sell to your competitors.</p>
            </div>
            <div class="value-card">
                <div class="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <h3>Managed Rep</h3>
                <p>Four hours per month. AI generates the strategy and the responses, humans just approve it.</p>
            </div>
            <div class="value-card">
                <div class="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                </div>
                <h3>Guaranteed Growth</h3>
                <p>20% revenue increase in six months or your money back. Data-driven and proven.</p>
            </div>
        </div>
    </header>

    <hr class="divider" />

    <!-- Part 2: Connected Platform Map -->
    <section class="map-section">
        <div class="section-header">
            <h2>The ClearSky Engine Map</h2>
            <p>Click any node to open its interactive demonstration.</p>
        </div>

        <div class="platform-map">
            <!-- Tier 1: Collection -->
            <div class="map-tier tier-collection">
                <div class="tier-label">1. Collection</div>
                <a href="/marketing-automation/admin/pixel-demo" class="map-node node-primary">
                    <span class="node-title">Pixel Platform</span>
                    <span class="node-sub">Signal Extraction</span>
                </a>
            </div>

            <div class="map-arrow down">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
            </div>

            <!-- Tier 2: Brain -->
            <div class="map-tier tier-brain">
                <div class="tier-label">2. The Brain</div>
                <div class="brain-grid">
                    <a href="/marketing-automation/admin/engine-demo" class="map-node node-secondary">
                        <span class="node-title">Intent Buckets</span>
                        <span class="node-sub">State & Decay</span>
                    </a>
                    <a href="/marketing-automation/admin/orchestrator-demo" class="map-node node-core">
                        <span class="node-title">Orchestrator</span>
                        <span class="node-sub">Decision Engine</span>
                    </a>
                    <a href="/marketing-automation/admin/engine-demo" class="map-node node-secondary">
                        <span class="node-title">Engagement Score</span>
                        <span class="node-sub">Trajectory</span>
                    </a>
                </div>
            </div>

            <div class="map-arrow split-down">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" stroke="currentColor" stroke-width="2" fill="none">
                    <path d="M50 0 L50 20 L12 20 L12 50" />
                    <path d="M50 0 L50 20 L37 20 L37 50" />
                    <path d="M50 0 L50 20 L62 20 L62 50" />
                    <path d="M50 0 L50 20 L87 20 L87 50" />
                    <!-- Arrows -->
                    <polygon points="12,50 8,40 16,40" fill="currentColor" />
                    <polygon points="37,50 33,40 41,40" fill="currentColor" />
                    <polygon points="62,50 58,40 66,40" fill="currentColor" />
                    <polygon points="87,50 83,40 91,40" fill="currentColor" />
                </svg>
            </div>

            <!-- Tier 3: Action -->
            <div class="map-tier tier-action">
                <div class="tier-label">3. Action</div>
                <div class="action-grid">
                    <a href="/marketing-automation/admin/contentradar-demo" class="map-node node-tertiary">
                        <span class="node-title">ContentRadar</span>
                        <span class="node-sub">Live Conversions</span>
                    </a>
                    <a href="/marketing-automation/admin/fingerprinting-demo" class="map-node node-tertiary">
                        <span class="node-title">Fingerprinting</span>
                        <span class="node-sub">Identity Stitching</span>
                    </a>
                    <a href="/marketing-automation/admin/a2p-demo" class="map-node node-tertiary">
                        <span class="node-title">A2P Messaging</span>
                        <span class="node-sub">Compliance Locks</span>
                    </a>
                    <a href="/marketing-automation/admin/journey-demo" class="map-node node-tertiary">
                        <span class="node-title">Customer Journey</span>
                        <span class="node-sub">The Narrative</span>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <hr class="divider" />

    <!-- Part 3: The Pipeline Summary -->
    <section class="pipeline-section">
        <div class="section-header">
            <h2>The Pipeline in Practice</h2>
            <p>How the 7-stage orchestrator handles a real RightFlush Plumbing scenario.</p>
        </div>

        <div class="pipeline-list">
            {#each pipelineStages as p}
                <div class="pipeline-row">
                    <div class="stage-number">Stage {p.stage}</div>
                    <div class="stage-content">
                        <h4>{p.name}</h4>
                        <p>{p.text}</p>
                    </div>
                </div>
            {/each}
        </div>
    </section>
</div>

<style>
    .overview-container {
        padding: 60px 40px;
        max-width: 1200px;
        margin: 0 auto;
        font-family: var(--sans, system-ui, sans-serif);
        color: #111714;
    }

    .divider {
        border: 0;
        height: 1px;
        background: #e2e8f0;
        margin: 64px 0;
    }

    /* Part 1: Pitch */
    .pitch-section {
        text-align: center;
    }

    .headline {
        font-size: 48px;
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.03em;
        margin: 0 0 48px 0;
        color: #0D1F14;
    }

    .value-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;
        text-align: left;
    }

    .value-card {
        background: #f8fafc;
        padding: 32px;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .value-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0,0,0,0.05);
    }

    .card-icon {
        width: 48px;
        height: 48px;
        background: #dcfce7;
        color: #166534;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
    }

    .card-icon svg {
        width: 24px;
        height: 24px;
    }

    .value-card h3 {
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 12px 0;
        color: #0f172a;
    }

    .value-card p {
        font-size: 15px;
        line-height: 1.5;
        color: #475569;
        margin: 0;
    }

    /* Part 2: Map */
    .section-header {
        text-align: center;
        margin-bottom: 48px;
    }

    .section-header h2 {
        font-size: 28px;
        font-weight: 800;
        margin: 0 0 8px 0;
        color: #0D1F14;
    }

    .section-header p {
        font-size: 16px;
        color: #64748b;
        margin: 0;
    }

    .platform-map {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #f8fafc;
        padding: 64px 40px;
        border-radius: 24px;
        border: 1px solid #e2e8f0;
    }

    .map-tier {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .tier-label {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #94a3b8;
    }

    .map-arrow {
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #cbd5e1;
    }

    .map-arrow.down svg {
        width: 24px;
        height: 40px;
    }

    .map-arrow.split-down {
        width: 100%;
        max-width: 800px;
        height: 80px;
    }

    .map-arrow.split-down svg {
        width: 100%;
        height: 100%;
    }

    .brain-grid {
        display: flex;
        align-items: center;
        gap: 32px;
    }

    .action-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        width: 100%;
        max-width: 900px;
    }

    .map-node {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px 32px;
        border-radius: 12px;
        text-decoration: none;
        transition: all 0.2s;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .map-node:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.1);
    }

    .node-title {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 4px;
    }

    .node-sub {
        font-size: 12px;
        opacity: 0.8;
    }

    .node-primary {
        background: white;
        border: 2px solid #0f172a;
        color: #0f172a;
        min-width: 240px;
    }

    .node-core {
        background: #0f172a;
        border: 2px solid #0f172a;
        color: white;
        min-width: 240px;
        padding: 24px 32px;
    }

    .node-secondary {
        background: white;
        border: 2px solid #cbd5e1;
        color: #334155;
        min-width: 200px;
    }

    .node-tertiary {
        background: white;
        border: 1px solid #cbd5e1;
        color: #475569;
        padding: 16px 20px;
    }

    /* Part 3: Pipeline */
    .pipeline-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-width: 800px;
        margin: 0 auto;
    }

    .pipeline-row {
        display: flex;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
        transition: transform 0.2s;
    }

    .pipeline-row:hover {
        transform: translateX(4px);
        border-color: #cbd5e1;
    }

    .stage-number {
        background: #f1f5f9;
        padding: 24px;
        font-size: 13px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 120px;
        border-right: 1px solid #e2e8f0;
    }

    .stage-content {
        padding: 24px;
    }

    .stage-content h4 {
        margin: 0 0 8px 0;
        font-size: 16px;
        color: #0f172a;
    }

    .stage-content p {
        margin: 0;
        font-size: 15px;
        color: #475569;
        line-height: 1.5;
    }

    @media (max-width: 1024px) {
        .value-cards {
            grid-template-columns: 1fr;
        }
        .brain-grid, .action-grid {
            flex-direction: column;
            display: flex;
        }
        .map-arrow.split-down {
            display: none; /* Simplification for mobile */
        }
        .tier-label {
            position: static;
            transform: none;
            margin-bottom: 16px;
            text-align: center;
        }
        .map-tier {
            flex-direction: column;
        }
        .pipeline-row {
            flex-direction: column;
        }
        .stage-number {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
            padding: 12px;
        }
    }
</style>
