<script>
	import EcoSystemSVG from './EcoSystemSVG.svelte';
</script>

<section
	id="ecosystem"
	class="hidden bg-[#FDFEFF] md:flex flex-col items-start px-6 lg:px-[100px] w-full max-w-[1440px] mx-auto h-auto overflow-hidden py-16 lg:py-[60px]"
>
	<div class="flex flex-col items-center gap-[24px] w-full max-w-[1239px] h-auto mx-auto font-inter">
		<!-- Header (Frame 1000006014) -->
		<div class="flex flex-col items-center gap-[8px] w-full max-w-[817px] h-auto text-center">
			<!-- Title (Frame 1000005983) -->
			<div class="flex flex-row justify-center items-center p-[10px] gap-[10px] w-full max-w-[415px] h-auto">
				<h2
					class="w-full max-w-[395px] h-auto font-inter font-semibold text-[24px] leading-[29px] flex items-center justify-center text-center text-[#4267AD]"
				>
					The ClearSky Platform Ecosystem
				</h2>
			</div>

			<!-- Subtitle (Frame 1000005999) -->
			<div class="flex flex-row items-start p-0 gap-[10px] w-full max-w-[817px] h-auto">
				<p
					class="w-full max-w-[817px] h-auto font-inter font-normal text-[18px] leading-[22px] text-center text-[#1F2A44]"
				>
					When every stage improves and AI removes operational constraints, growth compounds.
				</p>
			</div>
		</div>

		<!-- Content Row (Frame 1000005996 / 1000006015) -->
		<div class="flex flex-col lg:flex-row items-center gap-[40px] lg:gap-[15px] w-full max-w-[1241px] h-auto">
			<!-- Left Column: Description (Group 1000005987) -->
			<div class="relative w-full max-w-[508px] h-auto min-h-[300px] lg:min-h-[621px]">
				<div class="relative lg:absolute left-0 lg:top-[155.5px] w-full max-w-[508px] flex flex-col gap-[24px]">
					<p class="font-inter font-normal text-[16px] leading-[22px] text-[#1F2A44]">
						The ClearSky platform connects <span class="text-[#4267AD]"
							>Discovery</span
						>,
						<span class="text-[#4267AD]">Engagement</span>,
						<span class="text-[#4267AD]">Conversion</span>, and
						<span class="text-[#4267AD]">Growth</span> into one integrated system.
					</p>
					<p class="font-inter font-normal text-[16px] leading-[22px] text-[#1F2A44]">
						While each module improves a specific stage of the customer journey, the real impact
						comes from the entire platform working together.
					</p>
					<p class="font-inter font-normal text-[16px] leading-[22px] text-[#1F2A44]">
						AI removes many of the operational constraints that normally limit response time,
						follow-up, and engagement — allowing these improvements to compound into projected
						revenue growth of
					</p>

					<!-- Revenue Badge (Group 1000005988) -->
					<div
						class=" relative w-[149.73px] h-[50.21px] flex items-center justify-center translate-x-[2.62px] mt-[-17px]"
						style="transform: matrix(1, -0.06, 0.13, 0.99, 0, 0);"
					>
						<div class="absolute inset-0 bg-[#F47B20]"></div>
						<span class="relative font-inter font-bold text-[30px] leading-[36px] text-white">
							72-118%
						</span>
					</div>
				</div>
			</div>

			<!-- Right Column: Card (Frame 1000006022) -->
			<div
				class="flex flex-col items-start p-6 lg:p-[18px_26px_18px_27px] gap-[10px] w-full max-w-[717px] h-auto min-h-[450px] lg:min-h-[621px] bg-white shadow-[3px_3px_10px_3px_rgba(0,0,0,0.09)] rounded-[10px]"
			>
				<div class="flex flex-col items-center gap-[10px] w-full h-auto">
					<!-- Card Header (Frame 1000006021) -->
					<div class="flex flex-col items-start p-0 gap-[7px] w-full max-w-[602px] h-auto">
						<p
							class="w-full max-w-[650px] font-inter font-normal text-[16px] leading-[21px] text-[rgba(31,42,68,0.8)]"
						>
							The ClearSky platform works as one connected system. <br/> Each stage of the customer
							journey — discovery, engagement, conversion, and <br/> growth — is supported by specialized
							tools that work together to drive revenue.
						</p>
						<p
							class="w-full max-w-[602px] font-inter font-normal text-[16px] leading-[19px] text-center text-[rgba(31,42,68,0.8)] mt-2"
						>
							Explore each stage to see how the system works together.
						</p>
					</div>

					<!-- Diagram (Group 1000005882) -->
					<div class="w-full max-w-[450px] lg:max-w-[664px] h-auto lg:h-[461px] flex items-center justify-center">
						<EcoSystemSVG />
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	#ecosystem {
		scroll-margin-top: 80px;
	}
</style>

