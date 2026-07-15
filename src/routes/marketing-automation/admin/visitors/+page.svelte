<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';

    let { data } = $props();

    Chart.register(...registerables);

    onMount(() => {
        const tempCtx = document.getElementById('tempChart') as HTMLCanvasElement;
        if (tempCtx) {
            new Chart(tempCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Hot', 'Warm', 'Cold'],
                    datasets: [{
                        data: [data.stats.leadStatus.hot, data.stats.leadStatus.warm, data.stats.leadStatus.cold],
                        backgroundColor: ['#ef4444', '#f59e0b', '#64748b'],
                        borderWidth: 0
                    }]
                },
                options: { cutout: '70%', plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }
            });
        }

        const intentCtx = document.getElementById('intentChart') as HTMLCanvasElement;
        if (intentCtx) {
            new Chart(intentCtx, {
                type: 'bar',
                data: {
                    labels: ['Emergency', 'Active', 'Comparison', 'Research'],
                    datasets: [{
                        label: 'Profiles',
                        data: [data.stats.buckets.emergency, data.stats.buckets.active, data.stats.buckets.comparison, data.stats.buckets.research],
                        backgroundColor: ['#dc2626', '#f97316', '#3b82f6', '#94a3b8'],
                        borderRadius: 4
                    }]
                },
                options: { 
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false
                }
            });
        }
    });

    function formatDate(date: Date | string) {
        return new Date(date).toLocaleString(undefined, { 
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
        });
    }

    function getLeadStatus(score: number) {
        if (score >= 80) return { label: 'Hot', class: 'hot' };
        if (score >= 40) return { label: 'Warm', class: 'warm' };
        return { label: 'Cold', class: 'cold' };
    }

    function getNextAction(score: number, isAnonymous: boolean) {
        if (score >= 80 && !isAnonymous) return 'Send SMS Offer';
        if (score >= 80 && isAnonymous) return 'Show Aggressive Promo';
        if (score >= 40) return 'Show Promo Banner';
        return 'Monitor Behavior';
    }
</script>

<svelte:head>
    <title>Visitors & Leads — ClearSky Engine</title>
</svelte:head>

<div class="visitors-page">
    <div class="page-header">
        <h1>Visitors & Leads</h1>
        <p>Complete directory of all identified leads and anonymous sessions.</p>
    </div>

    <div class="dashboard-grid">
        <div class="kpi-cards">
            <div class="kpi-card">
                <h3>Total Visitors</h3>
                <div class="kpi-val">{data.stats.totalVisitors}</div>
            </div>
            <div class="kpi-card">
                <h3>Known Leads</h3>
                <div class="kpi-val">{data.stats.knownLeads}</div>
            </div>
            <div class="kpi-card">
                <h3>Anonymous</h3>
                <div class="kpi-val">{data.stats.anonSessions}</div>
            </div>
            <div class="kpi-card">
                <h3>Avg Score</h3>
                <div class="kpi-val">{data.stats.avgScore}</div>
            </div>
        </div>

        <div class="charts-row">
            <div class="chart-card">
                <h3>Lead Temperature</h3>
                <div class="canvas-wrap">
                    <canvas id="tempChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h3>Intent Distribution</h3>
                <div class="canvas-wrap">
                    <canvas id="intentChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Identity</th>
                    <th>Sessions</th>
                    <th>Score</th>
                    <th>Lead Status</th>
                    <th>Next Action</th>
                    <th>Last Seen</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each data.visitors as v (v.id)}
                    {@const status = getLeadStatus(v.scoreLive)}
                    <tr>
                        <td>
                            <div class="identity-cell">
                                <div class="avatar {v.isAnonymous ? 'anon' : 'known'}">
                                    {#if v.isAnonymous}
                                        ?
                                    {:else}
                                        {v.name ? v.name[0].toUpperCase() : (v.email ? v.email[0].toUpperCase() : 'U')}
                                    {/if}
                                </div>
                                <div>
                                    <div class="primary-text">
                                        {#if v.isAnonymous}
                                            Anonymous Visitor
                                        {:else}
                                            {v.name || 'Unknown Name'}
                                        {/if}
                                    </div>
                                    <div class="secondary-text">
                                        {#if v.isAnonymous}
                                            ID: {v.id.split('-')[0]}...
                                        {:else}
                                            {v.email || v.phone || 'No contact info'}
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>{v.sessionCount}</td>
                        <td>
                            <div class="score-wrap">
                                <div>
                                    <span class="score-live">{v.scoreLive}</span>
                                    <span class="score-raw">/ {v.scoreRaw} raw</span>
                                </div>
                                <div class="badge-row">
                                    {#if v.inGrace}
                                        <span class="badge grace">● grace</span>
                                    {:else if v.decayPct > 0}
                                        <span class="badge decay">↓ {v.decayPct}% decayed</span>
                                    {/if}
                                    {#if v.wasDemoted}
                                        <span class="badge demoted">▼ demoted</span>
                                    {/if}
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="status-badge {status.class}">{status.label}</span>
                        </td>
                        <td class="action-cell">
                            {getNextAction(v.scoreLive, v.isAnonymous)}
                        </td>
                        <td class="time-cell">{formatDate(v.lastSeen)}</td>
                        <td>
                            <a href="/marketing-automation/admin/visitors/{v.id}" class="view-btn">Analyze</a>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .visitors-page {
        max-width: 1200px;
        margin: 0 auto;
    }

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

    .dashboard-grid {
        margin-bottom: 32px;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .kpi-cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
    }

    .kpi-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
    }

    .kpi-card h3 {
        margin: 0 0 8px;
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .kpi-val {
        font-size: 32px;
        font-weight: 700;
        color: #0f172a;
    }

    .charts-row {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 20px;
    }

    .chart-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
    }

    .chart-card h3 {
        margin: 0 0 20px;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
    }

    .canvas-wrap {
        position: relative;
        height: 250px;
        width: 100%;
    }

    .table-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
        overflow-x: auto;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    .data-table th {
        padding: 16px 24px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .data-table td {
        padding: 16px 24px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
    }

    .identity-cell {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 16px;
        flex-shrink: 0;
    }

    .avatar.known {
        background: #10b981;
        color: white;
    }

    .avatar.anon {
        background: #cbd5e1;
        color: white;
    }

    .primary-text {
        font-weight: 600;
        color: #1e293b;
        font-size: 14px;
    }

    .secondary-text {
        font-size: 13px;
        color: #64748b;
        margin-top: 2px;
    }

    .score-wrap {
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: flex-start;
    }

    .score-live {
        font-weight: 700;
        font-size: 16px;
        color: #0f172a;
    }

    .score-raw {
        font-size: 12px;
        color: #94a3b8;
    }

    .badge-row {
        display: flex;
        gap: 6px;
    }

    .badge {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .badge.grace { background: #e0f2fe; color: #0369a1; }
    .badge.decay { background: #fef9c3; color: #a16207; }
    .badge.demoted { background: #fee2e2; color: #b91c1c; }

    .status-badge {
        font-size: 13px;
        font-weight: 600;
    }

    .status-badge.hot { color: #ef4444; }
    .status-badge.warm { color: #f59e0b; }
    .status-badge.cold { color: #64748b; }

    .action-cell {
        font-size: 14px;
        color: #334155;
        font-weight: 500;
    }

    .time-cell {
        font-size: 13px;
        color: #64748b;
    }

    .view-btn {
        display: inline-block;
        padding: 6px 12px;
        background: #f1f5f9;
        color: #0f172a;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        border-radius: 6px;
        transition: background 0.2s;
    }

    .view-btn:hover {
        background: #e2e8f0;
    }
</style>
