<script lang="ts">
    import { fade, fly, slide } from 'svelte/transition';
    import { onDestroy } from 'svelte';

    let activeTab = $state(1);

    // Scenario 1 State
    let slaActive = $state(false);
    let slaMet = $state(false);
    let slaTime = $state(0); // in seconds
    let timerInterval: ReturnType<typeof setInterval>;

    let displayMinutes = $derived(Math.floor(slaTime / 60).toString().padStart(2, '0'));
    let displaySeconds = $derived((slaTime % 60).toString().padStart(2, '0'));
    let isSlaWarning = $derived(slaTime > 600 && !slaMet); // warning after 10 mins

    function triggerEmergency() {
        if (timerInterval) clearInterval(timerInterval);
        slaActive = true;
        slaMet = false;
        slaTime = 0;
        
        // Fast tick for demo purposes (1 real second = 1 sim minute approx, or just fast real time)
        // Let's do 1 real second = 15 sim seconds
        timerInterval = setInterval(() => {
            slaTime += 15;
            if (slaTime >= 900) { // 15 mins
                clearInterval(timerInterval);
            }
        }, 1000);
    }

    function simulateRepCall() {
        if (timerInterval) clearInterval(timerInterval);
        slaMet = true;
        // Stop at 14:52 (892 seconds) if it hasn't reached it, or just wherever it is.
        if (slaTime < 892) slaTime = 892; 
    }

    // Scenario 2 State
    let visitorReplied = $state(false);

    function replyYes() {
        visitorReplied = true;
    }

    // Scenario 3 State
    let optedOut = $state(false);

    function simulateStop() {
        optedOut = true;
    }

    onDestroy(() => {
        if (timerInterval) clearInterval(timerInterval);
    });

    function resetStates() {
        if (timerInterval) clearInterval(timerInterval);
        slaActive = false;
        slaMet = false;
        slaTime = 0;
        visitorReplied = false;
        optedOut = false;
    }
</script>

<div class="demo-container">
    <header class="demo-header">
        <h1>A2P Messaging & Compliance</h1>
        <p>Automated, two-way SMS communication with built-in SLA tracking and human-in-the-loop safeguards.</p>
    </header>

    <div class="tabs-nav">
        <button 
            class="tab-btn {activeTab === 1 ? 'active' : ''}" 
            onclick={() => { activeTab = 1; resetStates(); }}
        >
            1. Emergency SLA
        </button>
        <button 
            class="tab-btn {activeTab === 2 ? 'active' : ''}" 
            onclick={() => { activeTab = 2; resetStates(); }}
        >
            2. Booking Confirmation
        </button>
        <button 
            class="tab-btn {activeTab === 3 ? 'active' : ''}" 
            onclick={() => { activeTab = 3; resetStates(); }}
        >
            3. Post-Job Review & Compliance
        </button>
    </div>

    <div class="scenario-container">
        {#if activeTab === 1}
            <div class="scenario" in:fade={{ duration: 300 }}>
                <div class="scenario-header">
                    <div class="scenario-meta">
                        <h3>Scenario 1: Emergency SLA</h3>
                        <p>Visitor hits <code>/burst-pipe</code> at 10:58 PM. Emergency intent bucket fires. 15-minute SLA clock begins.</p>
                    </div>
                    <div class="scenario-controls">
                        {#if !slaActive && !slaMet}
                            <button class="btn-primary" onclick={triggerEmergency}>Trigger Emergency Alert</button>
                        {:else if slaActive && !slaMet}
                            <button class="btn-success" onclick={simulateRepCall}>Simulate Rep Callback</button>
                        {/if}
                    </div>
                </div>

                {#if slaActive || slaMet}
                    <div class="sla-dashboard" in:slide={{ duration: 400 }}>
                        <div class="clock-panel {slaMet ? 'clock-success' : (isSlaWarning ? 'clock-warning' : 'clock-ticking')}">
                            <span class="clock-label">SLA TIMER (15m Target)</span>
                            <div class="clock-time">{displayMinutes}:{displaySeconds}</div>
                            <span class="clock-status">
                                {#if slaMet}
                                    SLA Met. Rep connected.
                                {:else if isSlaWarning}
                                    SLA At Risk! Escalating...
                                {:else}
                                    Active - Awaiting Callback
                                {/if}
                            </span>
                        </div>

                        <div class="threads-grid">
                            <div class="phone-mockup">
                                <div class="phone-header">
                                    <span>To: Visitor (555-0199)</span>
                                </div>
                                <div class="phone-body">
                                    <div class="msg-bubble system" in:fly={{ y: 20, duration: 300 }}>
                                        RightFlush: We received your emergency alert. A technician has been paged and will call you within 15 minutes.
                                        <span class="msg-time">10:58 PM</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="phone-mockup internal">
                                <div class="phone-header">
                                    <span>To: Rep (On-Call)</span>
                                </div>
                                <div class="phone-body">
                                    <div class="msg-bubble internal-alert" in:fly={{ y: 20, duration: 300, delay: 200 }}>
                                        🚨 EMERGENCY SLA ACTIVE 🚨<br/>
                                        Burst pipe reported.<br/>
                                        Ph: 555-0199<br/>
                                        Reply 1 to claim. Call immediately.
                                        <span class="msg-time">10:58 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

        {:else if activeTab === 2}
            <div class="scenario" in:fade={{ duration: 300 }}>
                <div class="scenario-header">
                    <div class="scenario-meta">
                        <h3>Scenario 2: Booking Confirmation</h3>
                        <p>Visitor submits appointment form on the specials page. System sends two-way confirmation SMS.</p>
                    </div>
                    <div class="scenario-controls">
                        <button class="btn-primary" onclick={replyYes} disabled={visitorReplied}>
                            Simulate Visitor "YES" Reply
                        </button>
                    </div>
                </div>

                <div class="booking-layout">
                    <div class="phone-mockup">
                        <div class="phone-header">
                            <span>To: Visitor (555-0199)</span>
                        </div>
                        <div class="phone-body">
                            <div class="msg-bubble system">
                                RightFlush: Your appointment request for tomorrow at 2 PM is received. Please reply YES to confirm or NO to reschedule.
                                <span class="msg-time">9:05 AM</span>
                            </div>
                            {#if visitorReplied}
                                <div class="msg-bubble visitor" in:fly={{ y: 20, duration: 300 }}>
                                    YES
                                    <span class="msg-time">9:07 AM</span>
                                </div>
                                <div class="msg-bubble system" in:fly={{ y: 20, duration: 300, delay: 400 }}>
                                    RightFlush: Confirmed! See you tomorrow at 2 PM.
                                    <span class="msg-time">9:07 AM</span>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="dashboard-panel">
                        <div class="panel-header">
                            <h4>Rep Dashboard (CRM Sync)</h4>
                        </div>
                        <div class="crm-record">
                            <div class="data-row">
                                <span class="label">Appointment:</span>
                                <span class="value">Tomorrow, 2:00 PM</span>
                            </div>
                            <div class="data-row">
                                <span class="label">Status:</span>
                                {#if visitorReplied}
                                    <span class="status-badge success" in:fade>Confirmed</span>
                                {:else}
                                    <span class="status-badge warning">Pending Confirmation</span>
                                {/if}
                            </div>
                            <div class="log-entries">
                                <div class="log-entry">9:05 AM - Outbound SMS sent</div>
                                {#if visitorReplied}
                                    <div class="log-entry highlight" in:slide>9:07 AM - Inbound YES received</div>
                                    <div class="log-entry" in:slide={{ delay: 200 }}>9:07 AM - Status updated to Confirmed</div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        {:else if activeTab === 3}
            <div class="scenario" in:fade={{ duration: 300 }}>
                <div class="scenario-header">
                    <div class="scenario-meta">
                        <h3>Scenario 3: Post-Job Review & Compliance</h3>
                        <p>Job marked complete. D+3 timer triggers review request. Strict compliance mechanics are enforced.</p>
                    </div>
                    <div class="scenario-controls">
                        <button class="btn-danger" onclick={simulateStop} disabled={optedOut}>
                            Simulate Visitor "STOP" Reply
                        </button>
                    </div>
                </div>

                <div class="review-layout">
                    <div class="phone-mockup">
                        <div class="phone-header">
                            <span>To: Visitor (555-0199)</span>
                        </div>
                        <div class="phone-body">
                            <div class="msg-bubble system">
                                RightFlush: Thanks for choosing us! We'd love your feedback. Rate your experience here: rightflush.ca/review<br/><br/>
                                Reply STOP to opt-out.
                                <span class="msg-time">D+3 10:00 AM</span>
                            </div>
                            {#if optedOut}
                                <div class="msg-bubble visitor" in:fly={{ y: 20, duration: 300 }}>
                                    STOP
                                    <span class="msg-time">D+3 10:05 AM</span>
                                </div>
                                <div class="msg-bubble system opt-out-ack" in:fly={{ y: 20, duration: 300, delay: 400 }}>
                                    Network: You have been unsubscribed and will no longer receive messages.
                                    <span class="msg-time">D+3 10:05 AM</span>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="dashboard-panel">
                        <div class="panel-header">
                            <h4>Compliance Engine & Review Queue</h4>
                        </div>
                        
                        {#if optedOut}
                            <div class="compliance-alert" in:slide>
                                <strong>🚨 COMPLIANCE LOCK ENGAGED</strong>
                                <ul>
                                    <li><code>a2p_unsubscribe</code> fired</li>
                                    <li>Engagement Score dropped -25</li>
                                    <li>Profile permanently flagged: DND</li>
                                </ul>
                            </div>
                        {:else}
                            <div class="draft-panel" out:fade>
                                <span class="draft-badge">QUEUED FOR HUMAN APPROVAL</span>
                                <span class="draft-badge caution">NEVER AUTO-POSTED</span>
                                <p class="draft-context">If the customer leaves a 5-star Google review, the AI will draft this reply for a rep to approve:</p>
                                <div class="draft-box">
                                    "Thank you so much for the 5-star review! We are thrilled to hear your plumbing issue was resolved quickly."
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .demo-container {
        padding: 40px;
        max-width: 1200px;
        margin: 0 auto;
        font-family: var(--sans, system-ui, sans-serif);
        color: #111714;
    }

    .demo-header {
        margin-bottom: 32px;
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

    .tabs-nav {
        display: flex;
        gap: 8px;
        margin-bottom: 32px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 16px;
    }

    .tab-btn {
        background: white;
        border: 1px solid #e2e8f0;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s;
    }

    .tab-btn:hover {
        background: #f8fafc;
        color: #0f172a;
    }

    .tab-btn.active {
        background: #0f172a;
        color: white;
        border-color: #0f172a;
    }

    .scenario-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
        background: #f8fafc;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
    }

    .scenario-meta h3 {
        margin: 0 0 8px;
        font-size: 20px;
        color: #0f172a;
    }

    .scenario-meta p {
        margin: 0;
        font-size: 14px;
        color: #475569;
    }

    .scenario-meta code {
        background: #e2e8f0;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
    }

    .btn-primary, .btn-success, .btn-danger {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        color: white;
    }

    .btn-primary { background: #0f172a; }
    .btn-primary:hover:not(:disabled) { background: #1e293b; transform: translateY(-1px); }
    
    .btn-success { background: #10b981; }
    .btn-success:hover { background: #059669; transform: translateY(-1px); }

    .btn-danger { background: #ef4444; }
    .btn-danger:hover:not(:disabled) { background: #dc2626; transform: translateY(-1px); }

    .btn-primary:disabled, .btn-danger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Scenario 1: Clock */
    .clock-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        border-radius: 16px;
        margin-bottom: 32px;
        color: white;
        transition: all 0.5s;
    }

    .clock-ticking { background: #0f172a; }
    .clock-warning { background: #b45309; }
    .clock-success { background: #10b981; }

    .clock-label {
        font-size: 12px;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.05em;
        opacity: 0.8;
    }

    .clock-time {
        font-size: 64px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        line-height: 1;
        margin: 8px 0;
    }

    .clock-status {
        font-size: 15px;
        font-weight: 600;
    }

    .threads-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
    }

    /* Shared Phone UI */
    .phone-mockup {
        border: 8px solid #0f172a;
        border-radius: 32px;
        overflow: hidden;
        background: #f8fafc;
        height: 400px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 12px 48px rgba(0,0,0,0.1);
    }

    .phone-mockup.internal {
        border-color: #334155;
    }

    .phone-header {
        background: #f1f5f9;
        padding: 16px;
        text-align: center;
        font-size: 13px;
        font-weight: 600;
        color: #475569;
        border-bottom: 1px solid #e2e8f0;
    }

    .phone-body {
        padding: 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow-y: auto;
    }

    .msg-bubble {
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.4;
        position: relative;
        max-width: 85%;
    }

    .msg-bubble.system {
        background: #e2e8f0;
        color: #0f172a;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
    }

    .msg-bubble.visitor {
        background: #3b82f6;
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 4px;
    }

    .msg-bubble.internal-alert {
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #fca5a5;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
    }

    .msg-bubble.opt-out-ack {
        background: #f1f5f9;
        color: #64748b;
        font-size: 12px;
        font-style: italic;
    }

    .msg-time {
        display: block;
        font-size: 10px;
        margin-top: 4px;
        opacity: 0.6;
        text-align: right;
    }

    /* Booking & Review Layouts */
    .booking-layout, .review-layout {
        display: grid;
        grid-template-columns: 350px 1fr;
        gap: 40px;
    }

    .dashboard-panel {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
    }

    .panel-header {
        background: #f8fafc;
        padding: 16px 24px;
        border-bottom: 1px solid #e2e8f0;
    }

    .panel-header h4 {
        margin: 0;
        font-size: 16px;
        color: #0f172a;
    }

    .crm-record {
        padding: 24px;
    }

    .data-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        font-size: 14px;
    }

    .data-row .label { color: #64748b; }
    .data-row .value { color: #0f172a; font-weight: 500; }

    .status-badge {
        font-size: 12px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .status-badge.warning { background: #fef3c7; color: #b45309; }
    .status-badge.success { background: #d1fae5; color: #047857; }

    .log-entries {
        margin-top: 24px;
        border-top: 1px solid #e2e8f0;
        padding-top: 16px;
    }

    .log-entry {
        font-size: 13px;
        color: #64748b;
        margin-bottom: 8px;
        padding-left: 12px;
        border-left: 2px solid #e2e8f0;
    }

    .log-entry.highlight {
        border-left-color: #3b82f6;
        color: #0f172a;
        font-weight: 500;
    }

    .draft-panel {
        padding: 24px;
    }

    .draft-badge {
        display: inline-block;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 4px;
        background: #e0f2fe;
        color: #0369a1;
        margin-bottom: 16px;
        margin-right: 8px;
    }

    .draft-badge.caution {
        background: #fef2f2;
        color: #ef4444;
    }

    .draft-context {
        font-size: 14px;
        color: #475569;
        margin-bottom: 16px;
    }

    .draft-box {
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        padding: 16px;
        border-radius: 8px;
        font-style: italic;
        color: #0f172a;
    }

    .compliance-alert {
        margin: 24px;
        background: #fef2f2;
        border: 1px solid #fca5a5;
        border-radius: 8px;
        padding: 20px;
        color: #991b1b;
    }

    .compliance-alert strong {
        display: block;
        margin-bottom: 12px;
        font-size: 16px;
    }

    .compliance-alert ul {
        margin: 0;
        padding-left: 20px;
        font-size: 14px;
    }

    .compliance-alert li {
        margin-bottom: 4px;
    }

    .compliance-alert code {
        background: rgba(255,255,255,0.5);
        padding: 2px 4px;
        border-radius: 4px;
    }

    @media (max-width: 768px) {
        .threads-grid, .booking-layout, .review-layout {
            grid-template-columns: 1fr;
        }
        .phone-mockup {
            height: 350px;
        }
    }
</style>
