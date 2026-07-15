<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';

    let { data } = $props();

    let doughnutCanvas: HTMLCanvasElement;
    let lineCanvas: HTMLCanvasElement;
    let doughnutChart: Chart;
    let lineChart: Chart;

    onMount(() => {
        Chart.register(...registerables);
        
        const dCtx = doughnutCanvas?.getContext('2d');
        const lCtx = lineCanvas?.getContext('2d');
        
        const promo = data.promos[0]; 
        if (dCtx && promo) {
            doughnutChart = new Chart(dCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Ignored', 'Captured'],
                    datasets: [{
                        data: [promo.ignored, promo.forms],
                        backgroundColor: ['#cbd5e1', '#10b981'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        if (lCtx && data.chartData) {
            lineChart = new Chart(lCtx, {
                type: 'line',
                data: {
                    labels: data.chartData.dates,
                    datasets: [
                        {
                            label: 'Impressions',
                            data: data.chartData.impressions,
                            borderColor: '#94a3b8',
                            backgroundColor: 'rgba(148, 163, 184, 0.1)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Captures',
                            data: data.chartData.captures,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
                        x: { grid: { display: false }, border: { display: false } }
                    }
                }
            });
        }

        return () => {
            doughnutChart?.destroy();
            lineChart?.destroy();
        };
    });
</script>

<svelte:head>
    <title>Promo Performance — ClearSky Engine</title>
</svelte:head>

<div class="performance-page">
    <div class="page-header">
        <h1>Promo Performance</h1>
        <p>Analyze how well your dynamic content rules are converting traffic.</p>
    </div>

    <div class="top-visual">
        <div class="chart-box">
            <canvas bind:this={doughnutCanvas}></canvas>
            <div class="chart-center">
                <span class="c-val">{data.promos[0]?.cvr || '0%'}</span>
                <span class="c-lbl">Conversion</span>
            </div>
        </div>
        
        <div class="line-chart-box">
            <canvas bind:this={lineCanvas}></canvas>
        </div>

        <div class="visual-stats">
            <div class="v-stat">
                <h3>Total Impressions</h3>
                <div class="v-val">{data.promos[0]?.shown || 0}</div>
            </div>
            <div class="v-stat highlight">
                <h3>Total Captures</h3>
                <div class="v-val">{data.promos[0]?.forms || 0}</div>
            </div>
        </div>
    </div>

    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Promo Rule</th>
                    <th class="text-right">Shown</th>
                    <th class="text-right">Clicked</th>
                    <th class="text-right">Forms Submitted</th>
                    <th class="text-right">Ignored</th>
                    <th class="text-right">Conversion Rate</th>
                </tr>
            </thead>
            <tbody>
                {#each data.promos as promo}
                    <tr>
                        <td><strong>{promo.name}</strong></td>
                        <td class="text-right">{promo.shown}</td>
                        <td class="text-right">{promo.clicked}</td>
                        <td class="text-right"><span class="highlight">{promo.forms}</span></td>
                        <td class="text-right text-muted">{promo.ignored}</td>
                        <td class="text-right">
                            <span class="cvr-badge">{promo.cvr}</span>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .performance-page {
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

    .top-visual {
        display: flex;
        gap: 32px;
        background: white;
        padding: 32px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
        margin-bottom: 32px;
        align-items: center;
    }

    .chart-box {
        position: relative;
        width: 200px;
        height: 200px;
        flex-shrink: 0;
    }

    .chart-center {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
    }

    .chart-center .c-val {
        font-size: 24px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1;
    }

    .chart-center .c-lbl {
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
        margin-top: 4px;
        letter-spacing: 0.05em;
    }

    .line-chart-box {
        flex: 2;
        height: 200px;
        position: relative;
        padding-left: 24px;
        border-left: 1px solid #e2e8f0;
    }

    .visual-stats {
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex: 1;
        padding-left: 24px;
        border-left: 1px solid #e2e8f0;
    }

    .v-stat {
        padding: 24px;
        background: #f8fafc;
        border-radius: 12px;
        flex: 1;
        border: 1px solid #e2e8f0;
    }

    .v-stat.highlight {
        background: #f0fdf4;
        border-color: #a7f3d0;
    }

    .v-stat h3 {
        margin: 0 0 8px;
        font-size: 13px;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 600;
    }

    .v-stat.highlight h3 { color: #047857; }

    .v-val {
        font-size: 36px;
        font-weight: 800;
        color: #0f172a;
    }

    .v-stat.highlight .v-val { color: #10b981; }

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
        font-size: 15px;
        color: #1e293b;
    }

    .text-right { text-align: right; }
    .text-muted { color: #94a3b8; }
    .highlight { font-weight: 700; color: #10b981; }

    .cvr-badge {
        display: inline-block;
        background: #f0fdf4;
        color: #047857;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 6px;
        border: 1px solid #a7f3d0;
    }
</style>
