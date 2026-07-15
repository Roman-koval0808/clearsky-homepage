<script>
  import SignalPopup from './SignalPopup.svelte';
  import { SIGNALS } from '../constants/signals.js';

  export let signal = {};
  export let isPending = false;

  let showPopup = false;

  $: signalDef = SIGNALS[signal.num] || null;
  $: isManual = signal.source === 'manual';
  $: isNeedsReview = signal.needsReview;
</script>

<div class="signal-item" class:needs={isNeedsReview} class:pending={isPending}>
  <div class="signal-top-row">
    <span class="signal-num">{signal.num}:</span>
    <span class="signal-name">{signal.name}</span>

    {#if signalDef}
      <button class="q-btn" on:click={() => showPopup = true} title="Signal definition and scoring criteria">?</button>
    {/if}

    <div class="pips">
      {#each [0, 1, 2, 3] as pip}
        <div class="pip"
          class:s0={signal.score === 0 && pip === 0}
          class:s1={signal.score === 1 && pip === 1}
          class:s2={signal.score === 2 && pip === 2}
          class:s3={signal.score === 3 && pip === 3}
          class:pending-pip={isPending}
        >{pip}</div>
      {/each}
    </div>

    <span class="source-tag"
      class:tag-claude={signal.source === 'claude'}
      class:tag-auto={signal.source === 'google_places' || signal.source === 'valueserp'}
      class:tag-manual={signal.source === 'manual' || signal.source === 'a2p'}
    >
      {signal.source === 'claude' ? 'Claude AI' : signal.source === 'google_places' ? 'Google Places' : signal.source === 'valueserp' ? 'ValueSERP' : signal.source === 'a2p' ? 'A2P' : 'manual'}
    </span>
  </div>

  <div class="signal-sub">
    {#if isNeedsReview}
      <span class="needs-label">Needs review</span> ·
    {/if}
    {signal.note}
  </div>
</div>

{#if showPopup && signalDef}
  <SignalPopup signal={signalDef} firmScore={signal.score} on:close={() => showPopup = false} />
{/if}

<style>
  .signal-item {
    padding: 10px 16px;
    border-bottom: 0.5px solid var(--color-border, #e0dfd8);
  }

  .signal-item:last-child {
    border-bottom: none;
  }

  .signal-item.needs {
    background: #FAEEDA;
  }

  .signal-item.pending {
    opacity: 0.5;
  }

  .signal-top-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    flex-wrap: nowrap;
  }

  .signal-num {
    font-size: 12px;
    color: var(--color-text-tertiary, #888);
    min-width: 24px;
    flex-shrink: 0;
  }

  .signal-name {
    font-size: 13px;
    color: var(--color-text-primary, #1a1a18);
    flex: 1;
  }

  .q-btn {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 0.5px solid #ccc;
    background: var(--color-bg-secondary, #f5f5f0);
    cursor: pointer;
    font-size: 10px;
    font-weight: 500;
    color: var(--color-text-tertiary, #888);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    line-height: 1;
    font-family: inherit;
  }

  .q-btn:hover {
    background: #EEEDFE;
    border-color: #4267AD;
    color: #4267AD;
  }

  .pips {
    display: flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
  }

  .pip {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    border: 0.5px solid var(--color-border, #e0dfd8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    color: var(--color-text-tertiary, #888);
    background: var(--color-bg-secondary, #f5f5f0);
  }

  .pip.s0 { background: #F09595; border-color: #A32D2D; color: #791F1F; }
  .pip.s1 { background: #FAC775; border-color: #854F0B; color: #633806; }
  .pip.s2 { background: #C0DD97; border-color: #3B6D11; color: #27500A; }
  .pip.s3 { background: #5DCAA5; border-color: #0F6E56; color: #085041; }
  .pip.pending-pip { opacity: 0.4; }

  .source-tag {
    font-size: 10px;
    padding: 1px 7px;
    border-radius: 10px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .tag-claude { background: #EEEDFE; color: #4267AD; border: 0.5px solid #4267AD; }
  .tag-auto { background: #E1F5EE; color: #0F6E56; border: 0.5px solid #0F6E56; }
  .tag-manual { background: #FAEEDA; color: #854F0B; border: 0.5px solid #854F0B; }

  .signal-sub {
    font-size: 11px;
    color: var(--color-text-tertiary, #888);
    padding-left: 28px;
    line-height: 1.5;
  }

  .needs-label {
    color: #854F0B;
    font-weight: 500;
  }
</style>
