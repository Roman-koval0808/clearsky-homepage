<script lang="ts">
    import { fade, slide } from 'svelte/transition';

    // Types
    type Bucket = 'research' | 'comparison' | 'active' | 'emergency';
    
    // State
    let scoreRaw = $state(0);
    let bucket = $state<Bucket>('research');
    let events = $state<{id: number, name: string, delta: number, newScore: number, bucket: Bucket, time: Date}[]>([]);
    
    // Decay and Threshold configuration
    const HALF_LIVES = { emergency: 2, active: 14, comparison: 30, research: 60 };
    const GRACE_PERIODS = { emergency: 1, active: 3, comparison: 7, research: 14 };

    // Decay state
    let daysPassed = $state(0);
    
    let isGracePeriodActive = $derived(daysPassed <= GRACE_PERIODS[bucket]);

    let eventCounter = 0;
    
    let scoreLive = $derived.by(() => {
        if (isGracePeriodActive) return scoreRaw;
        const halfLife = HALF_LIVES[bucket];
        const decayed = scoreRaw * Math.pow(0.5, daysPassed / halfLife);
        return Math.max(0, Math.round(decayed));
    });

    // Config
    const BUCKETS = {
        research: { label: 'Research', color: '#14532d', bg: '#f0fdf4', min: 0, desc: 'Casual browsing, reading blogs.', action: 'Soft capture (Email)' },
        comparison: { label: 'Comparison', color: '#1e3a8a', bg: '#eff6ff', min: 25, desc: 'Looking at pricing, service areas.', action: 'Value proposition push' },
        active: { label: 'Active Project', color: '#78350f', bg: '#fffbeb', min: 45, desc: 'Deep engagement, visualizer tools.', action: 'Aggressive hard capture (Phone)' },
        emergency: { label: 'Emergency', color: '#7f1d1d', bg: '#fef2f2', min: 0, desc: 'Immediate need (burst pipe).', action: 'Immediate Priority Routing' } 
    };

    const DELTA_TABLE = [
        { action: 'Page Load', base: '+3', ctx: 'Standard pages' },
        { action: 'Blog Dwell (60s)', base: '+7', ctx: 'Research context' },
        { action: 'Gallery View', base: '+10', ctx: 'Comparison context' },
        { action: 'Visualizer Use', base: '+25', ctx: 'Active project context' },
        { action: 'Rage Click', base: '-5', ctx: 'Friction signal' },
        { action: 'Emergency Load', base: '+20', ctx: 'Immediate override' }
    ];

    function simulateAction(name: string, delta: number, overrideBucket?: Bucket) {
        // Reset decay for new event
        daysPassed = 0;

        if (overrideBucket === 'emergency') {
            bucket = 'emergency';
        }
        
        scoreRaw = Math.max(0, Math.min(100, scoreRaw + delta));
        
        // Important: No-downgrade rule applies within-session.
        // If a negative event drops score below a threshold, the bucket MUST NOT demote here.
        // Demotion ONLY happens cross-session in advanceTime().
        if (bucket !== 'emergency') {
            if (scoreRaw >= 45 && bucket !== 'active') bucket = 'active';
            else if (scoreRaw >= 25 && bucket === 'research') bucket = 'comparison';
            // Notice: If scoreRaw >= 25 but bucket is already 'comparison' or 'active', it stays.
        }
        
        events.unshift({
            id: ++eventCounter,
            name, 
            delta, 
            newScore: scoreRaw,
            bucket,
            time: new Date()
        });

        // Limit event log
        if (events.length > 5) events.pop();
    }

    function simulateReviewPage() {
        const recentNames = events.slice(0, 5).map(e => e.name);
        const hasGalleryContext = recentNames.includes('Gallery View');
        const delta = hasGalleryContext ? 12 : 4;
        const label = hasGalleryContext
            ? 'Review Page (Gallery Context ×3.0)'
            : 'Review Page (No Context)';
        simulateAction(label, delta);
    }

    function advanceTime() {
        daysPassed += 5;
        
        // We calculate currentLive manually here for the immediate demotion check.
        // The reactive $derived scoreLive will update after this function completes.
        const halfLife = HALF_LIVES[bucket];
        const isGracePeriodActiveCheck = daysPassed <= GRACE_PERIODS[bucket];
        const currentLive = isGracePeriodActiveCheck ? scoreRaw : Math.max(0, Math.round(scoreRaw * Math.pow(0.5, daysPassed / halfLife)));
        
        // Cross-session demotion logic
        if (bucket !== 'emergency') {
            if (currentLive < 25) bucket = 'research';
            else if (currentLive < 45 && bucket === 'active') bucket = 'comparison';
        }
    }

    function resetSim() {
        scoreRaw = 0;
        bucket = 'research';
        events = [];
        daysPassed = 0;
    }
</script>

<div class="demo-container">
    <header class="demo-header">
        <h1>ClearSky Engine: Interactive Demo</h1>
        <p>A visual breakdown of Intent Buckets and Engagement Scoring algorithms.</p>
        <button class="btn-reset" onclick={resetSim}>Reset Simulation</button>
    </header>
    
    <!-- Unified Status Bar -->
    <div class="status-bar" style="border-left: 6px solid {BUCKETS[bucket].color}">
        <div class="status-col">
            <span class="label">Current Bucket</span>
            <span class="value" style="color: {BUCKETS[bucket].color}">{BUCKETS[bucket].label}</span>
        </div>
        <div class="status-col">
            <span class="label">Raw Score</span>
            <span class="value">{scoreRaw}</span>
        </div>
        <div class="status-col">
            <span class="label">Live Score (Decayed)</span>
            <span class="value {scoreLive < scoreRaw ? 'decayed' : ''}">{scoreLive}</span>
        </div>
        <div class="status-col">
            <span class="label">System Action</span>
            <span class="value highlight">{BUCKETS[bucket].action}</span>
        </div>
    </div>

    <!-- PART 1: The Simulator -->
    <section class="demo-section">
        <h2>Part 1 & 3: The Journey & Orchestrator Flow</h2>
        <div class="grid-2-col">
            <!-- Event Controls -->
            <div class="panel">
                <h3>Simulate Visitor Action</h3>
                <p class="desc">Click actions to advance the visitor journey. Observe how score and bucket react.</p>
                
                <div class="action-grid">
                    <button class="btn-action" onclick={() => simulateAction('Blog Load', 3)}>Read Blog (+3)</button>
                    <button class="btn-action" onclick={() => simulateAction('Gallery View', 10)}>View Gallery (+10)</button>
                    <button class="btn-action" onclick={() => simulateAction('View Pricing', 15)}>Check Pricing (+15)</button>
                    <button class="btn-action" onclick={() => simulateAction('Use Visualizer', 25)}>Use Visualizer (+25)</button>
                    <button class="btn-action friction" onclick={() => simulateAction('Rage Click', -5)}>Rage Click (-5)</button>
                    <button class="btn-action emergency" onclick={() => simulateAction('Burst Pipe Page', 20, 'emergency')}>Emergency Overide (+20)</button>
                    <div style="grid-column: span 2; margin-top: 8px;">
                        <span style="font-size: 13px; font-weight: 600; color: #4A5E52;">Path Context Example:</span>
                    </div>
                    <button class="btn-action" style="grid-column: span 2; border-left: 3px solid #1B5E3B; background: #EBF5EF;" onclick={simulateReviewPage}>Simulate "Review Page" Visit</button>
                </div>

                <div class="decay-controls mt-4">
                    <h3>Simulate Time Passing (Decay)</h3>
                    <p class="desc">Advancing time breaks the grace period and decays the Live Score.</p>
                    <button class="btn-action" onclick={advanceTime}>Advance Time (+5 Days)</button>
                    <div class="decay-stats">
                        Days Idle: {daysPassed} | Grace Period: {isGracePeriodActive ? 'Active' : 'Expired'}
                    </div>
                </div>
            </div>

            <!-- Live Event Flow -->
            <div class="panel">
                <h3>Real-time Event Flow</h3>
                <div class="event-log">
                    {#if events.length === 0}
                        <div class="empty-state">No events fired yet.</div>
                    {/if}
                    {#each events as event (event.id)}
                        <div class="event-card" in:slide>
                            <div class="event-time">{event.time.toLocaleTimeString()}</div>
                            <div class="event-row">
                                <div class="event-name">
                                    <strong>{event.name}</strong> 
                                    <span class="delta {event.delta > 0 ? 'pos' : 'neg'}">{event.delta > 0 ? '+' : ''}{event.delta}</span>
                                </div>
                                <div class="event-bucket" style="background: {BUCKETS[event.bucket].bg}; color: {BUCKETS[event.bucket].color}">
                                    {BUCKETS[event.bucket].label} (Score: {event.newScore})
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </section>

    <!-- PART 2: Explainer Data -->
    <section class="demo-section">
        <h2>Part 2: Engagement Score Mechanics</h2>
        <div class="grid-2-col">
            <!-- 55 vs 55 comparison -->
            <div class="panel">
                <h3>The "55 vs 55" Trajectory Test</h3>
                <p class="desc">Two visitors at score 55. Trajectory determines the Orchestrator's decision.</p>
                
                <div class="trajectory-card">
                    <div class="traj-user">
                        <strong>Visitor A</strong>
                        <span class="score-badge">55</span>
                        <div class="sparkline rising">↗ Rising Fast</div>
                    </div>
                    <div class="traj-action">Action: <span class="highlight">Priority Follow-up</span></div>
                </div>
                
                <div class="trajectory-card">
                    <div class="traj-user">
                        <strong>Visitor B</strong>
                        <span class="score-badge">55</span>
                        <div class="sparkline cooling">↘ Cooling (Idle 14d)</div>
                    </div>
                    <div class="traj-action">Action: <span class="highlight-alt">Re-engagement Email</span></div>
                </div>
            </div>

            <!-- Delta Table -->
            <div class="panel">
                <h3>Base Delta Table</h3>
                <table class="delta-table">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Base Delta</th>
                            <th>Context / Multiplier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each DELTA_TABLE as row (row.action)}
                        <tr>
                            <td>{row.action}</td>
                            <td class={row.base.startsWith('-') ? 'neg' : 'pos'}>{row.base}</td>
                            <td class="text-sm">{row.ctx}</td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
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
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
    }

    .demo-header h1 {
        margin: 0 0 8px;
        font-size: 28px;
        font-weight: 800;
        width: 100%;
    }

    .demo-header p {
        color: #4A5E52;
        margin: 0;
        flex: 1;
    }

    .btn-reset {
        padding: 8px 16px;
        background: white;
        border: 1px solid #E8E4DC;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
    }

    .status-bar {
        display: flex;
        background: white;
        border-radius: 12px;
        padding: 20px 30px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        margin-bottom: 40px;
        gap: 40px;
        transition: border-left-color 0.3s;
    }

    .status-col {
        display: flex;
        flex-direction: column;
    }

    .status-col .label {
        font-size: 12px;
        text-transform: uppercase;
        font-weight: 700;
        color: #8A9E92;
        letter-spacing: 0.05em;
        margin-bottom: 6px;
    }

    .status-col .value {
        font-size: 24px;
        font-weight: 800;
    }

    .value.decayed {
        color: #C24A1E;
    }

    .value.highlight {
        color: #1B5E3B;
        font-size: 18px;
        margin-top: 4px;
    }

    .demo-section {
        margin-bottom: 40px;
    }

    .demo-section h2 {
        font-size: 20px;
        margin-bottom: 20px;
        color: #0D3B27;
        border-bottom: 2px solid #EBF5EF;
        padding-bottom: 10px;
    }

    .grid-2-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
    }

    .panel {
        background: white;
        border: 1px solid #E8E4DC;
        border-radius: 12px;
        padding: 24px;
    }

    .panel h3 {
        margin: 0 0 8px;
        font-size: 16px;
    }

    .desc {
        color: #4A5E52;
        font-size: 14px;
        margin-bottom: 20px;
    }

    .action-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    .btn-action {
        background: #F8F6F1;
        border: 1px solid #E8E4DC;
        padding: 12px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-action:hover {
        background: #E8E4DC;
    }

    .btn-action.friction {
        color: #C24A1E;
        background: #FAEDE8;
        border-color: #fecaca;
    }
    
    .btn-action.emergency {
        color: #7f1d1d;
        background: #fef2f2;
        border-color: #fca5a5;
        grid-column: span 2;
    }

    .mt-4 { margin-top: 24px; }

    .decay-stats {
        margin-top: 12px;
        font-size: 13px;
        color: #8A9E92;
        font-family: monospace;
    }

    .event-log {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .event-card {
        background: #F8F6F1;
        padding: 12px 16px;
        border-radius: 8px;
        border-left: 3px solid #1B5E3B;
    }

    .event-time {
        font-size: 11px;
        color: #8A9E92;
        margin-bottom: 4px;
    }

    .event-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .delta.pos { color: #16a34a; font-weight: 700; margin-left: 8px; }
    .delta.neg { color: #dc2626; font-weight: 700; margin-left: 8px; }

    .event-bucket {
        font-size: 12px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
    }

    .trajectory-card {
        background: #F8F6F1;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .score-badge {
        background: #111714;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: bold;
        margin-left: 8px;
    }

    .sparkline {
        font-size: 12px;
        font-weight: 600;
        margin-top: 6px;
    }
    .sparkline.rising { color: #16a34a; }
    .sparkline.cooling { color: #dc2626; }

    .traj-action {
        font-size: 13px;
    }
    .traj-action .highlight { color: #1B5E3B; font-weight: bold; }
    .traj-action .highlight-alt { color: #B8862A; font-weight: bold; }

    .delta-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }

    .delta-table th {
        text-align: left;
        padding: 8px;
        border-bottom: 2px solid #E8E4DC;
        color: #8A9E92;
        font-weight: 600;
    }

    .delta-table td {
        padding: 10px 8px;
        border-bottom: 1px solid #E8E4DC;
    }

    .delta-table td.pos { color: #16a34a; font-weight: bold; }
    .delta-table td.neg { color: #dc2626; font-weight: bold; }
    .text-sm { font-size: 12px; color: #4A5E52; }

    .empty-state {
        padding: 20px;
        text-align: center;
        color: #8A9E92;
        background: #F8F6F1;
        border-radius: 8px;
    }
</style>
