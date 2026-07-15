<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';

    let { data } = $props();

    function formatDate(date: Date | string) {
        return new Date(date).toLocaleString(undefined, { 
            hour: 'numeric', minute: '2-digit', second: '2-digit' 
        });
    }

    function formatDay(date: Date | string) {
        return new Date(date).toLocaleDateString(undefined, { 
            month: 'short', day: 'numeric', year: 'numeric' 
        });
    }

    let intentCanvas: HTMLCanvasElement;
    let typeCanvas: HTMLCanvasElement;
    let intentChart: Chart;
    let typeChart: Chart;

    onMount(() => {
        Chart.register(...registerables);

        const iCtx = intentCanvas?.getContext('2d');
        const tCtx = typeCanvas?.getContext('2d');

        if (iCtx && data.analysis) {
            intentChart = new Chart(iCtx, {
                type: 'bar',
                data: {
                    labels: ['Active', 'Comparison', 'Research', 'Unclassified'],
                    datasets: [{
                        label: 'Events',
                        data: [
                            data.analysis.intentStats.active,
                            data.analysis.intentStats.comparison,
                            data.analysis.intentStats.research,
                            data.analysis.intentStats.unclassified
                        ],
                        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#cbd5e1'],
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
                        x: { grid: { display: false }, border: { display: false } }
                    }
                }
            });
        }

        if (tCtx && data.analysis) {
            typeChart = new Chart(tCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Passive (Views/Dwells)', 'Active (Forms/Clicks)'],
                    datasets: [{
                        data: [data.analysis.typeStats.passive, data.analysis.typeStats.active],
                        backgroundColor: ['#cbd5e1', '#10b981'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } }
                }
            });
        }

        return () => {
            intentChart?.destroy();
            typeChart?.destroy();
        };
    });
</script>

<svelte:head>
    <title>Event Log — ClearSky Engine</title>
</svelte:head>

<div class="events-page">
    <div class="page-header">
        <h1>Global Event Log</h1>
        <p>Raw telemetry feed of all user interactions on your website.</p>
    </div>

    <!-- Event Intelligence Dashboard -->
    <div class="analysis-grid">
        <div class="analysis-card">
            <div class="card-title">Traffic Intent Breakdown</div>
            <div class="chart-wrapper">
                <canvas bind:this={intentCanvas}></canvas>
            </div>
        </div>

        <div class="analysis-card">
            <div class="card-title">Event Type Split</div>
            <div class="chart-wrapper">
                <canvas bind:this={typeCanvas}></canvas>
            </div>
        </div>

        <div class="analysis-card">
            <div class="card-title">Top Performing Pages</div>
            <div class="leaderboard">
                {#each data.analysis?.topPages || [] as page}
                    <div class="lb-row">
                        <span class="lb-path" title={page.path}>{page.path.length > 25 ? page.path.substring(0,25) + '...' : page.path}</span>
                        <span class="lb-count">{page.count} events</span>
                    </div>
                {/each}
                {#if !data.analysis?.topPages?.length}
                    <div class="empty">No pages recorded yet.</div>
                {/if}
            </div>
        </div>
    </div>

    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Date</th>
                    <th>Visitor</th>
                    <th>Event</th>
                    <th>Page</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                {#each data.events as ev}
                    <tr>
                        <td class="time-cell">{formatDate(ev.occurred_at)}</td>
                        <td class="date-cell">{formatDay(ev.occurred_at)}</td>
                        <td>
                            <div class="visitor-col">
                                {#if ev.customer_profile}
                                    <a href="/marketing-automation/admin/visitors/{ev.customer_profile.id}" class="known">
                                        {ev.customer_profile.first_name || 'Known'} {ev.customer_profile.last_name || 'Lead'}
                                    </a>
                                {:else}
                                    <a href="/marketing-automation/admin/visitors/{ev.session_id}" class="anon">
                                        anon_{ev.session_id?.substring(0,6) || 'unknown'}
                                    </a>
                                {/if}
                            </div>
                        </td>
                        <td>
                            <span class="event-badge">{ev.event_type}</span>
                        </td>
                        <td class="page-cell">
                            {ev.page_url || 'N/A'}
                        </td>
                        <td class="details-cell">
                            {ev.payload?.label || 'No extra details'}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="pagination">
        <div class="page-info">
            Showing page <strong>{data.pagination.page}</strong> of <strong>{data.pagination.totalPages}</strong> 
            ({data.pagination.totalCount} total events)
        </div>
        <div class="page-controls">
            {#if data.pagination.page > 1}
                <a href="?page={data.pagination.page - 1}" class="page-btn">Previous</a>
            {:else}
                <span class="page-btn disabled">Previous</span>
            {/if}

            {#if data.pagination.page < data.pagination.totalPages}
                <a href="?page={data.pagination.page + 1}" class="page-btn">Next</a>
            {:else}
                <span class="page-btn disabled">Next</span>
            {/if}
        </div>
    </div>
</div>

<style>
    .events-page {
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
        padding: 12px 24px;
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
        font-size: 14px;
    }

    .time-cell {
        font-variant-numeric: tabular-nums;
        color: #334155;
        font-weight: 500;
    }

    .date-cell {
        color: #64748b;
        font-size: 13px;
    }

    .visitor-col a {
        text-decoration: none;
        font-weight: 600;
    }
    
    .visitor-col a.known {
        color: #10b981;
    }

    .visitor-col a.anon {
        color: #64748b;
    }

    .visitor-col a:hover {
        text-decoration: underline;
    }

    .event-badge {
        display: inline-block;
        background: #f1f5f9;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        color: #475569;
    }

    .page-cell {
        color: #3b82f6;
        font-family: monospace;
    }

    .details-cell {
        color: #64748b;
    }

    .analysis-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-bottom: 32px;
    }

    .analysis-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
        padding: 24px;
        display: flex;
        flex-direction: column;
    }

    .card-title {
        font-size: 14px;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 20px;
    }

    .chart-wrapper {
        position: relative;
        height: 200px;
        width: 100%;
        flex: 1;
    }

    .leaderboard {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .lb-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }

    .lb-path {
        font-family: monospace;
        font-size: 13px;
        color: #3b82f6;
        font-weight: 500;
    }

    .lb-count {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
    }

    .empty {
        text-align: center;
        color: #94a3b8;
        font-size: 14px;
        padding: 20px;
    }

    .pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 24px;
        padding: 16px 24px;
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .page-info {
        font-size: 14px;
        color: #64748b;
    }

    .page-info strong {
        color: #0f172a;
    }

    .page-controls {
        display: flex;
        gap: 8px;
    }

    .page-btn {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 6px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #334155;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s;
    }

    .page-btn:not(.disabled):hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
    }

    .page-btn.disabled {
        opacity: 0.5;
        pointer-events: none;
    }
</style>
