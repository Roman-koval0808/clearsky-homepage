
<script>
    let { volume = 12450 } = $props();
</script>

<div class="dash-card col-span-3">
    <div class="dash-card-header">
        <div>
            <h3 class="dash-card-title">Total Event Volume <span class="text-dash-text-muted font-normal">(Last 24h)</span></h3>
        </div>
        <button class="text-dash-text-muted hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
        </button>
    </div>

    <div class="mt-2">
        <div class="text-3xl font-bold">{volume.toLocaleString()}</div>
        
        <div class="mt-4 h-24 relative overflow-hidden">
            <svg class="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.4" />
                        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                    </linearGradient>
                </defs>
                <path d="M0,80 Q50,20 100,60 T200,40 T300,70 T400,30 L400,100 L0,100 Z" fill="url(#chartGradient)" />
                <path d="M0,80 Q50,20 100,60 T200,40 T300,70 T400,30" stroke="#3b82f6" stroke-width="2" fill="none" />
            </svg>
        </div>
    </div>
</div>
