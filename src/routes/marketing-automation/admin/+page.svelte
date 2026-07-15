<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';

    let { data } = $props();

    function formatDate(date: Date | string) {
        return new Date(date).toLocaleString(undefined, { 
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
        });
    }

    let chartCanvas: HTMLCanvasElement;
    let chart: Chart;

    onMount(() => {
        Chart.register(...registerables);
        
        const ctx = chartCanvas.getContext('2d');
        if (!ctx) return;

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.chartData.dates,
                datasets: [{
                    label: 'Website Events',
                    data: data.chartData.counts,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.3
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
                    x: { grid: { display: false }, border: { display: false } }
                }
            }
        });

        return () => chart.destroy();
    });
</script>

<svelte:head>
    <title>Overview — ClearSky Engine</title>
</svelte:head>

<div class="dashboard-overview">
    <div class="page-header">
        <h1>Dashboard Overview</h1>
        <p>Real-time view of your website traffic and lead generation engine.</p>
    </div>

    <!-- KPI Grid -->
    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="kpi-title">Total Visitors</div>
            <div class="kpi-val">{data.totalVisitors}</div>
        </div>
        <div class="kpi-card highlight">
            <div class="kpi-title">Known Leads</div>
            <div class="kpi-val">{data.knownLeads}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-title">Anonymous Visitors</div>
            <div class="kpi-val">{data.anonymousVisitors}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-title">Avg. Engagement Score</div>
            <div class="kpi-val">{data.averageScore}</div>
        </div>
    </div>

    <div class="grid-2-col">
        <!-- Chart -->
        <div class="section-block">
            <div class="section-header">
                <h2>Traffic & Engagement (Last 7 Days)</h2>
            </div>
            <div class="chart-container">
                <canvas bind:this={chartCanvas}></canvas>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="section-block">
            <div class="section-header">
                <h2>Recent Activity Feed</h2>
            </div>
            <div class="activity-list">
            {#each data.recentActivity as event}
                <div class="activity-item">
                    <div class="act-icon">
                        {#if event.event_type.includes('submit') || event.event_type.includes('promo')}
                            <span class="dot highlight"></span>
                        {:else}
                            <span class="dot"></span>
                        {/if}
                    </div>
                    <div class="act-details">
                        <div class="act-primary">
                            <strong>{event.customer_profile ? `${event.customer_profile.first_name || ''} ${event.customer_profile.last_name || ''}`.trim() || 'Known User' : 'Anonymous User'}</strong> 
                            performed 
                            <span class="act-badge">{event.event_type}</span>
                        </div>
                        <div class="act-secondary">
                            {#if event.page_url}<span>Page: {event.page_url}</span> &bull; {/if}
                            <span>Intent: {event.intent_bucket}</span> &bull; 
                            <span class="act-time">{formatDate(event.occurred_at)}</span>
                        </div>
                    </div>
                </div>
            {/each}
            {#if data.recentActivity.length === 0}
                <div class="empty-state">No activity recorded yet.</div>
            {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .dashboard-overview {
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

    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        margin-bottom: 32px;
    }

    .kpi-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
    }

    .kpi-card.highlight {
        border-color: #10b981;
        background: #f0fdf4;
    }

    .kpi-title {
        font-size: 14px;
        font-weight: 500;
        color: #64748b;
        margin-bottom: 8px;
    }

    .kpi-card.highlight .kpi-title {
        color: #047857;
    }

    .kpi-val {
        font-size: 32px;
        font-weight: 700;
        color: #0f172a;
    }

    .section-block {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
    }

    .section-header {
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8f0;
    }

    .section-header h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #111827;
    }

    .activity-list {
        padding: 12px 24px;
    }

    .activity-item {
        display: flex;
        gap: 16px;
        padding: 16px 0;
        border-bottom: 1px solid #f1f5f9;
    }

    .activity-item:last-child {
        border-bottom: none;
    }

    .act-icon {
        padding-top: 6px;
    }

    .dot {
        display: block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #cbd5e1;
    }

    .dot.highlight {
        background: #10b981;
        box-shadow: 0 0 0 4px #d1fae5;
    }

    .act-details {
        flex: 1;
    }

    .act-primary {
        font-size: 14px;
        color: #334155;
        margin-bottom: 4px;
    }

    .act-badge {
        display: inline-block;
        background: #f1f5f9;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        color: #475569;
        margin-left: 4px;
    }

    .act-secondary {
        font-size: 13px;
        color: #94a3b8;
    }

    .empty-state {
        padding: 32px;
        text-align: center;
        color: #94a3b8;
        font-size: 14px;
    }

    .grid-2-col {
        display: grid;
        grid-template-columns: 3fr 2fr;
        gap: 24px;
    }

    .chart-container {
        padding: 24px;
        height: 350px;
        position: relative;
    }
</style>
