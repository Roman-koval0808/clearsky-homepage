<script lang="ts">
  const markets = [
    { label: 'Local Business', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    { label: 'Tourism', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { label: 'Manufacturing', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { label: 'Professional Services', icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' }
  ];
</script>

<section class="bg-white py-20 lg:py-32 overflow-hidden">
  <div class="mx-auto max-w-7xl px-6 lg:flex lg:items-center lg:gap-20">
    <!-- Left Column Text -->
    <div class="flex-1 mb-20 lg:mb-0">
      <div class="mb-12 flex flex-col items-start text-left">
         <span class="text-brand-orange uppercase tracking-widest font-black text-xs mb-4">Vertical Industry Expansion</span>
         <h2 class="text-3xl font-bold tracking-tight text-brand-blue lg:text-5xl">
           Let ClearSky <br /><span class="text-brand-orange italic font-black">Direct you</span> to New Markets
         </h2>
         <p class="mt-8 text-lg font-medium text-text-dark/80 leading-relaxed max-w-lg italic">
           ClearSky's multi-lingual AI and sentiment analysis allow you to expand into any market, ensuring cultural and sector-specific accuracy in every response.
         </p>
         <button class="mt-12 btn-primary">Request Sector Review</button>
      </div>
    </div>

    <!-- Right Column Diagram -->
    <div class="relative flex-1 flex items-center justify-center">
      <div class="relative h-[480px] w-[480px]">
         <!-- Center Globe Node -->
         <div class="absolute inset-0 m-auto flex h-40 w-40 items-center justify-center rounded-full bg-brand-blue shadow-2xl border-4 border-white z-20 group overflow-hidden">
            <!-- Animated background ring -->
            <div class="absolute inset-0 bg-brand-orange/10 transform scale-150 rotate-45 group-hover:scale-100 transition-transform"></div>
            
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white relative z-10 group-hover:rotate-12 transition-transform">
               <circle cx="12" cy="12" r="10"></circle>
               <line x1="2" y1="12" x2="22" y2="12"></line>
               <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
         </div>

         <!-- Vertical Sectors logic -->
         <div class="absolute inset-0 flex items-center justify-center">
            {#each markets as market, i (market.label)}
              <div 
                class="absolute flex flex-col items-center group transition-all duration-300 hover:scale-110" 
                style="transform: rotate({i * 90}deg) translateY(-180px) rotate(-{i * 90}deg)"
              >
                 <div class="h-28 w-28 rounded-[38px] bg-white shadow-2xl border-4 border-brand-subtle-blue flex items-center justify-center group-hover:bg-brand-orange group-hover:border-white transition-all overflow-hidden relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-brand-blue group-hover:text-white relative z-10">
                       <path d={market.icon}></path>
                    </svg>
                    <!-- Background decor -->
                    <div class="absolute -right-4 -bottom-4 h-12 w-12 rounded-full bg-brand-subtle-blue opacity-50"></div>
                 </div>
                 <p class="mt-4 text-xs font-black text-brand-blue uppercase tracking-widest text-center group-hover:text-brand-orange transition-colors">
                   {market.label}
                 </p>
              </div>
            {/each}
         </div>

         <!-- Connecting rings SVG -->
         <svg class="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 480 480">
            <circle cx="240" cy="240" r="160" fill="none" stroke="var(--color-brand-blue)" stroke-width="4"></circle>
         </svg>
      </div>
    </div>
  </div>
</section>
