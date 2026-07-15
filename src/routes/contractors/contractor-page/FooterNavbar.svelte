<script>
	const links = ['Discovery', 'Engagement', 'Conversion', 'Growth', 'Sectors', 'About Us'];
</script>

<footer class="flex flex-col items-start px-[100px] py-[24px] gap-[10px] w-[1440px] bg-[#4267ad] mx-auto box-border">
	<div class="flex flex-row items-center p-0 gap-[146px] w-[1031px]">
		<div class="relative w-[230px] h-[68px]">
			<div class="absolute w-[250px] h-[97px] left-[-12px] top-[-16px] bg-white z-0"></div>
			<div class="relative w-[230px] h-[68px] bg-[#d9d9d9] z-10">
				<!-- clearskyLogoSmall 1.jpg -->
			</div>
		</div>

		<div class="flex flex-row items-center p-0 gap-[40px] w-[655px] h-[19px]">
			{#each links as link (link)}
				<a href="#{link.toLowerCase().replace(' ', '-')}" class="w-auto h-[19px] font-['Inter'] font-semibold text-[16px] leading-[19px] text-center text-white no-underline whitespace-nowrap">{link}</a>
			{/each}
		</div>
	</div>
</footer>

<style>
</style>
