<script lang="ts">
    import { slide, fade } from 'svelte/transition';

    interface Stage {
        id: number;
        title: string;
        icon: string;
        summary: string;
        details: Record<string, any>;
    }

    const STAGES: Stage[] = [
        {
            id: 0,
            title: '1. Event Ingestion',
            icon: '📥',
            summary: 'Raw data normalized from external provider.',
            details: {
                Source: 'Google Reviews API',
                Provider_ID: 'rev_88492a',
                Author: 'Margaret T.',
                Rating: '1-Star',
                Content: '"They left a huge mess in my bathroom and the consultant was rude. Unacceptable."',
                Sentiment_Score: '-0.92 (High Negative)',
                Extracted_Topics: ['Cleanliness', 'Consultant Behavior']
            }
        },
        {
            id: 1,
            title: '2. Signal Detection',
            icon: '📡',
            summary: 'Deterministic rules map enriched events to signals.',
            details: {
                Matched_Rules: [
                    'If [Rating <= 2] AND [Sentiment < -0.5] -> Emit: Risk_Reputation',
                    'If [Topics includes Consultant] -> Emit: Risk_Escalation'
                ],
                Active_Signals: [
                    { name: 'Risk: Reputation', severity: 'Critical' },
                    { name: 'Risk: Escalation', severity: 'High' }
                ]
            }
        },
        {
            id: 2,
            title: '3. Orchestrator Decision',
            icon: '🧠',
            summary: 'The core engine resolves conflicting signals and applies safety rules.',
            details: {
                Explanation: 'A critical reputation risk was detected. The system prioritized human intervention over automated workflows.',
                Dominant_Signal: 'Risk: Reputation',
                Suppressed_Signals: ['Risk: Escalation (Subsumed by Reputation protocol)'],
                Selected_Action_Library_IDs: ['act_alert_owner_sms', 'act_draft_apology_ticket'],
                Blocked_Actions: [
                    { action: 'Automated 1-Star Reply', reason: 'SAFETY OVERRIDE: Never auto-reply to 1-star reviews. Human review strictly required.' }
                ]
            }
        },
        {
            id: 3,
            title: '4. Action Queue',
            icon: '⚙️',
            summary: 'Abstract decisions are mapped to concrete system actions.',
            details: {
                Queue: [
                    'Generate high-priority SMS payload for APEX Owner (John).',
                    'Create internal Zendesk ticket with AI-drafted apology for review.'
                ]
            }
        },
        {
            id: 4,
            title: '5. Execution Mode',
            icon: '🚦',
            summary: 'Resolving automatic vs. approval-required execution.',
            details: {
                Internal_Alerts: 'Automatic (SMS to Owner bypasses approval).',
                External_Comms: 'Approval Required (Draft reply pushed to approval queue).',
                Constraints_Checked: 'Timezone is Active (10:30 AM). Owner is on-shift.'
            }
        },
        {
            id: 5,
            title: '6. Outcome',
            icon: '✅',
            summary: 'The system dispatches the actions.',
            details: {
                Action_1: 'SMS delivered to +1 (555) 019-2831 (John).',
                Action_2: 'Ticket #4491 created. Status: Waiting on Human Approval.'
            }
        },
        {
            id: 6,
            title: '7. Feedback Loop',
            icon: '🔄',
            summary: 'Results written back to the data layer.',
            details: {
                Journey_Update: 'Appended negative event to Margaret T. customer timeline.',
                Dashboard_Update: 'APEX Contracting overall sentiment score degraded by -2.1%.'
            }
        }
    ];

    let activeStageIndex = $state(0);
    
    let activeStage = $derived(STAGES[activeStageIndex]);

    const AUDIT_LOG = [
        { time: '10:31:02', level: 'INFO', msg: 'Ingested webhook from Google Reviews API [rev_88492a]' },
        { time: '10:31:03', level: 'AI_EXTRACT', msg: 'Sentiment: -0.92, Topics: [Cleanliness, Consultant Behavior]' },
        { time: '10:31:03', level: 'SIGNAL', msg: 'Emitted Risk: Reputation (Critical)' },
        { time: '10:31:03', level: 'SIGNAL', msg: 'Emitted Risk: Escalation (High)' },
        { time: '10:31:04', level: 'ORCHESTRATOR', msg: 'Selected Dominant Signal: Risk: Reputation' },
        { time: '10:31:04', level: 'SAFETY', msg: 'BLOCKED: act_auto_reply (Rule: No 1-star auto-replies)' },
        { time: '10:31:05', level: 'EXEC', msg: 'Dispatched SMS to APEX Owner (via Telnyx)' },
        { time: '10:31:05', level: 'EXEC', msg: 'Created Zendesk Ticket #4491 (Status: Draft)' }
    ];

</script>

<div class="demo-container">
    <header class="demo-header">
        <h1>Orchestrator Pipeline Visualiser</h1>
        <p>Interactive trace of the 7-stage decision engine for a critical event.</p>
        <div class="scenario-badge">Scenario: Margaret T. 1-Star Review (APEX Contracting)</div>
    </header>

    <!-- Pipeline Stepper -->
    <div class="pipeline-stepper">
        {#each STAGES as stage, index (stage.id)}
            <button 
                class="step {activeStageIndex === index ? 'active' : ''} {activeStageIndex > index ? 'completed' : ''}"
                onclick={() => activeStageIndex = index}
            >
                <div class="step-icon">{stage.icon}</div>
                <div class="step-label">{stage.title}</div>
            </button>
            {#if index < STAGES.length - 1}
                <div class="step-connector {activeStageIndex > index ? 'completed' : ''}"></div>
            {/if}
        {/each}
    </div>

    <!-- Active Stage Panel -->
    {#key activeStageIndex}
    <div class="active-panel" in:fade={{ duration: 200 }}>
        <div class="panel-header">
            <h2>{activeStage.title}</h2>
            <p>{activeStage.summary}</p>
        </div>

        <div class="panel-content">
            {#if activeStage.id === 2}
                <!-- Custom layout for Orchestrator Decision to highlight plain-english & safety -->
                <div class="decision-card">
                    <div class="field">
                        <span class="label">Plain-English Explanation</span>
                        <div class="value highlight">{activeStage.details.Explanation}</div>
                    </div>
                    
                    <div class="grid-2">
                        <div class="field">
                            <span class="label">Dominant Signal</span>
                            <div class="value badge-risk">{activeStage.details.Dominant_Signal}</div>
                        </div>
                        <div class="field">
                            <span class="label">Selected Actions</span>
                            <ul class="value-list">
                                {#each activeStage.details.Selected_Action_Library_IDs as act (act)}
                                    <li><code>{act}</code></li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="field mt-4 blocked-section">
                        <span class="label text-red">Blocked Actions (Safety Boundary Enforced)</span>
                        {#each activeStage.details.Blocked_Actions as blocked (blocked.action)}
                            <div class="blocked-item">
                                <strong>{blocked.action}</strong>
                                <span class="reason">{blocked.reason}</span>
                            </div>
                        {/each}
                    </div>
                </div>
            {:else}
                <!-- Generic Key-Value layout for other stages -->
                <div class="details-grid">
                    {#each Object.entries(activeStage.details) as [key, value] (key)}
                        <div class="detail-row">
                            <div class="detail-key">{key.replace(/_/g, ' ')}</div>
                            <div class="detail-value">
                                {#if Array.isArray(value)}
                                    <ul class="value-list">
                                        {#each value as item (typeof item === 'object' ? item.name : item)}
                                            <li>
                                                {#if typeof item === 'object'}
                                                    <strong>{item.name}</strong> ({item.severity})
                                                {:else}
                                                    {item}
                                                {/if}
                                            </li>
                                        {/each}
                                    </ul>
                                {:else}
                                    {value}
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
    {/key}

    <!-- Audit Log -->
    <section class="audit-section">
        <h3>System Audit Trail</h3>
        <p class="audit-desc">Immutable ledger of system actions. Transparent and fully traceable.</p>
        <div class="audit-terminal">
            <table class="audit-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {#each AUDIT_LOG as log, i (i)}
                        <tr>
                            <td class="log-time">{log.time}</td>
                            <td class="log-level {log.level.toLowerCase()}">[{log.level}]</td>
                            <td class="log-msg">{log.msg}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </section>

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
        margin: 0 0 16px;
    }

    .scenario-badge {
        display: inline-block;
        background: #fef2f2;
        color: #7f1d1d;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 700;
        border: 1px solid #fca5a5;
    }

    /* Stepper */
    .pipeline-stepper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: white;
        padding: 24px 32px;
        border-radius: 12px;
        border: 1px solid #E8E4DC;
        margin-bottom: 32px;
        overflow-x: auto;
    }

    .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: none;
        border: none;
        cursor: pointer;
        gap: 8px;
        z-index: 2;
        position: relative;
        min-width: 80px;
        opacity: 0.6;
        transition: all 0.2s;
    }

    .step:hover {
        opacity: 0.8;
    }

    .step.active {
        opacity: 1;
    }

    .step.completed {
        opacity: 1;
    }

    .step-icon {
        width: 48px;
        height: 48px;
        background: #F8F6F1;
        border: 2px solid #E8E4DC;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        transition: all 0.3s;
    }

    .step.active .step-icon {
        background: #EBF5EF;
        border-color: #1B5E3B;
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(27, 94, 59, 0.2);
    }
    
    .step.completed .step-icon {
        background: #1B5E3B;
        border-color: #1B5E3B;
        color: white;
    }

    .step-label {
        font-size: 12px;
        font-weight: 700;
        color: #4A5E52;
        text-align: center;
        white-space: nowrap;
    }

    .step.active .step-label {
        color: #1B5E3B;
    }

    .step-connector {
        flex: 1;
        height: 2px;
        background: #E8E4DC;
        margin: 0 8px;
        margin-bottom: 24px; /* offset for label */
        transition: background 0.3s;
        min-width: 20px;
    }

    .step-connector.completed {
        background: #1B5E3B;
    }

    /* Active Panel */
    .active-panel {
        background: white;
        border: 1px solid #E8E4DC;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.03);
        margin-bottom: 40px;
        min-height: 250px;
    }

    .panel-header {
        margin-bottom: 24px;
        border-bottom: 1px solid #E8E4DC;
        padding-bottom: 16px;
    }

    .panel-header h2 {
        margin: 0 0 8px;
        font-size: 24px;
        color: #0D1F14;
    }

    .panel-header p {
        margin: 0;
        color: #4A5E52;
        font-size: 15px;
    }

    .details-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .detail-row {
        display: flex;
        background: #F8F6F1;
        border-radius: 8px;
        overflow: hidden;
    }

    .detail-key {
        width: 200px;
        background: #E8E4DC;
        padding: 12px 16px;
        font-weight: 700;
        font-size: 13px;
        color: #4A5E52;
        display: flex;
        align-items: center;
    }

    .detail-value {
        padding: 12px 16px;
        font-size: 14px;
        flex: 1;
    }

    .value-list {
        margin: 0;
        padding-left: 20px;
    }

    .value-list li {
        margin-bottom: 4px;
    }
    .value-list li:last-child {
        margin-bottom: 0;
    }

    /* Custom Decision Card */
    .decision-card {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .label {
        font-size: 12px;
        text-transform: uppercase;
        font-weight: 700;
        color: #8A9E92;
        letter-spacing: 0.05em;
    }

    .text-red {
        color: #dc2626;
    }

    .value.highlight {
        font-size: 18px;
        font-weight: 600;
        color: #111714;
        background: #f0fdf4;
        padding: 16px;
        border-left: 4px solid #16a34a;
        border-radius: 4px;
    }

    .badge-risk {
        display: inline-block;
        background: #fef2f2;
        color: #991b1b;
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 14px;
        width: fit-content;
    }

    .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        background: #F8F6F1;
        padding: 20px;
        border-radius: 8px;
    }

    code {
        background: white;
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid #E8E4DC;
        font-family: monospace;
        font-size: 13px;
    }

    .mt-4 { margin-top: 16px; }

    .blocked-section {
        background: #FAEDE8;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #fecaca;
    }

    .blocked-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .blocked-item strong {
        color: #7f1d1d;
        font-size: 15px;
    }

    .blocked-item .reason {
        color: #991b1b;
        font-size: 14px;
    }

    /* Audit Terminal */
    .audit-section {
        margin-top: 40px;
    }

    .audit-section h3 {
        margin: 0 0 8px;
        font-size: 20px;
        color: #0D1F14;
    }

    .audit-desc {
        color: #4A5E52;
        font-size: 14px;
        margin-bottom: 16px;
    }

    .audit-terminal {
        background: #0f172a;
        border-radius: 8px;
        padding: 16px;
        overflow-x: auto;
        font-family: 'JetBrains Mono', monospace, system-ui;
    }

    .audit-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
        color: #e2e8f0;
    }

    .audit-table th {
        text-align: left;
        padding: 8px;
        color: #64748b;
        font-weight: 600;
        border-bottom: 1px solid #1e293b;
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 0.05em;
    }

    .audit-table td {
        padding: 8px;
        border-bottom: 1px solid #1e293b;
    }

    .audit-table tr:last-child td {
        border-bottom: none;
    }

    .log-time {
        color: #94a3b8;
        width: 100px;
    }

    .log-level {
        width: 140px;
        font-weight: 700;
    }
    
    .log-level.info { color: #38bdf8; }
    .log-level.ai_extract { color: #c084fc; }
    .log-level.signal { color: #facc15; }
    .log-level.orchestrator { color: #34d399; }
    .log-level.safety { color: #f87171; }
    .log-level.exec { color: #818cf8; }

    .log-msg {
        color: #e2e8f0;
    }

    @media (max-width: 768px) {
        .pipeline-stepper {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
        }
        .step {
            flex-direction: row;
            width: 100%;
            justify-content: flex-start;
        }
        .step-connector {
            display: none;
        }
        .grid-2 {
            grid-template-columns: 1fr;
        }
        .detail-row {
            flex-direction: column;
        }
        .detail-key {
            width: 100%;
            box-sizing: border-box;
        }
    }
</style>
