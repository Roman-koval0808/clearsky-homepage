<script>
  import SignalGroup from './SignalGroup.svelte';

  let { groups = {}, referralNetwork = null, a2p = null } = $props();

  const GROUP_ORDER = [
    { id: 'website', title: 'Website' },
    { id: 'linkedin', title: 'LinkedIn' },
    { id: 'facebook', title: 'Facebook' },
    { id: 'instagram', title: 'Instagram' },
    { id: 'video', title: 'Video' },
    { id: 'community', title: 'Community' },
    { id: 'directories', title: 'Directories' },
    { id: 'citations', title: 'Citations' },
    { id: 'sov', title: 'Share of voice' },
    { id: 'contact', title: 'Contact friction' },
  ];
</script>

<div class="signals-view">
  {#each GROUP_ORDER as group}
    {#if groups[group.id]}
      <SignalGroup
        title={group.title}
        signals={groups[group.id].signals}
        groupScore={groups[group.id].groupScore}
        groupMax={groups[group.id].groupMax}
        cohort1Avg={groups[group.id].cohort1Avg}
        defaultOpen={group.id === 'website'}
      />
    {/if}
  {/each}

  {#if referralNetwork}
    <div class="sep-label">Separate layers</div>
    <SignalGroup
      title="Referral network"
      signals={referralNetwork.signals}
      groupScore={referralNetwork.groupScore}
      groupMax={referralNetwork.groupMax}
      isSeparate={true}
      separateNote="Reported separately · not compared to Cohort 1"
    />
  {/if}

  {#if a2p}
    <SignalGroup
      title="A2P intelligence"
      signals={a2p.signals}
      groupScore={null}
      groupMax={null}
      isSeparate={true}
      isPending={true}
      separateNote="Licensed clients only · not compared to Cohort 1"
    />
  {/if}
</div>

<style>
  .signals-view {
    padding: 0 20px 20px;
  }

  .sep-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--color-text-tertiary, #888);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-top: 20px;
    margin-bottom: 4px;
    padding-top: 8px;
    border-top: 0.5px solid var(--color-border, #e0dfd8);
  }
</style>
