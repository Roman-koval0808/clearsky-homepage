<script>
  import SignalRow from './SignalRow.svelte';

  let { 
    title = '', 
    signals = [], 
    groupScore = null, 
    groupMax = null, 
    cohort1Avg = null, 
    defaultOpen = false, 
    isSeparate = false, 
    isPending = false, 
    separateNote = '' 
  } = $props();

  let isOpen = $state(defaultOpen);

  let needsReviewCount = $derived(signals.filter(s => s.needsReview).length);
  let gap = $derived(cohort1Avg !== null && groupScore !== null ? Number((cohort1Avg - groupScore).toFixed(1)) : null);

</script>

<div class="group-block" class:warn={needsReviewCount > 0 && !isSeparate}>
  <div class="group-row" onclick={() => isOpen = !isOpen} role="button" tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && (isOpen = !isOpen)}>
    <div class="group-left">
      <span class="group-title">{title}</span>
      <span class="sig-badge" class:sig-badge-warn={needsReviewCount > 0 && !isSeparate}>
        {signals.length} signals{needsReviewCount > 0 && !isSeparate ? ` · ${needsReviewCount} need review` : ''}
      </span>
      {#if separateNote}
        <span class="sep-note">{separateNote}</span>
      {/if}
    </div>
    <div class="group-right">
      {#if groupScore !== null && groupMax !== null}
        <span class="group-stat"><strong>{groupScore}/{groupMax}</strong> this firm</span>
      {/if}
      {#if cohort1Avg !== null}
        <span class="group-stat">Cohort 1: {cohort1Avg}/{groupMax}</span>
      {/if}
      {#if gap !== null && gap > 0}
        <span class="gap-neg">−{gap} pts</span>
      {:else if gap !== null && gap <= 0}
        <span class="gap-ok">+{Math.abs(gap)} pts</span>
      {/if}
      {#if isPending}
        <span class="pending-label">Available after onboarding</span>
      {/if}
      <span class="chev" class:open={isOpen}>›</span>
    </div>
  </div>

  {#if isOpen}
    <div class="signal-list">
      {#if isPending}
        <div class="pending-notice">
          These 5 signals are scored from live A2P platform data. They become available once the client is onboarded and the A2P platform is connected. They inform the content roadmap only and are never compared to Cohort 1.
        </div>
      {/if}
      {#each signals as signal}
        <SignalRow {signal} {isPending} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .group-block {
    border: 0.5px solid var(--color-border, #e0dfd8);
    border-radius: 8px;
    margin-top: 12px;
    overflow: hidden;
  }

  .group-block.warn {
    border-color: #854F0B;
  }

  .group-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    cursor: pointer;
    background: var(--color-bg-primary, #fff);
    user-select: none;
  }

  .group-row:hover {
    background: var(--color-bg-secondary, #f5f5f0);
  }

  .group-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .group-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text-primary, #1a1a18);
  }

  .sig-badge {
    font-size: 11px;
    padding: 2px 10px;
    border-radius: 9999px;
    background: var(--color-bg-secondary, #f5f5f0);
    color: var(--color-text-tertiary, #888);
    border: 0.5px solid var(--color-border, #e0dfd8);
  }

  .sig-badge-warn {
    background: #FAEEDA;
    color: #854F0B;
    border-color: #854F0B;
  }

  .sep-note {
    font-size: 11px;
    color: var(--color-text-tertiary, #888);
    padding: 2px 10px;
    border-radius: 9999px;
    background: var(--color-bg-primary, #fff);
    border: 0.5px solid var(--color-border, #e0dfd8);
  }

  .group-right {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-shrink: 0;
  }

  .group-stat {
    font-size: 13px;
    color: var(--color-text-secondary, #555);
  }

  .group-stat strong {
    color: var(--color-text-primary, #1a1a18);
    font-weight: 500;
  }

  .gap-neg {
    font-size: 13px;
    color: #993C1D;
    font-weight: 500;
  }

  .gap-ok {
    font-size: 13px;
    color: #0F6E56;
    font-weight: 500;
  }

  .pending-label {
    font-size: 12px;
    color: var(--color-text-tertiary, #888);
  }

  .chev {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-tertiary, #888);
    transition: transform 0.15s;
    font-size: 16px;
    flex-shrink: 0;
  }

  .chev.open {
    transform: rotate(90deg);
  }

  .signal-list {
    border-top: 0.5px solid var(--color-border, #e0dfd8);
  }

  .pending-notice {
    padding: 14px 16px;
    font-size: 12px;
    color: var(--color-text-tertiary, #888);
    line-height: 1.6;
    background: var(--color-bg-secondary, #f5f5f0);
    border-bottom: 0.5px solid var(--color-border, #e0dfd8);
  }
</style>
