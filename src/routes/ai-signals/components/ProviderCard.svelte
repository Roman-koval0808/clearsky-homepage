
<script>
    let { providers = [] } = $props();
    let isExpanded = $state(false);
    
    const icons = {
        'telnyx': 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
        'google': 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18',
        'social': 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
        'dataforseo': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
        'email': 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        'crm': 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    };

    function getIconPath(id) {
        // Fallback for different ID formats
        if (id.includes('telnyx')) return icons.telnyx;
        if (id.includes('google')) return icons.google;
        if (id.includes('social') || id.includes('analytics') || id.includes('clearsky')) return icons.social;
        if (id.includes('dataforseo')) return icons.dataforseo;
        if (id.includes('email')) return icons.email;
        if (id.includes('crm') || id.includes('quote') || id.includes('booking')) return icons.crm;
        return 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4';
    }

    function formatName(name) {
        if (name.length > 15) return name.slice(0, 12) + '...';
        return name;
    }

    const visibleProviders = $derived(isExpanded ? providers : providers.slice(0, 6));
</script>

<div class="dash-card col-span-3 flex flex-col">
    <div class="dash-card-header mb-4">
        <div>
            <h3 class="dash-card-title flex items-center gap-2">
                Providers 
                <span class="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">{providers.length} Active</span>
            </h3>
        </div>
        <button 
            class="text-dash-text-muted hover:text-white transition-all transform {isExpanded ? 'rotate-180' : ''}"
            onclick={() => isExpanded = !isExpanded}
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
    </div>

    <div class="grid grid-cols-3 gap-2 overflow-hidden transition-all duration-500" style="max-height: {isExpanded ? '600px' : '180px'}">
        {#each visibleProviders as provider (provider.id)}
            <div class="provider-icon-box group hover:bg-[#1e2733] transition-colors cursor-pointer border border-dash-border bg-white/[0.02]">
                <div class="status-indicator status-active"></div>
                <div class="w-7 h-7 flex items-center justify-center text-dash-text-muted group-hover:text-blue-400 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={getIconPath(provider.id)} />
                    </svg>
                </div>
                <span class="text-[8px] font-bold text-center text-dash-text-muted group-hover:text-white transition-colors px-1 leading-tight uppercase tracking-tighter">
                    {formatName(provider.name)}
                </span>
            </div>
        {/each}

        {#if !isExpanded && providers.length > 6}
            <button 
                class="provider-icon-box flex items-center justify-center bg-blue-600/10 border border-blue-600/30 hover:bg-blue-600/20 transition-all text-blue-400 font-bold text-[9px] uppercase tracking-widest"
                onclick={() => isExpanded = true}
            >
                +{providers.length - 6} More
            </button>
        {/if}
    </div>
</div>
