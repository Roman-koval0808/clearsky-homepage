<script>

	import Challenge1 from './Challenge1.svelte';
	import Challenge2 from './Challenge2.svelte';
	import Challenge3 from './Challenge3.svelte';
</script>

<section class="bg-[#FDFEFF] w-full overflow-hidden">
	<!-- Desktop View (Original) -->
	<div class="hidden md:flex lg:px-8 xl:px-[100px] py-16 lg:py-[30px] md:min-h-fit xl:h-[448px] flex-col items-center">
		<div class="mx-auto w-full max-w-[1440px] flex flex-col justify-center items-center">
			<!-- Frame 1000005997: Main Content Wrapper -->
			<div class="flex flex-col items-center gap-[24px] w-full max-w-[1239px]">
				<!-- Frame 1000005983: Title Section -->
				<div class="flex justify-center items-center p-[10px] gap-[10px] w-full max-w-[645px] h-auto lg:h-[49px]">
				<h2 class="w-full text-center font-['Inter'] text-[24px] font-semibold leading-[29px] text-[#4267AD]">
						Every missed interaction costs your business revenue
					</h2>
				</div>

				<!-- Frame 1000005996: Desktop Cards Container -->
				<div class="flex flex-col lg:flex-row items-center justify-center gap-[24px] lg:gap-[15px] w-full max-w-[1239px] h-auto xl:h-[254px]">
					<!-- Card 1 -->
					<div
						class="flex flex-col items-center w-full max-w-[403px] h-auto lg:h-[254px] bg-white rounded-[20px] px-6 xl:px-[66px] py-[24px] gap-[24px] shadow-[0px_6px_12px_rgba(0,0,0,0.1)]"
					>
						<div class="flex flex-row items-center gap-[24px] w-[193px] h-[73px]">
							<div class="w-[73px] h-[73px]">
								<Challenge1 />
							</div>
							<span
								class="w-[100px] text-[48px] font-semibold leading-[58px] text-[#4267AD] flex items-center justify-center"
								>73%</span
							>
						</div>
						<div class="flex flex-col items-center gap-[16px] w-full max-w-[271px]">
							<div class="flex flex-col items-center gap-[8px] w-full">
								<h3
									class="w-full text-center text-[16px] font-semibold leading-[19px] text-[#1F2A44]"
								>
									Customers Contact Businesses Across Multiple Channels
								</h3>
								<p
									class="w-full text-center text-[14px] font-normal leading-[17px] text-[#1F2A44]"
								>
									Phone, website, email, and social media must work together.
								</p>
							</div>
							<p
								class="w-full text-center text-[11px] font-normal italic leading-[13px] text-[#595959]"
							>
								Source: Harvard Business Review
							</p>
						</div>
					</div>

					<!-- Card 2 -->
					<div
						class="flex flex-col items-center w-full max-w-[403px] h-auto lg:h-[254px] bg-white rounded-[20px] px-6 xl:px-[66px] py-[24px] gap-[24px] shadow-[0px_6px_12px_rgba(0,0,0,0.1)]"
					>
						<div class="flex flex-row items-center gap-[24px] w-[193px] h-[73px]">
							<div class="w-[73px] h-[73px]">
								<Challenge2 />
							</div>
							<span
								class="w-[103px]  text-[48px] font-semibold leading-[58px] text-[#4267AD] flex items-center justify-center"
								>98%</span
							>
						</div>
						<div class="flex flex-col items-center gap-[16px] w-full max-w-[271px]">
							<div class="flex flex-col items-center gap-[8px] w-full">
								<h3
									class="w-full text-center text-[16px] font-semibold leading-[19px] text-[#000000]"
								>
									Most Website Visitors Never Engage
								</h3>
								<p
									class="w-full text-center text-[14px] font-normal leading-[17px] text-[#1F2A44]"
								>
									Without interaction tools, potential customers leave without contacting you.
								</p>
							</div>
							<p
								class="w-full text-center text-[11px] font-normal italic leading-[13px] text-[#595959]"
							>
								Source: LeadConnect Lead Response Study
							</p>
						</div>
					</div>

					<!-- Card 3 -->
					<div
						class="flex flex-col items-center w-full max-w-[403px] h-auto lg:h-[254px] bg-white rounded-[20px] px-6 xl:px-[66px] py-[24px] gap-[24px] shadow-[0px_6px_12px_rgba(0,0,0,0.1)]"
					>
						<div class="flex flex-row items-center gap-[24px] w-[193px] h-[73px]">
							<div class="w-[73px] h-[73px]">
								<Challenge3 />
							</div>
							<span
								class="w-[99px]  text-[48px] font-semibold leading-[58px] text-[#4267AD] flex items-center justify-center"
								>78%</span
							>
						</div>
						<div class="flex flex-col items-center gap-[16px] w-full max-w-[271px]">
							<div class="flex flex-col items-center gap-[8px] w-full">
								<h3
									class="w-full text-center text-[16px] font-semibold leading-[19px] text-[#1F2A44]"
								>
									Speed Determines Who Wins the Customer
								</h3>
								<p
									class="w-full text-center text-[14px] font-normal leading-[17px] text-[#1F2A44]"
								>
									Responding within minutes dramatically increases conversions.
								</p>
							</div>
							<p
								class="w-full text-center text-[11px] font-normal italic leading-[13px] text-[#595959]"
							>
								Source: MIT Lead Management Study
							</p>
						</div>
					</div>
				</div>

				<!-- Footer Section -->
				<div class="flex justify-center items-center w-full max-w-[700px] h-auto lg:h-[37px] mt-8 lg:mt-0">
					<p class="w-full text-center text-[16px] font-medium leading-[22px] lg:leading-[19px] text-[#1F2A44]">
						Businesses lose opportunities when conversations are missed or delayed. 
						ClearSky <br/> ensures every interaction is captured and acted upon.
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Mobile View (Frame 1000006060 Specs) -->
	<div class="lg:hidden flex flex-col items-center px-4 pt-[50px] pb-[50px] lg:pb-[30px] w-full max-w-[390px] mx-auto gap-[20px]">
		<!-- Title -->
		<div class="flex items-center justify-center w-full min-h-[62px]">
			<h2 class="text-[#4267AD] text-[24px] font-semibold leading-[31px] text-center">
				Every missed interaction costs your business revenue
			</h2>
		</div>

		<!-- Divider Top -->
		<div class="w-full h-[1px] bg-[#C3C2C3] opacity-50"></div>

		<!-- Stats Grid -->
		<div class="flex flex-col w-full gap-[8px]">
			<!-- Stat 1 -->
			<div class="flex flex-col items-center gap-[16px] w-full border-b border-[#C3C2C3] pb-[20px]">
				<div class="flex flex-row items-center gap-[8px] w-full justify-center">
					<span class="text-[#4267AD] text-[48px] leading-[62px] font-sohne font-semibold shrink-0">73%</span>
					<p class="text-[#4267AD] text-[14px] font-sohne leading-[18px] font-semibold max-w-[170px]">
						of Customers Contact Businesses Multiple Ways
					</p>
				</div>
				<div class="flex flex-col items-center gap-[8px] w-full">
					<p class="text-[#1F2A44] text-[14px] leading-[19px] text-center max-w-[300px] font-bold">
						Phone, website, email, and social media <br/> must work together.
					</p>
					<p class="text-[#595959] text-[11px] leading-[14px] italic text-center">
						Source: Harvard Business Review
					</p>
				</div>
			</div>

			<!-- Stat 2 -->
			<div class="flex flex-col items-center gap-[16px] w-full border-b border-[#C3C2C3] pb-[20px]">
				<div class="flex flex-row items-center gap-[8px] w-full justify-center">
					<span class="text-[#4267AD] text-[48px] leading-[62px] font-sohne font-semibold shrink-0">98%</span>
					<p class="text-[#4267AD] text-[14px] font-sohne leading-[18px] font-semibold max-w-[170px]">
						of Website Visitors <br/> Never Engage & leave.
					</p>
				</div>
				<div class="flex flex-col items-center gap-[8px] w-full">
					<p class="text-[#1F2A44] text-[14px] leading-[19px] text-center max-w-[300px] font-bold">
						Without interaction tools, potential <br/> customers don't have a reason to stay.
					</p>
					<p class="text-[#595959] text-[11px] leading-[14px] italic text-center">
						Source: Harvard Business Review
					</p>
				</div>
			</div>

			<!-- Stat 3 -->
			<div class="flex flex-col items-center gap-[16px] w-full border-b border-[#C3C2C3] pb-[20px]">
				<div class="flex flex-row items-center gap-[8px] w-full justify-center">
					<span class="text-[#4267AD] text-[48px] leading-[62px] font-sohne font-semibold shrink-0">78%</span>
					<p class="text-[#4267AD] text-[14px] font-sohne leading-[18px] font-semibold max-w-[170px]">
						buy from the first <br/> company responding.
					</p>
				</div>
				<div class="flex flex-col items-center gap-[8px] w-full">
					<p class="text-[#1F2A44] text-[14px] leading-[19px] text-center max-w-[300px] font-bold">
						Responding within minutes dramatically increases conversions.
					</p>
					<p class="text-[#595959] text-[11px] leading-[14px] italic text-center">
						Source: MIT Lead Management Study
					</p>
				</div>
			</div>
		</div>

		<!-- Footer Segment -->
		<div class="flex items-center justify-center w-full pt-[30px] lg:pb-8">
			<p class="text-[#1F2A44] text-[14px] leading-[20px] text-center max-w-[340px] font-semibold">
				Businesses lose opportunities when conversations are missed or delayed. <br/>ClearSky ensures every interaction is <br/> captured and acted upon.
			</p>
		</div>
	</div>

</section>


