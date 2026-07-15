
<script>
    let { events = [], selectedId, onSelect } = $props();
    
    function formatTime(iso) {
        if (!iso) return 'Just now';
        const date = new Date(iso);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
</script>

<div class="dash-card col-span-6">
    <div class="dash-card-header">
        <div>
            <h3 class="dash-card-title">Event Feed</h3>
            <p class="text-[10px] text-dash-text-muted italic mt-0.5">Normalized ClearSky stream</p>
        </div>
        <button class="text-dash-text-muted">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
        </button>
    </div>

    {#if events.length > 0}
    <div class="space-y-0.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
        {#each events as event (event.id)}
            <button 
                class="feed-item w-full text-left group hover:bg-white/5 px-2 rounded-lg transition-all border-none py-2.5 {selectedId === event.id ? 'bg-blue-600/10 ring-1 ring-blue-500/30' : ''}"
                onclick={() => onSelect(event.id)}
            >
                <div class="flex items-center gap-3 w-[35%] overflow-hidden">
                    <div class="w-2 h-2 rounded-full {selectedId === event.id ? 'bg-blue-400' : 'bg-blue-500/40'} shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-colors"></div>
                    <span class="truncate font-medium text-[11px] {selectedId === event.id ? 'text-blue-400' : 'text-white/90'}">{(event.provider_id || event.provider || '').replace(/_/g, ' ')}</span>
                </div>
                <div class="flex items-center gap-2 text-dash-text-muted w-[45%]">
                    <svg class="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    <span class="text-[11px] font-mono {selectedId === event.id ? 'text-white' : 'text-blue-400/80'}">{event.event_type}</span>
                </div>
                <div class="text-right text-[10px] text-dash-text-muted w-[20%] font-medium">
                    {formatTime(event.occurred_at)}
                </div>
            </button>
        {/each}
    </div>
    {:else}
    <div class="flex flex-col items-center justify-center h-48 border border-dashed border-dash-border rounded-xl bg-white/[0.02]">
        <svg class="w-8 h-8 text-dash-text-muted mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.111 16.404a5.5 5.5 0 117.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.257-3.905 14.162 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
        <p class="text-xs text-dash-text-muted font-medium">Listening for incoming signals...</p>
    </div>
    {/if}
</div>
