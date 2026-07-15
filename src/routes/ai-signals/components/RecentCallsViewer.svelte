<script lang="ts">
    import { onMount } from 'svelte';

    let events = $state<any[]>([]);
    let isLoading = $state(false);
    let selectedEvent = $state<any | null>(null);

    async function fetchEvents() {
        isLoading = true;
        try {
            const res = await fetch('/api/signals/recent-calls');
            const data = await res.json();
            if (data.success) {
                events = data.events;
            }
        } catch (e) {
            console.error('Failed to fetch recent events', e);
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        fetchEvents();
    });

    function getLogs(unstructuredText: string) {
        if (!unstructuredText) return [];
        const parts = unstructuredText.split('--- PIPELINE LOGS ---');
        if (parts.length > 1) {
            return parts[1].trim().split('\n').filter(Boolean);
        }
        return [];
    }
</script>

<div class="mt-12 bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div class="border-b border-slate-200 bg-slate-50 p-6 flex justify-between items-center">
        <div>
            <h2 class="text-xl font-bold text-text-dark">Recent Communication Events</h2>
            <p class="text-sm text-slate-400 mt-1">View the full pipeline execution for real-world voice and SMS events.</p>
        </div>
        <button onclick={fetchEvents} disabled={isLoading} class="btn-outline bg-white text-sm">
            {isLoading ? '⏳ Refreshing...' : '🔄 Refresh List'}
        </button>
    </div>

    <div class="flex h-[600px]">
        <!-- Left Sidebar: Event List -->
        <div class="w-80 shrink-0 border-r border-slate-200 overflow-y-auto p-4 space-y-2">
            {#if events.length === 0}
                <div class="text-center text-slate-400 py-8 text-sm">No recent events found.</div>
            {/if}
            {#each events as event (event.event_id)}
                <button
                    onclick={() => selectedEvent = event}
                    class="w-full text-left p-3 rounded-xl transition-all border {selectedEvent === event ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white border-slate-200 hover:border-brand-blue'}"
                >
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-sm">{event.provider === 'telnyx_voice' ? '📞' : event.provider === 'clearsky_website_forms' ? '📝' : '💬'}</span>
                        <div class="font-semibold text-sm truncate">{event.event_id}</div>
                    </div>
                    <div class="text-[10px] uppercase tracking-wider opacity-60 {selectedEvent === event ? 'text-white/70' : 'text-slate-500'}">
                        {event.provider.replace('telnyx_', '')} · {event.event_type}
                    </div>
                    <div class="text-xs mt-1 {selectedEvent === event ? 'text-white/80' : 'text-slate-500'}">
                        {new Date(event.created_at).toLocaleString()}
                    </div>
                </button>
            {/each}
        </div>

        <!-- Right Side: Details -->
        <div class="flex-1 min-w-0 overflow-y-auto bg-slate-50 p-6">
            {#if selectedEvent}
                <div class="space-y-6">
                    <!-- AI Enrichment -->
                    {#if selectedEvent.enrichments?.[0]}
                        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h3 class="font-bold text-text-dark mb-3">🧠 AI Extraction</h3>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div><span class="text-slate-400 font-medium">Urgency:</span> {selectedEvent.enrichments[0].ai_urgency_level || 'Normal'}</div>
                                <div><span class="text-slate-400 font-medium">Complaint Detected:</span> {selectedEvent.enrichments[0].ai_complaint_detected ? 'Yes' : 'No'}</div>
                            </div>
                            <div class="mt-3 text-sm text-slate-700">
                                <span class="text-slate-400 font-medium">Summary:</span>
                                <p class="mt-1">{selectedEvent.enrichments[0].ai_summary}</p>
                            </div>
                        </div>
                    {/if}

                    <!-- Decisions & Executions -->
                    {#each selectedEvent.orchestrator_decisions as decision (decision.decision_id)}
                        <div class="bg-white p-5 rounded-xl border border-brand-orange/30 shadow-sm">
                            <h3 class="font-bold text-brand-orange mb-3">🎯 Orchestrator Decision</h3>
                            <div class="text-sm mb-4">
                                <div><span class="text-slate-400 font-medium">Decision ID:</span> {decision.decision_id}</div>
                                {#if decision.dominant_signal_id}
                                    <div class="mt-1">
                                        <span class="text-slate-400 font-medium">Dominant Signal:</span> 
                                        <span class="font-mono text-brand-blue font-semibold">{selectedEvent.signals?.find((s: any) => s.id === decision.dominant_signal_id)?.signal_rule_id || 'Unknown Signal'}</span>
                                    </div>
                                {/if}
                            </div>
                            
                            {#each decision.action_queue as queue (queue.action_id || queue.id)}
                                <div class="mt-4 border-t border-slate-100 pt-4">
                                    <div class="font-semibold text-text-dark text-sm mb-2 flex items-center justify-between">
                                        <span>Action: {queue.action_id}</span>
                                        <span class="px-2 py-1 bg-slate-100 rounded text-xs text-slate-500 font-mono">{queue.status}</span>
                                    </div>
                                    
                                    {#each queue.executions as exec (exec.id || exec.execution_id || exec.generated_output)}
                                        <div class="bg-slate-50 rounded-lg p-3 text-xs border border-slate-200 mt-2">
                                            <div class="flex justify-between mb-2">
                                                <span class="font-medium text-slate-600">Execution Status:</span>
                                                <span class="font-bold text-brand-blue">{exec.execution_status}</span>
                                            </div>
                                            {#if exec.generated_output}
                                                <div class="font-medium text-slate-600 mb-1 mt-2">Generated Output:</div>
                                                <pre class="bg-white p-2 rounded border border-slate-100 overflow-x-auto text-slate-700">{JSON.stringify(JSON.parse(exec.generated_output), null, 2)}</pre>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>
                            {/each}
                        </div>
                    {/each}

                    <!-- Raw Logs -->
                    {#if getLogs(selectedEvent.unstructured_text).length > 0}
                        {@const logs = getLogs(selectedEvent.unstructured_text)}
                        <div class="bg-[#121820] p-5 rounded-xl border border-slate-800 shadow-sm">
                            <h3 class="font-bold text-slate-200 mb-3 font-mono text-sm">Terminal Pipeline Logs</h3>
                            <div class="space-y-1 h-64 overflow-y-auto custom-scrollbar pr-2">
                                {#each logs as log, idx (log + '-' + idx)}
                                    <div class="text-xs font-mono text-slate-400 break-words">{log}</div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            {:else}
                <div class="h-full flex items-center justify-center text-slate-400 text-sm">
                    Select an event from the left to view its pipeline execution.
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #334155;
        border-radius: 10px;
    }
</style>
