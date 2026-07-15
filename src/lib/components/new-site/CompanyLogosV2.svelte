<script lang="ts">
	const companies = [
		{
			name: 'HBR',
			src: '/companies/harvard-business-review-logo-png_seeklogo-302574 1 (Traced).svg',
			mw: 52.61,
			mh: 27.25,
			h: 'h-10'
		},
		{ name: 'Gartner', src: '/companies/gartner.svg', mw: 59.05, mh: 11.27, h: 'h-8' },
		{ name: 'Salesforce', src: '/companies/salesforce.svg', mw: 53.69, mh: 32.88, h: 'h-9' },
		{ name: 'HubSpot', src: '/companies/hubspot.svg', mw: 65.81, mh: 19.73, h: 'h-10' },
		{
			name: 'McKinsey',
			src: '/companies/mckinsey-company-logo-png-transparent 2 (Traced).svg',
			mw: 94.48,
			mh: 9.4,
			h: 'h-6'
		},
		{
			name: 'BrightLocal',
			src: '/companies/brightlocal-logo-png_seeklogo-424435 1 (Traced).svg',
			mw: 81.6,
			mh: 13.15,
			h: 'h-7'
		},
		{ name: 'Google', src: '/companies/google.svg', mw: 75, mh: 18.6, h: 'h-10' }
	];
</script>

<div class="w-full">
	<!-- Mobile Layout: 4 on top, 3 bottom -->
	<div class="mx-auto flex h-[62.01px] max-w-[306.01px] flex-col justify-between md:hidden">
		<div class="flex w-full items-center justify-between px-1">
			{#each companies.slice(0, 4) as company (company.name)}
				<img
					src={company.src}
					alt={company.name}
					style="width: {company.mw}px; height: {company.mh}px;"
					class="object-contain grayscale"
				/>
			{/each}
		</div>
		<div class="flex w-full items-center justify-between px-2">
			{#each companies.slice(4) as company (company.name)}
				<img
					src={company.src}
					alt={company.name}
					style="width: {company.mw}px; height: {company.mh}px;"
					class="object-contain grayscale"
				/>
			{/each}
		</div>
	</div>

	<!-- Desktop Layout: All in one line -->
	<div
		class="hidden w-full items-center justify-between md:flex md:flex-wrap md:gap-x-12 md:gap-y-10"
	>
		{#each companies as company (company.name)}
			<img
				src={company.src}
				alt={company.name}
				class="{company.h} w-auto object-contain grayscale hover:grayscale-0"
			/>
		{/each}
	</div>
</div>
