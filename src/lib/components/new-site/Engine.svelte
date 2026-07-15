<script lang="ts">
  const steps = [
    { num: '1', title: 'Discovery', desc: 'Identify potential leads and their specific needs instantly.' },
    { num: '2', title: 'Engagement', desc: 'Engage with tailored responses that convert interest to action.' },
    { num: '3', title: 'Solution', desc: 'Present solutions through AI-driven accuracy and expertise.' },
    { num: '4', title: 'Close', desc: 'Finalize bookings and ensure seamless transaction flows.' }
  ];
</script>

<section class="bg-brand-subtle-blue/40 py-20 lg:py-32 overflow-hidden">
  <div class="mx-auto max-w-7xl px-6 lg:flex lg:items-center lg:gap-20">
    <!-- Steps List -->
    <div class="flex-1">
      <div class="mb-16 flex flex-col items-start">
         <span class="text-brand-orange uppercase tracking-[0.2em] font-black text-xs mb-4">Operations</span>
         <h2 class="text-3xl font-bold tracking-tight text-brand-blue lg:text-4xl text-left">
           The Quality Control <br /><span class="text-brand-orange italic font-black">Engine</span>
         </h2>
         <p class="mt-4 text-text-dark/60 font-medium">Streamlined sequence of automated excellence</p>
      </div>

      <div class="space-y-4">
        {#each steps as step (step.num)}
          <div class="group flex items-center gap-6 rounded-[32px] border-2 border-white/50 bg-white/30 p-8 transition-all duration-300 hover:border-brand-orange hover:bg-white hover:shadow-2xl hover:scale-[1.03]">
             <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-blue font-black text-white shadow-xl transition-all group-hover:bg-brand-orange group-hover:scale-110">
               {step.num}
             </div>
             <div>
               <h4 class="mb-2 text-xl font-black text-brand-blue transition-colors group-hover:text-brand-orange">{step.title}</h4>
               <p class="text-sm font-semibold text-text-dark/70 leading-relaxed">{step.desc}</p>
             </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Video/Demo Mockup -->
    <div class="relative flex-1 mt-20 lg:mt-0">
      <div class="relative overflow-hidden rounded-[40px] shadow-2xl border-8 border-brand-blue bg-white">
        <!-- Floating label -->
        <div class="absolute top-6 left-6 z-20 px-4 py-2 bg-brand-orange text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">LIVE DEMO</div>
        
        <!-- Video Placeholder / Iframe -->
        <div class="aspect-video w-full bg-slate-900 flex items-center justify-center relative group">
           <!-- Play icon -->
           <div class="h-24 w-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all group-hover:scale-125 group-hover:bg-white/20 shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" class="text-white ml-2">
                <path d="m7 4 12 8-12 8V4z"></path>
              </svg>
           </div>
           
           <!-- Optional image overlay if needed -->
           <img src="/vid-overlay.png" alt="Video Placeholder" class="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-overlay transition-opacity group-hover:opacity-30" />
        </div>
      </div>

      <!-- Additional UI bubble -->
      <div class="absolute -bottom-8 -right-8 glass rounded-3xl p-6 shadow-2xl max-w-xs animate-pulse hover:animate-none group">
         <p class="text-xs font-black text-brand-blue mb-2 flex items-center gap-2">
           <span class="h-2 w-2 rounded-full bg-brand-green"></span> System Active
         </p>
         <p class="text-sm font-medium text-text-dark/80 italic">"Responding to customer inquiry from London in 3.2s..."</p>
      </div>
    </div>
  </div>
</section>
