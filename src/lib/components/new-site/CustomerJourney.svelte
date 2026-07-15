<script lang="ts">
	import WithClearksy from './WithClearksy.svelte';
	import WithoutClearsky from './WithoutClearsky.svelte';
</script>

<section class="hidden bg-white py-4 lg:flex flex-col items-center lg:pt-[38px] lg:pb-[42px] ">
	<div class="mx-auto w-full max-w-[1440px] px-[100px] flex flex-col items-center gap-[10px]">
		
		<!-- Frame 1000005983: Header Section -->
		<div class="mb-6 lg:mb-[24px] flex flex-col items-center gap-[10px] w-full max-w-[441px] h-[106px] text-center">
			
			<!-- Frame 1000005999: Badge -->
			<div class="flex items-center justify-center bg-[#FDFEFF] rounded-[40px] px-[16px] py-[8px] gap-[10px] w-[196px] h-[38px] ">
				<span class="font-['Inter'] text-[18px] font-bold leading-[22px] text-[#4267AD]">
					Customer Journey
				</span>
			</div>

			<h2 class="font-['Inter'] text-[24px] font-semibold leading-[29px] text-[rgba(31,42,68,0.8)]">
				Where Businesses Lose Customers
			</h2>
			<p class="font-['Inter'] text-[16px] font-normal leading-[19px] text-[rgba(31,42,68,0.8)]">
				Opportunities disappear throughout the customer journey.
			</p>
		</div>

		<div class="relative grid grid-cols-1 lg:grid-cols-2 lg:gap-x-4">
		

			<!-- Left Column: Without ClearSky -->
			<div
				class="flex flex-col rounded-[20px] shadow-[0px_6px_12px_0px_rgba(0,0,0,0.1)]"
			>
				<div class="mb-8 flex justify-center px-4 pt-10">
					<WithoutClearsky />
				</div>
				<!-- Footer Bar -->
				<div class=" rounded-full m-5 bg-[#D9D9D9] py-2 text-center">
					<span class="font-['Inter'] text-[28px] font-bold text-black">Lost Opportunities</span>
				</div>
			</div>

			<!-- Right Column: With ClearSky -->
			<div
				class="flex flex-col rounded-[20px] shadow-[0px_6px_12px_0px_rgba(0,0,0,0.1)]"
			>
				<div class="mb-8 flex justify-center px-4 pt-10">
					<WithClearksy />
				</div>
			</div>
		</div>
		<!-- Frame 1000006013: Footer Section -->
		<div class="mt-[16px] flex justify-center items-center w-full max-w-[777px] h-[26px] gap-[10px] text-center">
			<p class="w-full font-['Inter'] text-[16px] font-semibold leading-[19px] text-[#131217]">
				ClearSky fixes every stage of the customer journey — turning missed interactions into booked work.
			</p>
		</div>
	</div>
</section>

<style>
	/* Custom styles for the Customer Journey component */
	section {
		font-family: 'Inter', sans-serif;
	}
</style>
