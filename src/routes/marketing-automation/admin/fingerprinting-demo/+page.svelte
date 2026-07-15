<script lang="ts">
    import { fade, fly, slide, crossfade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    const [send, receive] = crossfade({
        duration: 800,
        easing: quintOut,
        fallback(node, params) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            return {
                duration: 800,
                easing: quintOut,
                css: t => `
                    transform: ${transform} scale(${t});
                    opacity: ${t}
                `
            };
        }
    });

    const TIERS = [
        { id: 1, name: 'Tier 1: Named', conf: '100%', desc: 'Fully identified user profile in Hub.', unlocks: 'Cross-channel A2P, Named Website Greetings, Full Context.', color: '#047857', bg: '#d1fae5' },
        { id: 2, name: 'Tier 2: Confirmed', conf: '90%', desc: 'Email/Phone known, but not explicitly named.', unlocks: 'Same-channel Retargeting. Partial Identity Resolution.', color: '#0369a1', bg: '#e0f2fe' },
        { id: 3, name: 'Tier 3: Device Recognised', conf: '70%', desc: 'Multiple sessions stitched via stable browser fingerprint.', unlocks: 'Persistent Scoring & Intent Buckets across cleared cookies.', color: '#b45309', bg: '#fef3c7' },
        { id: 4, name: 'Tier 4: Cookie Only', conf: '50%', desc: 'Standard returning visitor via first-party cookie.', unlocks: 'Short-term Scoring. Vulnerable to cookie clearing.', color: '#6d28d9', bg: '#ede9fe' },
        { id: 5, name: 'Tier 5: First Touch', conf: '20%', desc: 'Completely anonymous new device/browser.', unlocks: 'Basic Analytics. Initial Event Logging.', color: '#475569', bg: '#f1f5f9' }
    ];

    let activeTier = $state(5);
    
    // Stitching State
    let isMatched = $state(false); // A + B merged
    let isConverted = $state(false); // C converts -> All merged into Hub Profile

    function matchFingerprint() {
        isMatched = true;
    }

    function convertProfile() {
        isConverted = true;
    }

    function resetDemo() {
        isMatched = false;
        isConverted = false;
    }
</script>

<div class="demo-container">
    <header class="demo-header">
        <h1>Identity Resolution & Fingerprinting</h1>
        <p>Stitching cross-device anonymous sessions into unified profiles using browser fingerprinting.</p>
    </header>

    <div class="demo-layout">
        <!-- Part 1: Identity Ladder -->
        <div class="ladder-panel">
            <h3>Identity Confidence Ladder</h3>
            <p class="panel-desc">Click a tier to view system capabilities.</p>
            
            <div class="ladder">
                {#each TIERS as tier (tier.id)}
                    <button 
                        class="tier-step {activeTier === tier.id ? 'active' : ''}"
                        style="--tier-color: {tier.color}; --tier-bg: {tier.bg};"
                        onclick={() => activeTier = tier.id}
                    >
                        <div class="tier-conf">{tier.conf}</div>
                        <div class="tier-info">
                            <strong>{tier.name}</strong>
                            {#if activeTier === tier.id}
                                <div class="tier-details" in:slide={{ duration: 200 }}>
                                    <p class="desc">{tier.desc}</p>
                                    <p class="unlocks"><strong>Unlocks:</strong> {tier.unlocks}</p>
                                </div>
                            {/if}
                        </div>
                    </button>
                {/each}
            </div>
        </div>

        <!-- Part 2 & 3: Interactive Demo -->
        <div class="stitching-panel">
            <div class="panel-header-row">
                <div>
                    <h3>Cross-Session Stitching</h3>
                    <p class="panel-desc">Watch isolated sessions merge into a single identity.</p>
                </div>
                {#if isConverted || isMatched}
                    <button class="btn-reset" onclick={resetDemo}>Reset Demo</button>
                {/if}
            </div>

            {#if !isConverted}
                <!-- Part 2: Three separate sessions -->
                <div class="sessions-grid" out:fade={{ duration: 300 }}>
                    <!-- Session A -->
                    <div class="session-card" in:receive={{ key: 'session-a' }} out:send={{ key: 'session-a' }}>
                        <div class="card-header">
                            <span class="badge {isMatched ? 'badge-t3' : 'badge-t5'}">{isMatched ? 'Tier 3' : 'Tier 5'}</span>
                            <strong>Session A (Mobile)</strong>
                        </div>
                        <div class="card-body">
                            <div class="data-row"><span>Cookie:</span> <code>rf_881a</code></div>
                            <div class="data-row"><span>Fingerprint:</span> <code>fp_7c4e2a</code></div>
                            <div class="data-row"><span>History:</span></div>
                            <ul class="event-list">
                                <li>Oct 12 - Viewed Pricing</li>
                                {#if isMatched}
                                    <li class="merged-event" in:slide>Oct 18 - Viewed FAQs (Merged)</li>
                                {/if}
                            </ul>
                        </div>
                    </div>

                    <!-- Session B -->
                    <div class="session-wrapper">
                        {#if !isMatched}
                            <div class="session-card" out:fly={{ y: 50, opacity: 0, duration: 400 }}>
                                <div class="card-header">
                                    <span class="badge badge-t5">Tier 5</span>
                                    <strong>Session B (Desktop)</strong>
                                </div>
                                <div class="card-body">
                                    <div class="data-row"><span>Cookie:</span> <span class="cleared">Cleared (New)</span></div>
                                    <div class="data-row"><span>Fingerprint:</span> <code>fp_7c4e2a</code></div>
                                    <div class="data-row"><span>History:</span></div>
                                    <ul class="event-list">
                                        <li>Oct 18 - Viewed FAQs</li>
                                    </ul>
                                </div>
                                <div class="card-footer">
                                    <button class="btn-action" onclick={matchFingerprint}>🔗 Match Fingerprint</button>
                                </div>
                            </div>
                        {:else}
                            <div class="empty-slot" in:fade={{ delay: 400 }}>
                                <span>Session B merged into Session A</span>
                            </div>
                        {/if}
                    </div>

                    <!-- Session C -->
                    <div class="session-card" in:receive={{ key: 'session-c' }} out:send={{ key: 'session-c' }}>
                        <div class="card-header">
                            <span class="badge badge-t2">Tier 2</span>
                            <strong>Session C (Mobile)</strong>
                        </div>
                        <div class="card-body">
                            <div class="data-row"><span>Cookie:</span> <code>rf_881a</code></div>
                            <div class="data-row"><span>Fingerprint:</span> <code>fp_7c4e2a</code></div>
                            <div class="data-row"><span>Phone captured:</span> <code>(555) 019-2831</code></div>
                            <div class="data-row"><span>Action:</span></div>
                            <ul class="event-list">
                                <li class="highlight-event">Oct 25 - Submitted Form</li>
                            </ul>
                        </div>
                        <div class="card-footer">
                            <button class="btn-convert" onclick={convertProfile} disabled={!isMatched}>✨ Convert to Profile</button>
                            {#if !isMatched}
                                <span class="hint">Match B to A first</span>
                            {/if}
                        </div>
                    </div>
                </div>
            {:else}
                <!-- Part 3: Unified Profile (Stitching Reveal) -->
                <div class="unified-container" in:fade={{ delay: 300, duration: 500 }}>
                    <div class="unified-profile" in:receive={{ key: 'session-a' }}>
                        <div class="profile-header">
                            <div class="avatar">SJ</div>
                            <div class="profile-title">
                                <h2>Sarah Jenkins</h2>
                                <span class="badge badge-t1">Tier 1: Named (100%)</span>
                            </div>
                        </div>
                        
                        <div class="profile-body">
                            <div class="data-grid">
                                <div class="data-item">
                                    <span class="data-label">Hub ID</span>
                                    <div><code>hub_rf_0291</code></div>
                                </div>
                                <div class="data-item">
                                    <span class="data-label">Phone</span>
                                    <div>(555) 019-2831</div>
                                </div>
                                <div class="data-item">
                                    <span class="data-label">Primary Fingerprint</span>
                                    <div><code>fp_7c4e2a</code></div>
                                </div>
                            </div>

                            <div class="timeline-section">
                                <h4>Unified Chronological Timeline</h4>
                                <ul class="unified-timeline">
                                    <li>
                                        <span class="time">Oct 12</span>
                                        <span class="device">Mobile</span>
                                        <span class="action">Viewed Pricing (Session A)</span>
                                    </li>
                                    <li>
                                        <span class="time">Oct 18</span>
                                        <span class="device">Desktop</span>
                                        <span class="action">Viewed FAQs (Session B stitched)</span>
                                    </li>
                                    <li>
                                        <span class="time">Oct 25</span>
                                        <span class="device">Mobile</span>
                                        <span class="action">Submitted Contact Form (Session C converted)</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .demo-container {
        padding: 40px;
        max-width: 1300px;
        margin: 0 auto;
        font-family: var(--sans, system-ui, sans-serif);
        color: #111714;
    }

    .demo-header {
        margin-bottom: 40px;
    }

    .demo-header h1 {
        font-size: 32px;
        font-weight: 800;
        margin: 0 0 8px;
        color: #0D1F14;
    }

    .demo-header p {
        font-size: 16px;
        color: #4A5E52;
        margin: 0;
    }

    h3 {
        margin: 0 0 4px;
        font-size: 20px;
        color: #0D1F14;
    }

    .panel-desc {
        margin: 0 0 24px 0;
        color: #64748b;
        font-size: 14px;
    }

    .demo-layout {
        display: grid;
        grid-template-columns: 350px 1fr;
        gap: 40px;
    }

    /* Ladder */
    .ladder {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .tier-step {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        background: white;
        border: 2px solid transparent;
        padding: 16px;
        border-radius: 12px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }

    .tier-step:hover {
        transform: translateX(4px);
        border-color: #e2e8f0;
    }

    .tier-step.active {
        border-color: var(--tier-color);
        background: #f8fafc;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .tier-conf {
        background: var(--tier-bg);
        color: var(--tier-color);
        font-weight: 800;
        font-size: 14px;
        padding: 8px;
        border-radius: 8px;
        width: 48px;
        text-align: center;
        flex-shrink: 0;
    }

    .tier-info {
        flex: 1;
    }

    .tier-info strong {
        display: block;
        font-size: 15px;
        color: #0f172a;
    }

    .tier-details {
        margin-top: 8px;
        font-size: 13px;
        line-height: 1.4;
    }

    .tier-details .desc {
        margin: 0 0 8px 0;
        color: #475569;
    }

    .tier-details .unlocks {
        margin: 0;
        color: var(--tier-color);
        background: var(--tier-bg);
        padding: 8px;
        border-radius: 6px;
    }

    /* Stitching Panel */
    .stitching-panel {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 32px;
        min-height: 500px;
    }

    .panel-header-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    .btn-reset {
        background: white;
        border: 1px solid #cbd5e1;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-reset:hover {
        background: #f1f5f9;
    }

    .sessions-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 24px;
    }

    .session-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        height: 100%;
    }

    .card-header {
        background: #f1f5f9;
        padding: 16px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .badge {
        font-size: 11px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 4px;
        width: fit-content;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .badge-t5 { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .badge-t3 { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-t2 { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .badge-t1 { background: #d1fae5; color: #047857; border: 1px solid #a7f3d0; }

    .card-body {
        padding: 16px;
        flex: 1;
    }

    .data-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        margin-bottom: 12px;
        border-bottom: 1px dashed #e2e8f0;
        padding-bottom: 8px;
    }

    .data-row span:first-child {
        color: #64748b;
        font-weight: 500;
    }

    code {
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        color: #0f172a;
    }

    .cleared {
        color: #ef4444;
        font-style: italic;
    }

    .event-list {
        margin: 0;
        padding-left: 20px;
        font-size: 13px;
        color: #475569;
    }

    .event-list li {
        margin-bottom: 8px;
    }

    .merged-event {
        color: #b45309;
        font-weight: 600;
    }

    .highlight-event {
        color: #047857;
        font-weight: 600;
    }

    .card-footer {
        padding: 16px;
        border-top: 1px solid #e2e8f0;
        background: #fafafa;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .btn-action, .btn-convert {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-action {
        background: #1e293b;
        color: white;
    }
    .btn-action:hover { background: #0f172a; transform: translateY(-1px); }

    .btn-convert {
        background: #10b981;
        color: white;
    }
    .btn-convert:hover:not(:disabled) { background: #059669; transform: translateY(-1px); }
    .btn-convert:disabled { background: #94a3b8; cursor: not-allowed; }

    .hint {
        font-size: 11px;
        text-align: center;
        color: #64748b;
    }

    .empty-slot {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px dashed #cbd5e1;
        border-radius: 12px;
        color: #94a3b8;
        font-size: 14px;
        font-style: italic;
    }

    /* Unified Profile */
    .unified-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px 0;
    }

    .unified-profile {
        background: white;
        border-radius: 16px;
        box-shadow: 0 12px 48px rgba(0,0,0,0.08);
        width: 100%;
        max-width: 600px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
    }

    .profile-header {
        background: #0f172a;
        padding: 32px;
        display: flex;
        align-items: center;
        gap: 24px;
    }

    .avatar {
        width: 72px;
        height: 72px;
        background: #10b981;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 700;
        border: 4px solid #1e293b;
    }

    .profile-title h2 {
        margin: 0 0 8px;
        color: white;
        font-size: 24px;
    }

    .profile-body {
        padding: 32px;
    }

    .data-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-bottom: 32px;
    }

    .data-item .data-label {
        display: block;
        font-size: 11px;
        text-transform: uppercase;
        color: #64748b;
        font-weight: 700;
        margin-bottom: 4px;
        letter-spacing: 0.05em;
    }

    .data-item div {
        font-size: 15px;
        font-weight: 500;
        color: #0f172a;
    }

    .timeline-section h4 {
        margin: 0 0 16px;
        color: #0f172a;
        font-size: 16px;
    }

    .unified-timeline {
        list-style: none;
        padding: 0;
        margin: 0;
        position: relative;
    }

    .unified-timeline::before {
        content: '';
        position: absolute;
        left: 6px;
        top: 8px;
        bottom: 8px;
        width: 2px;
        background: #e2e8f0;
    }

    .unified-timeline li {
        position: relative;
        padding-left: 24px;
        margin-bottom: 16px;
        font-size: 14px;
    }

    .unified-timeline li::before {
        content: '';
        position: absolute;
        left: 2px;
        top: 6px;
        width: 10px;
        height: 10px;
        background: #10b981;
        border-radius: 50%;
        border: 2px solid white;
    }

    .unified-timeline .time {
        font-weight: 700;
        color: #475569;
        margin-right: 8px;
    }

    .unified-timeline .device {
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        color: #64748b;
        margin-right: 8px;
    }

    .unified-timeline .action {
        color: #0f172a;
    }

    @media (max-width: 1024px) {
        .demo-layout {
            grid-template-columns: 1fr;
        }
        .sessions-grid {
            grid-template-columns: 1fr;
        }
        .data-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
