<script lang="ts">
	const companies = [
		{
			name: 'McKinsey',
			src: '/companies/mckinsey-company-logo-png-transparent 2 (Traced).svg',
			mw: 94.48,
			mh: 9.4,
			h: 'h-6'
		},
		{ name: 'Gartner', src: '/companies/gartner.svg', mw: 59.05, mh: 11.27, h: 'h-[32px]' },
		{
			name: 'HBR',
			src: '/companies/harvard-business-review-logo-png_seeklogo-302574 1 (Traced).svg',
			mw: 52.61,
			mh: 27.25,
			h: 'h-[40px]'
		},
		{ name: 'Salesforce', src: '/companies/salesforce.svg', mw: 53.69, mh: 32.88, h: 'h-[36px]' },
		{ name: 'HubSpot', src: '/companies/hubspot.svg', mw: 65.81, mh: 19.73, h: 'h-[40px]' },
		{ name: 'Google', src: '/companies/google.svg', mw: 75, mh: 18.6, h: 'h-[40px]' },
		{
			name: 'BrightLocal',
			src: '/companies/brightlocal-logo-png_seeklogo-424435 1 (Traced).svg',
			mw: 81.6,
			mh: 13.15,
			h: 'h-[28px]'
		}
	];
</script>

<div class="w-full">
	<!-- Mobile Layout (3 icons top, 4 bottom) -->
	<div class="mx-auto flex h-auto max-w-[320px] flex-col justify-between md:hidden gap-3">
		<div class="flex w-full items-center justify-center gap-8">
			{#each companies.slice(0, 3) as company (company.name)}
				<img
					src={company.src}
					alt={company.name}
					style="width: {company.mw}px; height: {company.mh}px;"
					class="object-contain"
				/>
			{/each}
		</div>
		<div class="flex w-full items-center justify-center gap-6">
			{#each companies.slice(3) as company (company.name)}
				<img
					src={company.src}
					alt={company.name}
					style="width: {company.mw}px; height: {company.mh}px;"
					class="object-contain"
				/>
			{/each}
		</div>
	</div>

	<!-- Desktop Layout: 1140px width one-liner -->
	<div
		class="mx-auto hidden max-w-[1140px] items-center justify-between px-4 md:flex"
	>
		{#each companies as company (company.name)}
			<img
				src={company.src}
				alt={company.name}
				class="{company.h} w-auto object-contain grayscale transition-all duration-300 hover:grayscale-0"
			/>
		{/each}
	</div>
</div>
