
<script>
    let { metrics = {} } = $props();
</script>

<div class="dash-card col-span-3">
    <div class="dash-card-header">
        <h3 class="dash-card-title">Growth Metrics</h3>
        <button class="text-dash-text-muted hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
        </button>
    </div>

    <div class="grid grid-cols-3 gap-4">
        <div>
            <div class="text-[10px] text-dash-text-muted mb-1">Revenue Growth</div>
            <div class="text-xl font-bold text-green-500">+{metrics.revenue_growth || 18}%</div>
        </div>
        <div>
            <div class="text-[10px] text-dash-text-muted mb-1">Booked Work</div>
            <div class="text-xl font-bold text-green-500">+{metrics.booked_work || 22}%</div>
        </div>
        <div>
            <div class="text-[10px] text-dash-text-muted mb-1">Reputation Score</div>
            <div class="flex items-center gap-1">
                <span class="text-xl font-bold text-white">{metrics.reputation_score || 4.8}</span>
                <svg class="w-3 h-3 text-orange-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </div>
            <div class="text-[8px] text-dash-text-muted">stars on GBP</div>
        </div>
    </div>

    <div class="mt-4 h-12 relative">
        <svg class="w-full h-full" viewBox="0 0 300 40" preserveAspectRatio="none">
            <path d="M0,35 Q50,10 100,30 T200,15 T300,25" stroke="#22c55e" stroke-width="2" fill="none" />
            <path d="M0,35 Q50,30 100,35 T200,38 T300,32" stroke="#3b82f6" stroke-width="2" fill="none" opacity="0.5" />
        </svg>
    </div>
</div>
