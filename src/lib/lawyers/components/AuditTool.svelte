<script>
  import { onMount } from 'svelte';
  import SignalGroupsView from './SignalGroupsView.svelte';
  import BreakdownView from './BreakdownView.svelte';
  import AuditTopBar from './AuditTopBar.svelte';

  let { auditData = null } = $props();
  let activeTab = $state('signals');
</script>

<div class="audit-tool">
  {#if auditData}
    <AuditTopBar firm={auditData.firm} summary={auditData.summary} />
    
    {#if auditData.summary && auditData.summary.warnings && auditData.summary.warnings.length > 0}
      <div class="warnings-banner">
        <div class="warning-header">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5V8M8 11H8.01M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z" stroke="#856404" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Partial Data Fetch
        </div>
        <ul>
          {#each auditData.summary.warnings as warning}
            <li>{warning}</li>
          {/each}
        </ul>
        <div class="warning-note">Some signals may be scored zero due to missing content.</div>
      </div>
    {/if}
    <div class="tab-bar">
      <button
        class="tab"
        class:active={activeTab === 'signals'}
        onclick={() => activeTab = 'signals'}
      >
        Signal groups
      </button>
      <button
        class="tab"
        class:active={activeTab === 'breakdown'}
        onclick={() => activeTab = 'breakdown'}
      >
        Breakdown
      </button>
    </div>

    {#if activeTab === 'signals'}
      <SignalGroupsView groups={auditData.groups} referralNetwork={auditData.referralNetwork} a2p={auditData.a2p} />
    {:else}
      <BreakdownView summary={auditData.summary} groups={auditData.groups} referralNetwork={auditData.referralNetwork} a2p={auditData.a2p} />
    {/if}
  {:else}
    <div class="empty-state">
      <p>No audit data loaded. Run an audit to see results.</p>
    </div>
  {/if}
</div>

<style>
  .audit-tool {
    background: var(--color-bg-primary, #ffffff);
    border: 0.5px solid var(--color-border, #e0dfd8);
    border-radius: 12px;
    overflow: hidden;
    font-family: var(--font-sans, sans-serif);
  }

  .tab-bar {
    display: flex;
    border-bottom: 0.5px solid var(--color-border, #e0dfd8);
    background: var(--color-bg-primary, #ffffff);
  }

  .tab {
    font-size: 14px;
    padding: 10px 4px;
    margin-right: 20px;
    margin-left: 20px;
    cursor: pointer;
    color: var(--color-text-tertiary, #888);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-family: inherit;
  }

  .tab:first-child {
    margin-left: 20px;
  }

  .tab.active {
    color: #4267AD;
    border-bottom-color: #4267AD;
    font-weight: 500;
  }

  .empty-state {
    padding: 40px;
    text-align: center;
    color: var(--color-text-tertiary, #888);
    font-size: 14px;
  }

  .warnings-banner {
    background: #FFF9E6;
    border-bottom: 0.5px solid #FFE69C;
    padding: 16px 20px;
  }

  .warning-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #856404;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .warnings-banner ul {
    margin: 0;
    padding: 0 0 0 24px;
    list-style-type: disc;
  }

  .warnings-banner li {
    font-size: 13px;
    color: #856404;
    margin-bottom: 4px;
    line-height: 1.4;
  }

  .warning-note {
    font-size: 11px;
    color: #9C7D1A;
    margin-top: 8px;
    font-style: italic;
  }

  @media print {
    .warnings-banner {
      display: none;
    }
  }
</style>
