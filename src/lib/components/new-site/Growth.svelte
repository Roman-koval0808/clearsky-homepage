<script lang="ts">
	const factors = [
		{
			title: 'Discovery',
			value: '+15–30%',
			desc: 'Optimizing your websites conversions and SEO through AI.'
		},
		{
			title: 'Engagement',
			value: '+12–25%',
			desc: 'AI instant response time and sentiment based replies.'
		},
		{
			title: 'Experience',
			value: '+20–35%',
			desc: 'Guided walkthroughs and expertise driven trust building.'
		},
		{
			title: 'Results',
			value: '+10–20%',
			desc: 'Streamlining the booking process and transaction flow.'
		}
	];

	const partners = [1, 2, 3, 4, 5, 6];
</script>

<section class="bg-brand-subtle-blue/20 overflow-hidden py-20 lg:py-32">
	<div class="mx-auto max-w-7xl px-6 text-center">
		<div class="mb-20 flex flex-col items-center">
			<span class="mb-4 text-xs font-black tracking-[0.3em] text-brand-orange uppercase"
				>Revenue Impact</span
			>
			<h2 class="text-3xl font-bold tracking-tight text-brand-blue lg:text-5xl">
				How the ClearSky Growth Engine <br /><span class="font-black text-brand-orange-light italic"
					>Drives Revenue</span
				>
			</h2>
			<p class="mt-4 max-w-2xl font-medium text-text-dark/60">
				Visualizing the compounded impact of AI automation on your bottom line
			</p>
		</div>

		<!-- Growth Graph / Process Flow -->
		<div class="mb-24 flex flex-col items-center">
			<div class="mb-16 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{#each factors as factor (factor.title)}
					<div
						class="glass border-brand-subtle-blue/40 group flex flex-col items-center rounded-3xl border-2 p-8 transition-all hover:-translate-y-2 hover:border-brand-orange"
					>
						<span
							class="mb-2 text-xs font-black text-brand-blue/50 uppercase group-hover:text-brand-orange"
							>{factor.title}</span
						>
						<p class="mb-4 font-outfit text-4xl font-black text-brand-blue">{factor.value}</p>
						<p class="text-[10px] leading-relaxed font-bold text-text-dark/50 uppercase italic">
							{factor.desc}
						</p>
					</div>
				{/each}
			</div>

			<!-- Downward Arrows SVG -->
			<svg class="mb-10 animate-bounce" width="60" height="120" viewBox="0 0 60 120">
				<path
					d="M30 0 L30 120 M10 100 L30 120 L50 100"
					stroke="var(--color-brand-blue)"
					stroke-width="3"
					fill="none"
					opacity="0.3"
				></path>
			</svg>

			<!-- Center Lift HEX -->
			<div class="group relative">
				<div
					class="absolute -inset-10 animate-pulse rounded-full bg-brand-orange/20 blur-2xl"
				></div>

				<div
					class="hex-container relative z-10 flex h-64 w-64 flex-col items-center justify-center bg-brand-blue text-white shadow-2xl transition-transform group-hover:scale-110"
				>
					<div class="mb-2 text-xs font-black tracking-[0.2em] text-brand-orange uppercase">
						TOTAL IMPACT
					</div>
					<p class="mb-2 font-outfit text-6xl font-black">72-118%</p>
					<div class="text-sm font-black tracking-widest text-white/50 uppercase">REVENUE LIFT</div>

					<!-- Corner accents -->
					<div
						class="absolute top-4 right-4 h-6 w-6 border-t-4 border-r-4 border-brand-orange"
					></div>
					<div
						class="absolute bottom-4 left-4 h-6 w-6 border-b-4 border-l-4 border-brand-orange"
					></div>
				</div>
			</div>
		</div>

		<!-- Social Proof Logos -->
		<div
			class="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale transition-all hover:opacity-80 hover:grayscale-0 sm:gap-16"
		>
			{#each partners as i}
				<div
					class="flex h-10 w-32 items-center justify-center rounded-lg bg-slate-200 text-sm font-black text-slate-400"
				>
					PARTNER 0{i}
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.hex-container {
		clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
	}
</style>
