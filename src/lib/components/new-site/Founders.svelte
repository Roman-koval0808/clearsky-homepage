<script lang="ts">
  const benefits = [
    { title: 'Priority Access', desc: 'Founders receive early access to new AI modules and features before public release.', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
    { title: 'Custom Training', desc: 'Our AI engineers work directly with you to fine-tune the knowledge base for your specific sector.', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { title: 'Zero Cost Scaling', desc: 'Phase 3 sector specific modules will be added at no additional cost for Founders.', icon: 'M12 1v22m11-11H1' },
    { title: 'Direct Partnership', desc: 'Continuous feedback loop with the core product team for roadmapping.', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }
  ];
</script>

<section class="bg-brand-blue py-20 lg:py-32 overflow-hidden relative">
  <!-- Subtle linear glow -->
  <div class="absolute -left-1/4 top-0 h-full w-1/2 bg-linear-to-r from-brand-orange/20 to-transparent blur-3xl opacity-30"></div>
  <div class="absolute -right-1/4 bottom-0 h-full w-1/2 bg-linear-to-l from-brand-orange/20 to-transparent blur-3xl opacity-30"></div>

  <div class="mx-auto max-w-7xl px-6 relative z-10">
    <div class="mb-20 text-center flex flex-col items-center">
       <span class="text-brand-orange uppercase tracking-[0.4em] font-black text-xs mb-4">Limited Availability</span>
       <h2 class="text-3xl font-black text-white lg:text-5xl leading-tight">
         The ClearSky <br /><span class="text-brand-orange italic">Founders Program</span>
       </h2>
       <p class="mt-8 text-white/70 font-medium max-w-2xl text-lg leading-relaxed">
         Join an exclusive group of innovators transforming their business operations with the next generation of conversational AI.
       </p>
    </div>

    <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <!-- Card 1: Exclusive Benefits -->
      <div class="glass flex flex-col items-start rounded-[40px] p-12 border-white/10 hover:border-brand-orange transition-all duration-500 hover:shadow-2xl group">
         <div class="mb-10 text-left">
           <h3 class="text-3xl font-black text-white group-hover:text-brand-orange transition-colors">Why Become a Founder?</h3>
           <div class="mt-4 h-1.5 w-16 rounded-full bg-brand-orange"></div>
         </div>
         
         <div class="space-y-8 w-full">
            {#each benefits as benefit (benefit.title)}
              <div class="flex items-start gap-6 border-b border-white/5 pb-8 last:border-0 hover:translate-x-4 transition-transform group/item">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-brand-orange group-hover/item:bg-brand-orange group-hover/item:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d={benefit.icon}></path>
                  </svg>
                </div>
                <div>
                   <h5 class="text-lg font-black text-white mb-1">{benefit.title}</h5>
                   <p class="text-sm font-medium text-white/50 leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            {/each}
         </div>
      </div>

      <!-- Card 2: Program Enrollment -->
      <div class="relative overflow-hidden rounded-[40px] bg-white p-12 shadow-2xl transition-all duration-500 hover:scale-[1.02] flex flex-col justify-between">
         <div class="mb-10 text-center">
           <span class="px-3 py-1 bg-brand-orange/10 text-brand-orange text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-orange/20 mb-4 inline-block italic">Phase 1: Open Enrollment</span>
           <h3 class="text-4xl font-black text-brand-blue mb-4">Apply for Membership</h3>
           <p class="text-sm font-semibold text-text-dark/60">Limited to 50 businesses per quarter to ensure white-glove onboarding and custom AI training.</p>
         </div>
         
         <form class="space-y-6">
            <div class="flex flex-col gap-2">
              <label for="fullname" class="text-[10px] font-black uppercase text-brand-blue/50 tracking-widest ml-4">Full Name</label>
              <input id="fullname" type="text" placeholder="e.g. John Doe" class="w-full h-16 rounded-2xl bg-brand-subtle-blue/50 border-2 border-transparent focus:border-brand-orange focus:bg-white px-6 font-bold text-brand-blue transition-all outline-none" />
            </div>
            <div class="flex flex-col gap-2">
              <label for="sector" class="text-[10px] font-black uppercase text-brand-blue/50 tracking-widest ml-4">Business Sector</label>
              <select id="sector" class="w-full h-16 rounded-2xl bg-brand-subtle-blue/50 border-2 border-transparent focus:border-brand-orange focus:bg-white px-6 font-bold text-brand-blue transition-all outline-none appearance-none">
                <option>Local Business</option>
                <option>Tourism</option>
                <option>Manufacturing</option>
                <option>Professional Services</option>
              </select>
            </div>
            
            <button type="submit" class="w-full h-20 rounded-3xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:shadow-2xl transition-all active:scale-95 mt-8">
              SUBMIT APPLICATION
            </button>
            <p class="text-center text-[10px] font-semibold text-text-dark/40 italic">One of our specialists will reach out within 24 hours.</p>
         </form>
      </div>
    </div>
  </div>
</section>
