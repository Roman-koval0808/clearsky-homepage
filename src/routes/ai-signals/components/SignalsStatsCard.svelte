
<script>
    import { dashboardState } from '$lib/clearsky/dashboard-state.svelte.ts';
    let { signals = [] } = $props();

    const bucketMeta = {
        'Opportunity': { color: 'text-green-400', bg: 'bg-green-500/5', border: 'border-green-500/20', active: 'ring-1 ring-green-500/50 bg-green-500/10' },
        'Risk': { color: 'text-orange-400', bg: 'bg-orange-500/5', border: 'border-orange-500/20', active: 'ring-1 ring-orange-500/50 bg-orange-500/10' },
        'Bottleneck': { color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20', active: 'ring-1 ring-red-500/50 bg-red-500/10' },
        'Performance': { color: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/20', active: 'ring-1 ring-blue-500/50 bg-blue-500/10' },
        'Competitive': { color: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-500/20', active: 'ring-1 ring-purple-500/50 bg-purple-500/10' },
        'Momentum': { color: 'text-slate-300', bg: 'bg-slate-500/5', border: 'border-slate-500/20', active: 'ring-1 ring-slate-400/50 bg-slate-500/10' }
    };

    const buckets = ['Opportunity', 'Risk', 'Bottleneck', 'Performance', 'Competitive', 'Momentum'];

    const counts = $derived.by(() => {
        return buckets.map(bucket => ({
            label: bucket,
            value: signals.filter(s => s.bucket === bucket).length,
            ...bucketMeta[bucket]
        }));
    });

    const activeBucket = $derived(dashboardState.activeBucket);
</script>

<div class="dash-card col-span-3">
    <div class="dash-card-header mb-4">
        <div>
            <h3 class="dash-card-title">AI Signals Detected</h3>
            <p class="text-[10px] text-dash-text-muted mt-0.5">Click a bucket to filter feed</p>
        </div>
        {#if activeBucket}
            <button 
                class="text-[9px] font-bold text-blue-400 hover:text-white uppercase tracking-tighter bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20"
                onclick={() => dashboardState.activeBucket = null}
            >
                Clear Filter
            </button>
        {:else}
            <button class="text-dash-text-muted hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
            </button>
        {/if}
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {#each counts as stat (stat.label)}
            <button 
                class="flex flex-col items-start p-3 rounded-xl border transition-all duration-200 text-left group
                       {activeBucket === stat.label ? stat.active : `${stat.bg} ${stat.border} hover:border-white/20`}"
                onclick={() => dashboardState.toggleBucket(stat.label)}
            >
                <span class="text-[9px] font-bold uppercase tracking-tight mb-1 transition-colors 
                            {activeBucket === stat.label ? 'text-white' : 'text-dash-text-muted group-hover:text-white/70'}">
                    {stat.label}
                </span>
                <span class="text-2xl font-bold font-mono leading-none {stat.color} transition-transform duration-300 {activeBucket === stat.label ? 'scale-110 translate-x-1' : ''}">
                    {stat.value}
                </span>
            </button>
        {/each}
    </div>
</div>
