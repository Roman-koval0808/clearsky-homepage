
<script>
    let { title = "ClearSky AI Decision System Dashboard" } = $props();
</script>

<header class="top-bar">
    <h1 class="text-lg font-semibold text-white tracking-tight">{title}</h1>
    
    <div class="flex items-center gap-6">
        <button class="text-dash-text-muted hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14" />
            </svg>
        </button>
        <button class="relative text-dash-text-muted hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0e14]"></span>
        </button>
        <div class="flex items-center gap-3 pl-4 border-l border-dash-border">
            <div class="text-right hidden sm:block">
                <div class="text-[11px] font-bold text-white leading-none">Alex Johnson</div>
                <div class="text-[9px] text-dash-text-muted mt-1 uppercase tracking-wider font-bold">System Admin</div>
            </div>
            <div class="relative">
                <img src="https://ui-avatars.com/api/?name=Alex+Johnson&background=3b82f6&color=fff" alt="Avatar" class="w-8 h-8 rounded-lg border border-dash-border shadow-lg" />
                <div class="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0a0e14]"></div>
            </div>
        </div>
    </div>
</header>
