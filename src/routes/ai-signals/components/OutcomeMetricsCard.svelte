
<script>
    let { metrics = {} } = $props();
</script>

<div class="dash-card col-span-3">
    <div class="dash-card-header border-b border-dash-border/30 pb-3 mb-4">
        <div>
            <h3 class="dash-card-title flex items-center gap-2">
                Engine Reliability
                <span class="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">Outcome Metrics</span>
            </h3>
            <p class="text-[10px] text-dash-text-muted mt-0.5">Measuring deterministic accuracy</p>
        </div>
    </div>

    <div class="space-y-4">
        <!-- AI Accuracy -->
        <div>
            <div class="flex justify-between items-end mb-1.5">
                <span class="text-[10px] text-dash-text-muted font-bold uppercase tracking-wider">AI Extraction Accuracy</span>
                <span class="text-xs font-mono font-bold text-white">{metrics.ai_accuracy || 94}%</span>
            </div>
            <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div class="h-full bg-blue-500 rounded-full transition-all duration-1000" style="width: {metrics.ai_accuracy || 94}%"></div>
            </div>
        </div>

        <!-- Human Intervention -->
        <div>
            <div class="flex justify-between items-end mb-1.5">
                <span class="text-[10px] text-dash-text-muted font-bold uppercase tracking-wider">Human Intervention Rate</span>
                <span class="text-xs font-mono font-bold text-white">{metrics.human_intervention_rate || 0}%</span>
            </div>
            <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div class="h-full bg-orange-500 rounded-full transition-all duration-1000" style="width: {metrics.human_intervention_rate || 0}%"></div>
            </div>
            <p class="text-[8px] text-dash-text-muted mt-1 italic">Percentage of actions requiring manual edits</p>
        </div>

        <!-- Suppression/Cooldowns -->
        <div class="pt-2">
            <div class="bg-[#0d131a] border border-dash-border rounded-lg p-3 flex items-center justify-between">
                <div>
                    <div class="text-[10px] text-dash-text-muted font-bold uppercase tracking-tight">Suppressed Noise</div>
                    <div class="text-lg font-bold font-mono text-green-400">{metrics.suppressed_count || 0}</div>
                </div>
                <div class="text-[8px] text-dash-text-muted text-right max-w-[80px]">
                    Duplicate signals prevented by cooldown rules
                </div>
            </div>
        </div>
    </div>
</div>
