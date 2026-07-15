<script>
  import { createEventDispatcher } from 'svelte';
  import { COHORT1_AVERAGES } from '../constants/signals.js';

  export let signal = {};
  export let firmScore = -1;

  const dispatch = createEventDispatcher();

  $: cohort1Avg = COHORT1_AVERAGES[signal.num] || 0;
  $: cohortLevel = Math.round(cohort1Avg);
  $: firmPct = firmScore >= 0 ? (firmScore / 3) * 100 : 0;
  $: cohortPct = (cohort1Avg / 3) * 100;
  $: pointsToAdd = firmScore >= 0 ? 3 - firmScore : null;
  $: totalGap = 34; // Pass in from parent in production

  function close() {
    dispatch('close');
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) close();
  }

  const scoreChipClass = (score) => ['s0', 's1', 's2', 's3'][score] || 's0';
</script>

<div class="overlay" on:click={handleOverlayClick} role="dialog" aria-modal="true">
  <div class="popup">
    <div class="popup-header">
      <div class="popup-title">{signal.name}</div>
      <button class="popup-close" on:click={close}>✕</button>
    </div>

    <div class="popup-section">
      <div class="popup-section-label">What it is</div>
      <div class="popup-section-text">{signal.what}</div>
    </div>

    <div class="popup-section">
      <div class="popup-section-label">Why it was chosen</div>
      <div class="popup-section-text">{signal.why}</div>
    </div>

    <div class="popup-divider"></div>

    <!-- Score comparison bars -->
    <div class="cohort-bar-wrap">
      <div class="cohort-bar-header">Score comparison</div>
      <div class="bar-row">
        <span class="bar-row-label">This firm</span>
        <div class="bar-track">
          <div class="bar-fill bar-fill-firm" style="width: {firmPct}%"></div>
        </div>
        <span class="bar-score bar-score-firm">{firmScore >= 0 ? firmScore : '—'}</span>
      </div>
      <div class="bar-row">
        <span class="bar-row-label">Cohort 1 avg</span>
        <div class="bar-track">
          <div class="bar-fill bar-fill-cohort" style="width: {cohortPct}%"></div>
        </div>
        <span class="bar-score bar-score-cohort">{cohort1Avg}</span>
      </div>
    </div>

    <!-- Scoring criteria -->
    <div class="scoring-label">Scoring criteria</div>
    <div class="scoring-rows">
      {#each signal.scoring as row}
        <div class="score-chip {scoreChipClass(row.score)}" class:cohort-marker={row.score === cohortLevel}>{row.score}</div>
        <div class="score-desc" class:cohort-row={row.score === cohortLevel}>
          {row.text}
          {#if row.score === cohortLevel}
            <span class="cohort-arrow">← Cohort 1 avg</span>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Summary line -->
    {#if firmScore >= 0}
      <div class="cohort-summary">
        <div class="cohort-summary-icon">{cohort1Avg}</div>
        <div class="cohort-summary-text">
          {#if pointsToAdd <= 0}
            This firm scores <strong>{firmScore}</strong> — at or above the Cohort 1 average of <strong>{cohort1Avg}</strong> on this signal.
          {:else}
            This firm scores <strong>{firmScore}</strong>. Cohort 1 averages <strong>{cohort1Avg}</strong>. Scoring a 3 on this signal adds <strong>{pointsToAdd} {pointsToAdd === 1 ? 'point' : 'points'}</strong> toward closing the <strong>{totalGap}-point gap</strong> with Cohort 1.
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 100;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 40px;
  }

  .popup {
    background: #fff;
    border: 0.5px solid #ccc;
    border-radius: 12px;
    width: 380px;
    max-width: 92%;
    padding: 20px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .popup-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .popup-title {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a18;
    line-height: 1.4;
  }

  .popup-close {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 0.5px solid #ccc;
    background: #f5f5f0;
    cursor: pointer;
    font-size: 14px;
    color: #888;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-family: inherit;
  }

  .popup-section {
    margin-bottom: 14px;
  }

  .popup-section-label {
    font-size: 10px;
    font-weight: 500;
    color: #888;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  .popup-section-text {
    font-size: 12px;
    color: #555;
    line-height: 1.6;
  }

  .popup-divider {
    height: 0.5px;
    background: #e0dfd8;
    margin: 14px 0;
  }

  .cohort-bar-wrap {
    background: #f5f5f0;
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 14px;
  }

  .cohort-bar-header {
    font-size: 10px;
    font-weight: 500;
    color: #888;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
  }

  .bar-row-label {
    font-size: 11px;
    color: #888;
    min-width: 60px;
  }

  .bar-track {
    flex: 1;
    height: 7px;
    background: #fff;
    border-radius: 4px;
    border: 0.5px solid #e0dfd8;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }

  .bar-fill-firm { background: #4267AD; }
  .bar-fill-cohort { background: #9FE1CB; }

  .bar-score {
    font-size: 11px;
    font-weight: 500;
    min-width: 20px;
    text-align: right;
  }

  .bar-score-firm { color: #4267AD; }
  .bar-score-cohort { color: #0F6E56; }

  .scoring-label {
    font-size: 10px;
    font-weight: 500;
    color: #888;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .scoring-rows {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 10px;
    align-items: start;
  }

  .score-chip {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    flex-shrink: 0;
  }

  .score-chip.s0 { background: #F09595; color: #791F1F; }
  .score-chip.s1 { background: #FAC775; color: #633806; }
  .score-chip.s2 { background: #C0DD97; color: #27500A; }
  .score-chip.s3 { background: #5DCAA5; color: #085041; }
  .score-chip.cohort-marker { outline: 2px solid #0F6E56; outline-offset: 1px; }

  .score-desc {
    font-size: 11px;
    color: #555;
    line-height: 1.5;
    padding-top: 3px;
  }

  .score-desc.cohort-row { color: #1a1a18; font-weight: 500; }

  .cohort-arrow {
    font-size: 10px;
    color: #0F6E56;
    margin-left: 4px;
  }

  .cohort-summary {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 14px;
    padding: 12px;
    background: #E1F5EE;
    border-radius: 8px;
    border: 0.5px solid #0F6E56;
  }

  .cohort-summary-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #1D9E75;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
    color: #E1F5EE;
    flex-shrink: 0;
  }

  .cohort-summary-text {
    font-size: 12px;
    color: #085041;
    line-height: 1.6;
  }

  .cohort-summary-text strong {
    font-weight: 500;
  }
</style>
