<script>
  import { onMount } from 'svelte';
  import SignalRow from './SignalRow.svelte';

  let { summary = {}, groups = {}, referralNetwork = null, a2p = null } = $props();

  let canvas = $state();


  // Calculate gap per group for pie chart
  const GROUP_ORDER = [
    { id: 'website', label: 'Website', color: '#4267AD' },
    { id: 'contact', label: 'Contact friction', color: '#7F77DD' },
    { id: 'directories', label: 'Directories', color: '#D85A30' },
    { id: 'sov', label: 'Share of voice', color: '#EF9F27' },
    { id: 'linkedin', label: 'LinkedIn', color: '#1D9E75' },
    { id: 'instagram', label: 'Instagram', color: '#5DCAA5' },
    { id: 'video', label: 'Video', color: '#378ADD' },
    { id: 'citations', label: 'Citations', color: '#85B7EB' },
    { id: 'community', label: 'Community', color: '#B4B2A9' },
    { id: 'facebook', label: 'Facebook', color: '#D3D1C7' },
  ];

  let groupGaps = $derived(GROUP_ORDER.map(g => {
    const group = groups[g.id];
    if (!group) return { ...g, gap: 0 };
    return { ...g, gap: Math.max(0, Number((group.cohort1Avg - group.groupScore).toFixed(1))) };
  }).filter(g => g.gap > 0).sort((a, b) => b.gap - a.gap));

  let totalGap = $derived(Number(groupGaps.reduce((sum, g) => sum + g.gap, 0).toFixed(1)));

  onMount(() => {
    if (canvas && groupGaps.length > 0) drawPie();
  });

  $effect(() => {
    if (canvas && groupGaps.length > 0) {
      drawPie();
    }
  });

  function drawPie() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 130, cy = 130, r = 110, inner = 60;
    let angle = -Math.PI / 2;

    ctx.clearRect(0, 0, 260, 260);

    groupGaps.forEach(g => {
      const slice = (g.gap / totalGap) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = g.color;
      ctx.fill();
      angle += slice;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, 2 * Math.PI);
    ctx.fillStyle = '#f5f5f0';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#1a1a18';
    ctx.font = '500 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(summary.totalGapPts || totalGap), cx, cy - 8);
    ctx.font = '400 11px sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('pt gap', cx, cy + 10);
  }
</script>

<div class="breakdown-view">

  <!-- Metric cards -->
  <div class="metric-row">
    <div class="metric">
      <div class="metric-label">Content gap score</div>
      <div class="metric-value" style="color: #4267AD">{summary.contentGapScore}%</div>
      <div class="metric-sub">{summary.contentGapPts} / {summary.contentGapMax} pts</div>
    </div>
    <div class="metric">
      <div class="metric-label">Cohort 1 benchmark</div>
      <div class="metric-value">{summary.cohort1AvgPct}%</div>
      <div class="metric-sub">{summary.cohort1AvgPts} / {summary.contentGapMax} pts avg</div>
    </div>
    <div class="metric">
      <div class="metric-label">Referral network score</div>
      <div class="metric-value" style="color: #D85A30">{summary.referralNetworkScore}%</div>
      <div class="metric-sub">{summary.referralNetworkPts} / {summary.referralNetworkMax} pts</div>
    </div>
    <div class="metric">
      <div class="metric-label">Signals needing review</div>
      <div class="metric-value" style="color: #854F0B">{summary.signalsNeedingReview}</div>
      <div class="metric-sub">Manual input required</div>
    </div>
  </div>

  <!-- Gap bar -->
  <div class="gap-wrap">
    <div class="gap-header">
      <span class="gap-title">Content gap % vs Cohort 1 benchmark</span>
      <span class="gap-number">{summary.totalGapPts} pt gap</span>
    </div>
    <div class="bar-track">
      <div class="bar-fill" style="width: {summary.contentGapScore}%"></div>
    </div>
    <div class="bar-labels">
      <span>This firm {summary.contentGapScore}% · {summary.contentGapPts} pts</span>
      <span>Cohort 1 avg {summary.cohort1AvgPct}% · {summary.cohort1AvgPts} pts</span>
    </div>
  </div>

  <!-- Pie chart -->
  <div class="chart-section">
    <div class="chart-wrap">
      <div class="chart-title">{summary.totalGapPts}-point gap by signal group</div>
      <div class="chart-sub">Where this firm is losing ground against Cohort 1</div>
      <canvas bind:this={canvas} width="260" height="260" style="display: block; margin: 0 auto 16px;"></canvas>
    </div>
    <div class="chart-wrap">
      <div class="chart-title">Gap breakdown</div>
      <div class="chart-sub">Points behind Cohort 1 per group</div>
      <div class="legend">
        {#each groupGaps as g}
          <div class="legend-item">
            <div class="legend-dot" style="background: {g.color}"></div>
            <span class="legend-name">{g.label}</span>
            <span class="legend-pts">{g.gap} pts</span>
            <span class="legend-pct">{Math.round((g.gap / totalGap) * 100)}%</span>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Referral network -->
  {#if referralNetwork}
    <div class="layer-block">
      <div class="layer-header">
        <div class="layer-header-left">
          <span class="layer-title">Referral network</span>
          <span class="layer-note">Reported separately · not compared to Cohort 1</span>
        </div>
        <div class="layer-header-right">
          <span class="layer-score"><strong>{referralNetwork.groupScore} / {referralNetwork.groupMax}</strong> pts</span>
          <span class="layer-pct">{Math.round((referralNetwork.groupScore / referralNetwork.groupMax) * 100)}%</span>
        </div>
      </div>
      {#each referralNetwork.signals as signal}
        <SignalRow {signal} />
      {/each}
      <div class="layer-total">
        <span class="layer-total-label">Referral network total</span>
        <div class="layer-total-right">
          <div class="mini-bar-track">
            <div class="mini-bar-fill" style="width: {Math.round((referralNetwork.groupScore / referralNetwork.groupMax) * 100)}%; background: #D85A30;"></div>
          </div>
          <span class="layer-total-score">{referralNetwork.groupScore} / {referralNetwork.groupMax} pts</span>
          <span class="layer-total-pct">{Math.round((referralNetwork.groupScore / referralNetwork.groupMax) * 100)}%</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- A2P intelligence -->
  {#if a2p}
    <div class="layer-block">
      <div class="layer-header">
        <div class="layer-header-left">
          <span class="layer-title">A2P intelligence</span>
          <span class="layer-note">Licensed clients only · not compared to Cohort 1</span>
        </div>
        <div class="layer-header-right">
          <span class="layer-pending">Available after onboarding</span>
        </div>
      </div>
      <div class="a2p-pending-notice">
        These 5 signals are scored from live A2P platform data and become available once the client is onboarded and the A2P platform is connected. They inform the content roadmap only and are never compared to Cohort 1.
      </div>
      {#each a2p.signals as signal}
        <SignalRow {signal} isPending={true} />
      {/each}
    </div>
  {/if}

</div>

<style>
  .breakdown-view {
    padding: 20px;
  }

  .metric-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 20px;
  }

  .metric {
    background: #f5f5f0;
    border-radius: 8px;
    padding: 12px 14px;
  }

  .metric-label {
    font-size: 11px;
    color: #888;
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .metric-value {
    font-size: 26px;
    font-weight: 500;
    color: #1a1a18;
  }

  .metric-sub {
    font-size: 11px;
    color: #888;
    margin-top: 3px;
  }

  .gap-wrap {
    background: #f5f5f0;
    border-radius: 8px;
    padding: 16px 18px;
    margin-bottom: 20px;
  }

  .gap-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 12px;
  }

  .gap-title {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a18;
  }

  .gap-number {
    font-size: 22px;
    font-weight: 500;
    color: #4267AD;
  }

  .bar-track {
    height: 8px;
    background: #fff;
    border-radius: 4px;
    border: 0.5px solid #e0dfd8;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .bar-fill {
    height: 100%;
    border-radius: 4px;
    background: #4267AD;
    transition: width 0.4s;
  }

  .bar-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #888;
  }

  .chart-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
    margin-bottom: 20px;
  }

  .chart-wrap {
    background: #f5f5f0;
    border-radius: 8px;
    padding: 16px 18px;
  }

  .chart-title {
    font-size: 13px;
    font-weight: 500;
    color: #1a1a18;
    margin-bottom: 4px;
  }

  .chart-sub {
    font-size: 11px;
    color: #888;
    margin-bottom: 14px;
  }

  .legend {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-name {
    font-size: 12px;
    color: #1a1a18;
    flex: 1;
  }

  .legend-pts {
    font-size: 12px;
    font-weight: 500;
    color: #1a1a18;
  }

  .legend-pct {
    font-size: 11px;
    color: #888;
    min-width: 32px;
    text-align: right;
  }

  .layer-block {
    border: 0.5px solid #e0dfd8;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 12px;
  }

  .layer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f5f5f0;
    border-bottom: 0.5px solid #e0dfd8;
  }

  .layer-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .layer-title {
    font-size: 15px;
    font-weight: 500;
    color: #1a1a18;
  }

  .layer-note {
    font-size: 11px;
    color: #888;
    padding: 2px 10px;
    border-radius: 9999px;
    background: #fff;
    border: 0.5px solid #e0dfd8;
  }

  .layer-header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .layer-score {
    font-size: 13px;
    color: #555;
  }

  .layer-pct {
    font-size: 13px;
    font-weight: 500;
    color: #D85A30;
  }

  .layer-pending {
    font-size: 12px;
    color: #888;
  }

  .layer-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #f5f5f0;
    border-top: 0.5px solid #e0dfd8;
  }

  .layer-total-label {
    font-size: 12px;
    color: #888;
  }

  .layer-total-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mini-bar-track {
    width: 120px;
    height: 6px;
    background: #fff;
    border-radius: 4px;
    border: 0.5px solid #e0dfd8;
    overflow: hidden;
  }

  .mini-bar-fill {
    height: 100%;
    border-radius: 4px;
  }

  .layer-total-score {
    font-size: 13px;
    font-weight: 500;
    color: #1a1a18;
  }

  .layer-total-pct {
    font-size: 13px;
    font-weight: 500;
    color: #D85A30;
  }

  .a2p-pending-notice {
    padding: 14px 16px;
    font-size: 12px;
    color: #888;
    line-height: 1.6;
    background: #f5f5f0;
    border-bottom: 0.5px solid #e0dfd8;
  }
</style>
