<script>
	const links = ['Discovery', 'Engagement', 'Conversion', 'Growth', 'Sectors', 'About Us'];
</script>

<nav class="flex flex-col items-start px-[100px] py-[24px] gap-[10px] w-[1440px] h-[116px] bg-[#fdfeff] box-border mx-auto">
	<div class="flex flex-row items-center p-0 gap-[146px] w-[1240px] h-[68px]">
		<div class="flex flex-col items-start p-0 gap-[10px] w-[230px] h-[68px]">
			<div class="w-[230px] h-[68px] bg-[#d9d9d9]">
				<!-- clearskyLogoSmall 1.jpg -->
			</div>
		</div>

		<div class="flex flex-row items-center p-0 gap-[32px] w-[864px] h-[39px]">
			<div class="flex flex-row items-center p-0 gap-[40px] w-[655px] h-[19px]">
				{#each links as link (link)}
					<a href="#{link.toLowerCase().replace(' ', '-')}" class="w-auto h-[19px] font-['Inter'] font-semibold text-[16px] leading-[19px] text-center text-[#4267ad] no-underline whitespace-nowrap">{link}</a>
				{/each}
			</div>

			<button class="flex flex-row justify-center items-center py-[10px] px-[16px] gap-[10px] w-[177px] h-[39px] bg-[#4267ad] shadow-[0px_2px_6px_rgba(86,125,200,0.3)] rounded-[40px] border-none cursor-pointer text-white font-['Inter'] font-semibold text-[16px] leading-[19px] text-center">
				<span class="w-[145px] h-[19px]">Founder’s Program</span>
			</button>
		</div>
	</div>
</nav>

<style>
</style>
