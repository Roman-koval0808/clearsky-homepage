<script lang="ts">
  const items = [
    { title: 'Customer Service', desc: 'Deliver rapid, tailored, and consistent high-quality service experience.', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    { title: 'Trusted Experience', desc: 'Enhancing the trust levels through immediate and high-impact interactions.', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { title: 'Professional Services', desc: 'Focusing on your core expertise while ClearSky handles the communication.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
    { title: 'New Markets', desc: 'Expanding globally with AI multi-lingual support and market adaptation.', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z' }
  ];
</script>

<section class="bg-white py-20 lg:py-32 overflow-hidden relative">
  <!-- Subtle decoration -->
  <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-orange/5 blur-3xl"></div>
  <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-brand-blue/5 blur-3xl"></div>

  <div class="mx-auto max-w-7xl px-6">
    <div class="mb-20 text-center flex flex-col items-center">
       <span class="text-brand-blue uppercase tracking-[0.2em] font-black text-xs mb-4">Core Focus</span>
       <h3 class="text-3xl font-bold tracking-tight text-brand-blue lg:text-4xl">
         What ClearSky does for Professionalize
       </h3>
       <div class="mt-6 h-1 w-16 rounded-full bg-brand-orange"></div>
    </div>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
      {#each items as item (item.title)}
        <div class="group relative flex flex-col items-center rounded-[32px] border-2 border-brand-subtle-blue p-8 transition-all duration-300 hover:border-brand-orange hover:shadow-2xl overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-br from-brand-subtle-blue/60 to-white opacity-0 transition-opacity group-hover:opacity-100"></div>
           
           <div class="relative z-10 mb-8 rounded-2xl bg-brand-subtle-blue/50 p-6 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-orange group-hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d={item.icon}></path>
              </svg>
           </div>

           <h4 class="relative z-10 mb-6 text-xl font-black text-brand-blue text-center group-hover:text-brand-orange transition-colors">
             {item.title}
           </h4>
           
           <p class="relative z-10 text-center leading-relaxed text-text-dark/70 font-medium">
             {item.desc}
           </p>
        </div>
      {/each}
    </div>
  </div>
</section>
