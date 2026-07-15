
<script>
    let { enrichment } = $props();
    let showFullRaw = $state(false);
    let showFullAI = $state(false);

    // Fallback for sentiment score if it's not explicitly provided
    const displayScore = $derived(enrichment?.sentiment_score || enrichment?.confidence_score || 0);
</script>

<div class="dash-card col-span-6 relative overflow-hidden group min-h-[300px]">
    <div class="dash-card-header border-b border-dash-border/30 pb-3">
        <div>
            <h3 class="dash-card-title flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Intelligence Enrichment
            </h3>
            <p class="text-[10px] text-dash-text-muted font-medium uppercase tracking-tight">AI Extraction Context (Context Only)</p>
            <p class="text-[8px] text-blue-500/50 uppercase tracking-tighter mt-0.5">Note: AI cannot trigger actions. Orchestrator rules handle decisions.</p>
        </div>
        <div class="flex items-center gap-2">
            <span class="text-[9px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Active Analysis</span>
        </div>
    </div>

    {#if enrichment}
    <div class="flex flex-col lg:flex-row gap-6 mt-4 relative z-10">
        <!-- Original Source -->
        <div class="lg:w-1/2 flex flex-col gap-3">
            <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-white/50 uppercase tracking-widest">Original Source</span>
                <button class="text-[9px] text-blue-400 hover:underline" onclick={() => showFullRaw = !showFullRaw}>
                    {showFullRaw ? 'Collapse' : 'Show Full'}
                </button>
            </div>
            <div class="bg-black/20 rounded-xl p-4 border border-dash-border shadow-inner group/raw relative transition-all duration-300 {showFullRaw ? 'max-h-none' : 'max-h-32'}">
                <p class="text-[11px] text-dash-text-muted leading-relaxed {showFullRaw ? '' : 'line-clamp-4'}">
                    "{enrichment.raw_text || 'No source text available.'}"
                </p>
                {#if !showFullRaw && enrichment.raw_text?.length > 150}
                    <div class="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0d131a] to-transparent rounded-b-xl"></div>
                {/if}
            </div>

            <div class="mt-auto">
                <div class="flex justify-between items-center mb-1.5">
                    <span class="text-[10px] font-bold text-white/70">Extraction Accuracy</span>
                    <span class="text-[10px] font-mono text-green-400">{Math.round((enrichment.confidence_score || 0) * 100)}%</span>
                </div>
                <div class="w-full bg-dash-bg h-1 rounded-full overflow-hidden">
                    <div class="bg-green-500 h-full transition-all duration-1000 shadow-[0_0_8px_rgba(34,197,94,0.4)]" style="width: {(enrichment.confidence_score || 0) * 100}%"></div>
                </div>
            </div>
        </div>

        <!-- AI Insight -->
        <div class="lg:w-1/2 flex flex-col gap-3">
            <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Context Summary</span>
                <button class="text-[9px] text-blue-400 hover:underline" onclick={() => showFullAI = !showFullAI}>
                    {showFullAI ? 'Collapse' : 'Show Full'}
                </button>
            </div>
            <div class="bg-blue-600/[0.03] rounded-xl p-4 border border-blue-500/20 relative transition-all duration-300 {showFullAI ? 'max-h-none' : 'max-h-32'}">
                <p class="text-[11px] text-white/90 leading-relaxed {showFullAI ? '' : 'line-clamp-4'} font-medium">
                    {enrichment.summary || enrichment.urgency_reason || 'AI analysis complete. Awaiting context...'}
                </p>
                {#if !showFullAI && (enrichment.summary?.length > 150 || enrichment.urgency_reason?.length > 150)}
                    <div class="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0d131a] to-transparent rounded-b-xl"></div>
                {/if}
            </div>

            <div class="grid grid-cols-2 gap-2 mt-2">
                <div class="bg-white/5 rounded-lg p-2 border border-dash-border">
                    <span class="text-[8px] text-dash-text-muted uppercase font-bold tracking-tighter">Sentiment</span>
                    <div class="text-[10px] text-white font-bold">{enrichment.sentiment || 'neutral'} ({Math.round(displayScore * 100)}%)</div>
                </div>
                <div class="bg-white/5 rounded-lg p-2 border border-dash-border">
                    <span class="text-[8px] text-dash-text-muted uppercase font-bold tracking-tighter">Intent</span>
                    <div class="text-[10px] text-white font-bold truncate">{enrichment.intent || 'Unknown'}</div>
                </div>
            </div>
            
            <div class="mt-1">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                    <span class="text-[10px] font-bold text-orange-400 uppercase tracking-tight">Priority Level: {enrichment.urgency_level || 'medium'}</span>
                </div>
            </div>
        </div>
    </div>
    {:else}
    <div class="flex flex-col items-center justify-center h-48 bg-white/[0.02] border border-dashed border-dash-border rounded-xl mt-4">
        <div class="w-12 h-12 rounded-full border border-dash-border flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-dash-text-muted opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" />
            </svg>
        </div>
        <p class="text-[11px] text-dash-text-muted font-medium uppercase tracking-widest">Awaiting Simulation Engine</p>
    </div>
    {/if}

    <!-- Background decoration -->
    <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/5 blur-3xl pointer-events-none"></div>
</div>
