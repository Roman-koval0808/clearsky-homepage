<script lang="ts">
	import CompanyLogosV3 from './CompanyLogosV3.svelte';
	import PartnerLogos from './PartnerLogos.svelte';
  // Partners section converted from Figma specs to Svelte 5
</script>

<div class="flex flex-col items-center justify-center gap-[8px] lg:gap-12 py-0 lg:py-16 px-6">
  <!-- Top Section: Revenue Projections (Frame 1000005981) -->
  <div class="flex flex-col lg:flex-row items-center gap-[8px] lg:gap-6 w-fit">
    <!-- Percentage (Frame 1000005980) -->
    <div class="flex items-center px-4 py-1 rounded-lg">
      <p class="text-[#F47B20] hidden lg:inline lg:font-inter text-[36px] leading-[44px] font-bold lg:font-normal whitespace-nowrap" style="-webkit-text-stroke: 1px #FF3535;">
        72-118%
      </p>
        <p class="text-[#F47B20] font-sohne lg:hidden  text-[36px] leading-[44px]  lg:font-normal whitespace-nowrap" style="-webkit-text-stroke: 1px #FF3535;">
        72-118%
      </p>
    </div>
    
    <!-- Projections Text (Frame 1000005979) -->
    <p class="text-[#1F2A44] font-inter text-[18px] leading-[22px] hidden lg:block font-semibold text-center lg:text-left max-w-[661px]">
      Revenue projections based on published research and industry benchmarks
    </p>

       <p class="text-[#1F2A44] lg:font-sohne-buch text-[14px] leading-[22px] lg:hidden font-bold text-center lg:text-left max-w-[661px]">
     Forecasts based on industry benchmarks
    </p>

    
  </div>

  <!-- Bottom Section: Partner Logos (Using central component) -->
  <div class="w-full max-w-[1200px] hidden lg:block">
   <PartnerLogos/>
  </div>

  <div class="w-full max-w-[1200px] lg:hidden">
   <CompanyLogosV3/>
  </div>
</div>

<style>
  @font-face {
    font-family: 'TestSohne-Buch';
    src: url('/fonts/TestSohne-Buch.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }

  .font-sohne-buch {
    font-family: 'TestSohne-Buch', sans-serif;
  }
</style>
