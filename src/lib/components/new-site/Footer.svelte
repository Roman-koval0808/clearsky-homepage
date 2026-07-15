<script lang="ts">
	const steps = [
		{ title: 'Analysis', icon: 'M13 7h8m0 0v8m0-8-8 8-4-4-6 6' },
		{ title: 'Configuration', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
		{ label: '$75.00/mo', title: 'Phase 1 Ready', icon: 'M12 1v22m11-11H1' }
	];

	const footerLinks = [
		{ label: 'Solutions', links: ['Local Business', 'Tourism', 'Manufacturing'] },
		{ label: 'Platform', links: ['AI Assistant', 'Communications Hub', 'ViewRoom'] },
		{ label: 'Company', links: ['About Us', 'Contact', 'Resources'] }
	];

	const socialIcons = [
		{ id: 1, path: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z' },
		{ id: 2, path: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z' },
		{ id: 3, path: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z' }
	];
</script>

<section class="hidden overflow-hidden bg-white py-20 md:block lg:py-32">
	<div class="mx-auto max-w-7xl px-6 text-center">
		<div class="mb-20 flex flex-col items-center">
			<span class="mb-4 text-xs font-black tracking-[0.4em] text-brand-orange uppercase italic"
				>Next Step Forward</span
			>
			<h2 class="text-3xl font-black text-brand-blue lg:text-5xl">
				Phase 1 Readiness Advantage <br /><span class="text-brand-orange-light"
					>Starts from Only $75.00/mo</span
				>
			</h2>
			<div class="mt-8 h-1.5 w-32 rounded-full bg-brand-orange"></div>
		</div>

		<div class="mx-auto mb-24 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
			{#each steps as step (step.title)}
				<div
					class="group border-brand-subtle-blue/60 flex flex-col items-center rounded-[40px] border-2 p-12 transition-all duration-300 hover:border-brand-orange hover:shadow-2xl"
				>
					<div
						class="bg-brand-subtle-blue/50 mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-white text-brand-blue shadow-xl transition-all group-hover:bg-brand-orange group-hover:text-white"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d={step.icon}></path>
						</svg>
					</div>
					<p class="mb-2 text-[10px] font-black text-brand-orange uppercase italic">
						{step.label || 'Step Sequence'}
					</p>
					<h5 class="text-xl font-black text-brand-blue">{step.title}</h5>
				</div>
			{/each}
		</div>

		<!-- Final Buttons -->
		<div class="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
			<button class="btn-primary h-20 w-full px-12 text-base font-black tracking-widest sm:w-auto">
				CHECK AVAILABILITY
			</button>
			<button
				class="btn-outline h-20 w-full border-brand-blue px-12 text-base font-black tracking-widest text-brand-blue hover:bg-brand-blue hover:text-white sm:w-auto"
			>
				DOWNLOAD PDF
			</button>
			<button class="demo-button h-20 w-full px-12 text-base font-black tracking-widest sm:w-auto">
				BOOK A DEMO
			</button>
		</div>
	</div>
</section>

<footer class="overflow-hidden bg-brand-blue py-20 lg:pt-32 lg:pb-16">
	<div class="mx-auto max-w-7xl px-6">
		<div class="mb-24 grid grid-cols-2 gap-12 sm:grid-cols-2 lg:grid-cols-5">
			<!-- Col 1: Brand -->
			<div class="col-span-2 lg:col-span-2">
				<a href="/" class="mb-8 flex items-center gap-2">
					<img
						src="/new-logo-2.png"
						alt="ClearSky Logo"
						class="h-12 w-auto object-contain brightness-0 invert"
					/>
					<span class="font-outfit text-2xl font-black text-white">ClearSky Analytics</span>
				</a>
				<p class="mb-8 max-w-xs leading-relaxed font-medium text-white/50">
					Empowering modern businesses with high-impact conversational AI and automated operations.
				</p>
				<div class="flex gap-4">
					{#each socialIcons as icon (icon.id)}
						<div
							class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 text-white transition-all hover:border-brand-orange hover:bg-brand-orange"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d={icon.path}></path>
							</svg>
						</div>
					{/each}
				</div>
			</div>

			<!-- Links columns -->
			{#each footerLinks as group (group.label)}
				<div class="col-span-1">
					<h6 class="mb-8 text-sm font-black tracking-widest text-white uppercase">
						{group.label}
					</h6>
					<ul class="space-y-4">
						{#each group.links as link (link)}
							<li>
								<a
									href="/"
									class="font-semibold text-white/60 transition-colors hover:text-brand-orange"
									>{link}</a
								>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<!-- Bottom Bar -->
		<div
			class="flex flex-col items-center justify-between gap-8 border-t border-white/10 pt-12 sm:flex-row"
		>
			<p class="text-sm font-medium text-white/30 italic">
				© 2026 ClearSky Analytics. All rights reserved.
			</p>
			<div class="flex gap-8">
				<a
					href="/privacy"
					class="text-xs font-black tracking-widest text-white/40 uppercase hover:text-white"
					>Privacy Policy</a
				>
				<a
					href="/terms"
					class="text-xs font-black tracking-widest text-white/40 uppercase hover:text-white"
					>Terms of Service</a
				>
			</div>
		</div>
	</div>
</footer>

<style>
	.demo-button {
		background-color: #ffffff;
		color: #243144;
		border: 1px solid #e2e8f0;
		border-radius: 15px;
		cursor: pointer;
		outline: none;
		position: relative;
		transition: all 0.2s ease;
		box-shadow: 0px 2px 2px 2px #f47b20ab;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 900;
	}

	.demo-button:hover {
		transform: scale(1.02);
		box-shadow: 0px 3px 4px 2px #f47b20ab;
	}

	.demo-button:active {
		transform: scale(0.98);
		box-shadow: 0px 1px 1px 1px #f47b20ab;
	}
</style>
