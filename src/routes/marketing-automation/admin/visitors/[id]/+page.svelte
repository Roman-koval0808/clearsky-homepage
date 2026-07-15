<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';

    let { data } = $props();

    function formatDate(date: Date | string) {
        return new Date(date).toLocaleString(undefined, { 
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
        });
    }

    const { analysis, profile, isAnonymous } = data;

    // Computed Intelligence
    let buyingIntent = 'Low';
    if (analysis.currentScore >= 80) buyingIntent = 'Very High';
    else if (analysis.currentScore >= 50 || (analysis.viewedService && analysis.viewedPricing)) buyingIntent = 'High';
    else if (analysis.viewedService) buyingIntent = 'Medium';

    let leadStatus = analysis.currentScore >= 80 ? 'Hot' : analysis.currentScore >= 40 ? 'Warm' : 'Cold';
    
    let intentDesc = "User is browsing but has not engaged deeply.";
    if (buyingIntent === 'High' && !analysis.formSubmitted) {
        intentDesc = "Visitor viewed a service page and pricing, showing intent to buy, but hasn't booked. They need a promotion or urgency offer.";
    } else if (analysis.formSubmitted) {
        intentDesc = "Visitor has successfully converted and submitted their information.";
    }

    let detectedInterest = "General Plumbing";
    const hotWater = data.events.some(e => e.page_url?.includes('hot-water'));
    if (hotWater) detectedInterest = "Hot Water Systems";
    
    let recommendedAction = "Monitor Behavior";
    let suggestedMsg = "";
    if (analysis.currentScore >= 80 && !isAnonymous) {
        recommendedAction = "Send SMS Offer";
        suggestedMsg = `Hi ${profile?.first_name || 'there'}, thanks for checking our pricing. We can offer 20% off if you book today.`;
    } else if (analysis.viewedPricing && isAnonymous) {
        recommendedAction = "Show 20% Promo Banner";
    }

    let ruleMatched = analysis.viewedService && analysis.viewedPricing;

    function formatJson(obj: any) {
        try {
            const copy = { ...obj };
            delete copy.timestamp;
            delete copy.session_id;
            delete copy.score;
            delete copy.bucket;
            delete copy.delta;
            return JSON.stringify(copy, null, 2);
        } catch { return String(obj); }
    }

    let chartCanvas: HTMLCanvasElement;
    let chart: Chart;

    onMount(() => {
        Chart.register(...registerables);
        const ctx = chartCanvas?.getContext('2d');
        if (!ctx) return;

        const labels = [];
        const scoreData = [];
        let runningScore = 0;

        // Start at zero
        labels.push('');
        scoreData.push(0);

        data.events.forEach(ev => {
            if (ev.engagement_score > 0 && ev.payload?.delta > 0) {
                runningScore += ev.payload.delta;
                labels.push(formatDate(ev.occurred_at));
                scoreData.push(runningScore);
            }
        });

        // Ensure we end with the final score if no events had delta
        if (scoreData.length === 1 && analysis.currentScore > 0) {
            labels.push('Current');
            scoreData.push(analysis.currentScore);
        }

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Engagement Score',
                    data: scoreData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    stepped: true,
                    fill: true,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { display: true, color: '#f1f5f9' }, border: { display: false } },
                    x: { display: false } // Hide X axis labels since it's just sequential
                }
            }
        });

        return () => chart?.destroy();
    });
</script>

<svelte:head>
    <title>Behavior Analysis — ClearSky Engine</title>
</svelte:head>

<div class="analysis-page">
    <div class="page-header">
        <div class="back-link">
            <a href="/marketing-automation/admin/visitors">&larr; Back to Visitors</a>
        </div>
        <h1>Behavior Analysis</h1>
        <p>Real-time intelligence and next-best-action recommendation.</p>
    </div>

    <!-- Top Summary Profile -->
    <div class="profile-card">
        <div class="profile-header">
            <div class="avatar {isAnonymous ? 'anon' : 'known'}">
                {#if isAnonymous}
                    ?
                {:else}
                    {profile?.first_name ? profile.first_name[0].toUpperCase() : 'U'}
                {/if}
            </div>
            <div class="profile-info">
                <h2>{isAnonymous ? 'Anonymous Visitor' : `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Unknown Name'}</h2>
                <div class="meta-row">
                    <span>{isAnonymous ? `ID: ${data.id.split('-')[0]}...` : (profile?.email || profile?.phone_number || 'No contact info')}</span>
                    <span class="divider">&bull;</span>
                    <span>Sessions: {analysis.sessionCount}</span>
                    <span class="divider">&bull;</span>
                    <span>Last seen: {formatDate(analysis.lastSeen)}</span>
                </div>
            </div>
            <div class="profile-score">
                <div class="score-label">Engagement Score</div>
                <div class="score-val {leadStatus.toLowerCase()}">{analysis.currentScore} <span class="max">/ 100</span></div>
            </div>
        </div>
    </div>

    <div class="grid-2-col">
        <div class="left-col">
            <!-- Analysis Result -->
            <div class="widget">
                <div class="widget-header">
                    <h3>Analysis Result</h3>
                </div>
                <div class="widget-body">
                    <div class="insight-row">
                        <div class="insight-label">Buying Intent</div>
                        <div class="insight-val highlight">{buyingIntent}</div>
                    </div>
                    <div class="insight-row">
                        <div class="insight-label">Reason</div>
                        <div class="insight-val">{intentDesc}</div>
                    </div>
                    <div class="insight-row">
                        <div class="insight-label">Detected Interest</div>
                        <div class="insight-val">{detectedInterest}</div>
                    </div>
                    
                    <div class="recommendation-box">
                        <div class="rec-title">Recommended Strategy</div>
                        <div class="rec-desc">
                            {#if buyingIntent === 'High' && !analysis.formSubmitted}
                                Show limited-time discount and capture phone/email.
                            {:else if buyingIntent === 'Very High' && !isAnonymous}
                                Trigger automated SMS/Email follow-up to close the lead.
                            {:else}
                                Continue monitoring page views to build behavioral profile.
                            {/if}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recommended Next Action -->
            <div class="widget highlight-widget">
                <div class="widget-header">
                    <h3>Recommended Next Action</h3>
                </div>
                <div class="widget-body">
                    <div class="action-title">{recommendedAction}</div>
                    {#if suggestedMsg}
                        <div class="action-reason">
                            <strong>Reason:</strong> The visitor has high buying intent and engagement score is above 80.
                        </div>
                        <div class="suggested-msg">
                            <strong>Suggested Message:</strong><br/>
                            "{suggestedMsg}"
                        </div>
                    {/if}
                    <div class="automation-status">
                        Automation Status: <span class="status-badge pending">Triggered but not sent yet</span>
                    </div>
                </div>
            </div>

            <!-- Rule Match Status -->
            <div class="widget">
                <div class="widget-header">
                    <h3>Rule Match Status</h3>
                </div>
                <div class="widget-body">
                    <div class="rule-title">Matched Rule: Service/Product Page + Pricing Page</div>
                    
                    <div class="condition-list">
                        <div class="condition {analysis.viewedService ? 'passed' : 'failed'}">
                            <span class="icon">{analysis.viewedService ? '✓' : '○'}</span>
                            User viewed product/service page — {analysis.viewedService ? 'Passed' : 'Not Met'}
                        </div>
                        <div class="condition {analysis.viewedPricing ? 'passed' : 'failed'}">
                            <span class="icon">{analysis.viewedPricing ? '✓' : '○'}</span>
                            User viewed pricing page — {analysis.viewedPricing ? 'Passed' : 'Not Met'}
                        </div>
                    </div>

                    <div class="rule-action mt-4">
                        <strong>Action:</strong> Show promo code on next page
                    </div>
                    <div class="rule-status">
                        <strong>Status:</strong> 
                        {#if ruleMatched && analysis.promoFired}
                            <span class="tag success">Already Fired</span>
                        {:else if ruleMatched}
                            <span class="tag warning">Ready to Fire</span>
                        {:else}
                            <span class="tag neutral">Conditions Not Met</span>
                        {/if}
                    </div>
                </div>
            </div>
            
            <!-- Dynamic Content Decision -->
            {#if analysis.promoFired || ruleMatched}
            <div class="widget">
                <div class="widget-header">
                    <h3>Dynamic Content Decision</h3>
                </div>
                <div class="widget-body">
                    <table class="simple-table">
                        <tbody>
                            <tr><td>Content Type</td><td>Promo Banner</td></tr>
                            <tr><td>Promo</td><td>20% Discount</td></tr>
                            <tr><td>Message</td><td>Limited time offer — get 20% off today</td></tr>
                            <tr><td>Placement</td><td>Right-side banner</td></tr>
                            <tr><td>Goal</td><td>Capture email or phone number</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            {/if}
        </div>

        <div class="right-col">
            <!-- Score Progression -->
            <div class="widget">
                <div class="widget-header">
                    <h3>Score Progression</h3>
                </div>
                <div class="widget-body">
                    <div style="height: 180px; position: relative;">
                        <canvas bind:this={chartCanvas}></canvas>
                    </div>
                </div>
            </div>

            <!-- Behavior Facts -->
            <div class="widget">
                <div class="widget-header">
                    <h3>Behavior Facts</h3>
                </div>
                <div class="widget-body p-0">
                    <ul class="fact-list">
                        <li><span>Viewed Service Page</span> <strong>{analysis.viewedService ? 'Yes' : 'No'}</strong></li>
                        <li><span>Viewed Pricing Page</span> <strong>{analysis.viewedPricing ? 'Yes' : 'No'}</strong></li>
                        <li><span>Returned Visitor</span> <strong>{analysis.returnedVisitor ? 'Yes' : 'No'}</strong></li>
                        <li><span>Promo Seen</span> <strong>{analysis.promoFired ? 'Yes' : 'No'}</strong></li>
                        <li><span>Promo Clicked</span> <strong>{analysis.promoClicked ? 'Yes' : 'No'}</strong></li>
                        <li><span>Submitted Form</span> <strong>{analysis.formSubmitted ? 'Yes' : 'No'}</strong></li>
                    </ul>
                </div>
            </div>

            <!-- Score Breakdown -->
            <div class="widget">
                <div class="widget-header">
                    <h3>Score Breakdown ({data.analysis.currentScore} pts)</h3>
                </div>
                <div class="widget-body scrollable-body">
                    <div class="ledger">
                        {#each data.events as ev}
                            {#if ev.engagement_score > 0 && ev.payload?.delta > 0}
                                <div class="ledger-item">
                                    <span class="ledger-desc">{ev.payload.label || ev.event_type}</span>
                                    <span class="ledger-score">+{ev.payload.delta}</span>
                                </div>
                            {/if}
                        {/each}
                    </div>
                    <div class="ledger-total">
                        <span>Total Engagement Score</span>
                        <strong>{analysis.currentScore}</strong>
                    </div>
                </div>
            </div>

            <!-- Timeline -->
            <div class="widget">
                <div class="widget-header">
                    <h3>Activity Timeline</h3>
                </div>
                <div class="widget-body scrollable-body">
                    <div class="timeline">
                        {#each data.events as event}
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <div class="time">{formatDate(event.occurred_at)}</div>
                                    <div class="event-title">
                                        {event.payload?.label || event.event_type}
                                    </div>
                                    {#if Object.keys(JSON.parse(formatJson(event.payload) || '{}')).length > 0}
                                        <div class="event-payload">
                                            {formatJson(event.payload)}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .analysis-page {
        max-width: 1200px;
        margin: 0 auto;
    }

    .back-link {
        margin-bottom: 12px;
    }
    
    .back-link a {
        color: #64748b;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
    }
    .back-link a:hover { color: #0f172a; }

    .page-header {
        margin-bottom: 32px;
    }

    .page-header h1 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 700;
        color: #111827;
    }

    .page-header p {
        margin: 0;
        color: #64748b;
    }

    .profile-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
        margin-bottom: 24px;
    }

    .profile-header {
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 700;
    }

    .avatar.known { background: #10b981; color: white; }
    .avatar.anon { background: #cbd5e1; color: white; }

    .profile-info { flex: 1; }
    .profile-info h2 { margin: 0 0 8px; font-size: 20px; color: #0f172a; }
    .meta-row { font-size: 14px; color: #64748b; display: flex; gap: 8px; align-items: center; }
    .divider { color: #cbd5e1; }

    .profile-score { text-align: right; }
    .score-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    .score-val { font-size: 36px; font-weight: 800; }
    .score-val .max { font-size: 16px; color: #94a3b8; font-weight: 600; }
    .score-val.hot { color: #ef4444; }
    .score-val.warm { color: #f59e0b; }
    .score-val.cold { color: #0f172a; }

    .grid-2-col {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;
    }

    .widget {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
        margin-bottom: 24px;
        overflow: hidden;
    }

    .widget.highlight-widget {
        border-color: #3b82f6;
        box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
    }

    .widget.highlight-widget .widget-header {
        background: #eff6ff;
        border-bottom-color: #bfdbfe;
    }
    .widget.highlight-widget .widget-header h3 {
        color: #1e3a8a;
    }

    .widget-header {
        padding: 16px 20px;
        border-bottom: 1px solid #e2e8f0;
        background: #f8fafc;
    }

    .widget-header h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: #1e293b;
    }

    .widget-body {
        padding: 24px;
    }

    .scrollable-body {
        max-height: 400px;
        overflow-y: auto;
        padding-right: 8px;
    }

    /* Custom scrollbar for webkit */
    .scrollable-body::-webkit-scrollbar {
        width: 6px;
    }
    .scrollable-body::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
    }
    .scrollable-body::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }
    .scrollable-body::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }

    .widget-body.p-0 {
        padding: 0;
    }

    .insight-row {
        margin-bottom: 16px;
    }

    .insight-label {
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        margin-bottom: 4px;
    }

    .insight-val {
        font-size: 15px;
        color: #0f172a;
    }

    .insight-val.highlight {
        font-weight: 700;
        color: #10b981;
    }

    .recommendation-box {
        margin-top: 24px;
        background: #f0fdf4;
        border: 1px solid #a7f3d0;
        padding: 16px;
        border-radius: 8px;
    }

    .rec-title {
        font-size: 13px;
        font-weight: 700;
        color: #047857;
        text-transform: uppercase;
        margin-bottom: 8px;
    }

    .rec-desc {
        font-size: 15px;
        color: #065f46;
    }

    .condition-list {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .condition {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #475569;
    }

    .condition.passed .icon { color: #10b981; font-weight: bold; }
    .condition.failed .icon { color: #94a3b8; }

    .mt-4 { margin-top: 16px; }

    .tag {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
    }
    .tag.success { background: #d1fae5; color: #047857; }
    .tag.warning { background: #fef3c7; color: #b45309; }
    .tag.neutral { background: #f1f5f9; color: #475569; }

    .simple-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }

    .simple-table td {
        padding: 8px 0;
        border-bottom: 1px solid #f1f5f9;
    }
    .simple-table tr:last-child td { border-bottom: none; }
    .simple-table td:first-child { color: #64748b; font-weight: 500; width: 40%; }
    .simple-table td:last-child { color: #0f172a; font-weight: 600; }

    .action-title {
        font-size: 18px;
        font-weight: 700;
        color: #1e3a8a;
        margin-bottom: 12px;
    }

    .action-reason, .suggested-msg {
        font-size: 14px;
        color: #334155;
        margin-bottom: 12px;
    }

    .suggested-msg {
        background: #f8fafc;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        font-style: italic;
    }

    .automation-status {
        margin-top: 16px;
        font-size: 13px;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .status-badge.pending {
        background: #fef3c7;
        color: #b45309;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;
    }

    .fact-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .fact-list li {
        display: flex;
        justify-content: space-between;
        padding: 12px 20px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 14px;
    }
    .fact-list li:last-child { border-bottom: none; }
    .fact-list li span { color: #64748b; }
    .fact-list li strong { color: #0f172a; }

    .ledger {
        margin-bottom: 16px;
    }

    .ledger-item {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        padding: 6px 0;
        color: #475569;
    }

    .ledger-score {
        color: #10b981;
        font-weight: 600;
    }

    .ledger-total {
        display: flex;
        justify-content: space-between;
        border-top: 2px solid #e2e8f0;
        padding-top: 12px;
        font-size: 15px;
        color: #0f172a;
        font-weight: 700;
    }

    .timeline {
        display: flex;
        flex-direction: column;
        gap: 16px;
        border-left: 2px solid #e2e8f0;
        padding-left: 20px;
        margin-left: 8px;
    }

    .timeline-item {
        position: relative;
    }

    .timeline-dot {
        position: absolute;
        left: -27px;
        top: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #3b82f6;
        border: 2px solid white;
    }

    .timeline-content .time {
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 2px;
    }

    .event-title {
        font-size: 14px;
        font-weight: 600;
        color: #0f172a;
    }

    .event-payload {
        margin-top: 6px;
        font-family: monospace;
        font-size: 11px;
        color: #64748b;
        background: #f8fafc;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
        white-space: pre-wrap;
        word-break: break-all;
    }
</style>
