
<script>
    let { actions = [], selectedId, onSelect } = $props();
</script>

<div class="dash-card col-span-6">
    <div class="dash-card-header border-b border-dash-border pb-3">
        <div>
            <h3 class="dash-card-title flex items-center gap-2">
                Action Queue 
                <span class="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">Orchestrator Decision List</span>
            </h3>
            <p class="text-[10px] text-dash-text-muted mt-0.5">Deterministic rules-based execution</p>
        </div>
        <div class="flex gap-2">
            <button class="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-dash-text-muted hover:text-white transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
            </button>
        </div>
    </div>

    {#if actions.length > 0}
    <div class="mt-4 overflow-x-auto custom-scrollbar">
        <table class="w-full text-left text-[11px]">
            <thead>
                <tr class="text-dash-text-muted uppercase text-[9px] tracking-widest font-bold">
                    <th class="pb-3 px-2">Action ID</th>
                    <th class="pb-3 px-2">Recommendation</th>
                    <th class="pb-3 px-2">Owner</th>
                    <th class="pb-3 px-2 text-right">Priority</th>
                    <th class="pb-3 px-2 text-right">Execution</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-dash-border/30">
                {#each actions as action (action.id)}
                    <tr 
                        class="group hover:bg-white/[0.02] transition-all cursor-pointer {selectedId === action.event_id ? 'bg-blue-600/5' : ''}"
                        onclick={() => onSelect(action.event_id)}
                    >
                        <td class="py-4 px-2 font-mono text-[9px] {selectedId === action.event_id ? 'text-blue-400 font-bold' : 'text-blue-400/70'}">
                            {action.action_id || 'ACT-GEN-001'}
                        </td>
                        <td class="py-4 px-2">
                            <div class="font-semibold transition-colors {selectedId === action.event_id ? 'text-blue-400' : 'text-white group-hover:text-blue-400'}">{action.title}</div>
                            <div class="text-[9px] text-dash-text-muted mt-1 font-mono uppercase">Decided by deterministic rule</div>
                        </td>
                        <td class="py-4 px-2">
                            <div class="flex items-center gap-2">
                                <div class="w-5 h-5 {selectedId === action.event_id ? 'bg-blue-600/40 border-blue-400' : 'bg-blue-600/20 border-blue-600/30'} border rounded flex items-center justify-center text-[8px] font-bold text-blue-400">SYS</div>
                                <span class="text-[10px] text-dash-text-muted">{action.owner}</span>
                            </div>
                        </td>
                        <td class="py-4 px-2 text-right">
                            <span class="font-bold {action.priority === 1 ? 'text-orange-500' : 'text-white/60'}">P{action.priority}</span>
                        </td>
                        <td class="py-4 px-2 text-right">
                            <span class="bg-dash-bg border border-dash-border px-2 py-1 rounded-[4px] text-[9px] font-mono {action.execution_mode === 'approval_required' ? 'text-orange-400 border-orange-500/20' : 'text-dash-text-muted'}">
                                {action.execution_mode === 'approval_required' ? 'M. Override' : 'Auto-API'}
                            </span>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    {:else}
    <div class="flex flex-col items-center justify-center h-48 text-dash-text-muted bg-white/[0.02] border border-dashed border-dash-border rounded-xl mt-4">
        <svg class="w-10 h-10 mb-2 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="text-xs font-medium">Orchestrator idle. No rules triggered.</p>
    </div>
    {/if}
</div>
