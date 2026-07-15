
<script>
    import { dashboardState } from '$lib/clearsky/dashboard-state.svelte.ts';
    let { approvals = [] } = $props();
    let currentIndex = $state(0);
    let isEditing = $state(false);

    // Keep index in bounds when list changes
    $effect(() => {
        if (currentIndex >= approvals.length) {
            currentIndex = Math.max(0, approvals.length - 1);
        }
    });

    const currentApproval = $derived(approvals[currentIndex]);

    function next() {
        if (currentIndex < approvals.length - 1) currentIndex++;
    }

    function prev() {
        if (currentIndex > 0) currentIndex--;
    }

    function handleApprove() {
        if (!currentApproval) return;
        dashboardState.approveApproval(currentApproval.id, isEditing);
        isEditing = false;
    }

    function handleDiscard() {
        if (!currentApproval) return;
        dashboardState.discardApproval(currentApproval.id);
        isEditing = false;
    }

    function toggleEdit() {
        isEditing = !isEditing;
    }
</script>

<div class="dash-card col-span-6 h-full flex flex-col">
    <div class="dash-card-header mb-4">
        <h3 class="dash-card-title flex items-center gap-2">
            Approvals Pending
            {#if approvals.length > 0}
                <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            {/if}
        </h3>
        <div class="flex items-center gap-4">
            {#if approvals.length > 1}
                <div class="flex items-center gap-2 bg-white/5 px-2 py-1 rounded border border-dash-border">
                    <button 
                        class="text-dash-text-muted hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                        onclick={prev}
                        disabled={currentIndex === 0}
                    >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span class="text-[9px] font-bold text-white min-w-[30px] text-center">
                        {currentIndex + 1} / {approvals.length}
                    </span>
                    <button 
                        class="text-dash-text-muted hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                        onclick={next}
                        disabled={currentIndex === approvals.length - 1}
                    >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            {/if}
            <span class="text-[9px] text-dash-text-muted font-bold uppercase tracking-widest hidden sm:block">Manual Override Required</span>
        </div>
    </div>

    <div class="flex-1">
        {#if currentApproval}
        <div class="bg-[#0d131a] rounded-xl border border-dash-border p-5 h-full flex flex-col shadow-inner">
            <div class="flex items-start justify-between mb-5">
                <div class="flex gap-3">
                    <div class="w-8 h-8 bg-blue-600/10 border border-blue-600/20 rounded-lg flex items-center justify-center text-blue-500">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <div>
                        <div class="text-[12px] font-bold text-white mb-0.5">{currentApproval.type || 'Draft Proposal'}</div>
                        <div class="text-[9px] text-dash-text-muted font-mono uppercase">Reference: {currentApproval.id?.slice(0, 8)}</div>
                    </div>
                </div>
                {#if isEditing}
                    <span class="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Editing Mode</span>
                {/if}
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar mb-6">
                <div class="bg-black/20 p-4 rounded-lg border border-white/5 relative">
                    {#if isEditing}
                        <textarea 
                            class="w-full bg-transparent text-[11px] text-white leading-relaxed font-medium outline-none resize-none min-h-[100px]"
                            value={currentApproval.content}
                        ></textarea>
                    {:else}
                        <p class="text-[11px] text-dash-text-muted leading-relaxed font-medium">
                            {currentApproval.content}
                        </p>
                    {/if}
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-dash-border/30">
                <button 
                    onclick={toggleEdit}
                    class="bg-white/5 border border-dash-border px-4 py-2 rounded-lg text-[10px] font-bold text-white hover:bg-white/10 transition-all uppercase tracking-wider"
                >
                    {isEditing ? 'Save Changes' : 'Edit Draft'}
                </button>
                <button 
                    onclick={handleDiscard}
                    class="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-red-500/20 transition-all uppercase tracking-wider"
                >
                    Discard
                </button>
                <button 
                    onclick={handleApprove}
                    class="bg-blue-600 px-5 py-2 rounded-lg text-[10px] font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wider"
                >
                    Approve & Send
                </button>
            </div>
        </div>
        {:else}
        <div class="flex flex-col items-center justify-center h-full min-h-[250px] text-dash-text-muted border border-dashed border-dash-border rounded-xl bg-white/[0.01]">
            <div class="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <p class="text-xs font-bold uppercase tracking-widest opacity-60">System Synchronized</p>
            <p class="text-[10px] mt-1 opacity-40">No pending manual approvals detected.</p>
        </div>
        {/if}
    </div>
</div>
