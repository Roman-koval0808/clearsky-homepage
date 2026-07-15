<script lang="ts">
  const withoutFlow = [
    { label: 'Visitor', status: 'Success' },
    { label: 'Respond', status: 'Complex' },
    { label: 'Book', status: 'Delay' },
    { label: 'Confirm', status: 'Loss' }
  ];

  const withFlow = [
    { label: 'Direct', status: 'Streamlined' },
    { label: 'Engagement', status: 'AI Handled' },
    { label: 'Calendar', status: 'Instant' },
    { label: 'Book', status: 'Conversion' }
  ];
</script>

<section class="bg-brand-subtle-blue/20 py-20 lg:py-32">
  <div class="mx-auto max-w-7xl px-6">
    <div class="text-center mb-20 flex flex-col items-center">
       <span class="text-brand-orange uppercase tracking-widest font-black text-sm mb-4">The Solution</span>
       <h2 class="text-3xl font-bold tracking-tight text-brand-blue lg:text-4xl">
         Where Business Loss Appears
       </h2>
       <p class="mt-4 text-text-dark/60 font-medium">Comparing traditional workflows with ClearSky's AI-driven approach</p>
    </div>

    <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <!-- Without ClearSky -->
      <div class="glass relative overflow-hidden rounded-[40px] p-8 lg:p-12 shadow-xl border-red-100 bg-white/40">
        <div class="mb-10 text-center">
          <h3 class="text-2xl font-black text-brand-blue/60 flex items-center justify-center gap-3">
             <div class="h-2 w-2 rounded-full bg-red-500"></div>
             Without ClearSky
          </h3>
        </div>
        
        <div class="flex flex-col gap-6 items-center">
           {#each withoutFlow as step, i (step.label)}
             <div class="flex w-full items-center gap-6 justify-center">
               <div class="h-14 w-14 rounded-2xl bg-white border border-red-50 sm:flex hidden items-center justify-center shadow-md font-black text-sm text-red-400">0{i+1}</div>
               <div class="flex-1 max-w-sm rounded-[20px] bg-red-50/50 p-6 border-2 border-red-100/50 transition-all hover:scale-105 hover:bg-white shadow-sm">
                  <p class="font-bold text-lg text-brand-blue/80">{step.label}</p>
                  <p class="text-xs text-red-400 font-black uppercase tracking-widest">{step.status}</p>
               </div>
             </div>
             {#if i < withoutFlow.length - 1}
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-200">
                 <path d="M12 5v14M19 12l-7 7-7-7"></path>
               </svg>
             {/if}
           {/each}
        </div>
      </div>

      <!-- With ClearSky -->
      <div class="relative overflow-hidden rounded-[40px] p-8 lg:p-12 shadow-2xl border-brand-orange border-4 bg-white transition-all hover:scale-[1.02]">
        <div class="mb-10 text-center">
          <h3 class="text-2xl font-black text-brand-orange flex items-center justify-center gap-3">
             <div class="h-3 w-3 rounded-full bg-brand-orange animate-pulse"></div>
             With ClearSky
          </h3>
        </div>
        
        <div class="flex flex-col gap-6 items-center">
           {#each withFlow as step, i (step.label)}
             <div class="flex w-full items-center gap-6 justify-center">
               <div class="h-14 w-14 rounded-2xl bg-brand-orange sm:flex hidden items-center justify-center shadow-xl text-white font-black text-sm">0{i+1}</div>
               <div class="flex-1 max-w-sm rounded-[20px] bg-brand-subtle-blue/40 p-6 border-2 border-brand-subtle-blue transition-all hover:scale-110 hover:bg-brand-subtle-blue/60 shadow-xl overflow-hidden relative">
                  <!-- Subtle gradient bg -->
                  <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <p class="font-bold text-xl text-brand-blue relative z-10">{step.label}</p>
                  <p class="text-xs text-brand-green font-black uppercase tracking-widest relative z-10">{step.status}</p>
               </div>
             </div>
             {#if i < withFlow.length - 1}
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-brand-orange animate-bounce">
                 <path d="M12 5v14M19 12l-7 7-7-7"></path>
               </svg>
             {/if}
           {/each}
        </div>
        
        <div class="mt-12 text-center p-6 bg-brand-blue rounded-3xl text-white shadow-2xl">
           <p class="text-sm font-black uppercase tracking-tighter mb-2 italic">Results driven outcome</p>
           <p class="text-2xl font-bold">Everything streamlined</p>
        </div>
      </div>
    </div>
  </div>
</section>
