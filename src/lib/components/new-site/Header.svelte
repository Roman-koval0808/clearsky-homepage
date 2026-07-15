<script lang="ts">
	import MainLogo from './logos/MainLogo.svelte';

	let open = $state(false);
	const menuItems = [
		{ label: 'Discovery', href: '/discovery' },
		{ label: 'Engagement', href: '/engagement' },
		{ label: 'Conversion', href: '/conversion' },
		{ label: 'Growth', href: '/growth' },
		{ label: 'Sectors', href: '/sectors' },
		{ label: 'About Us', href: '/about' }
	];
</script>

<header class="z-50 w-full border-b border-slate-100 bg-white shadow-[0px_4px_10px_0px_#00000040]">
	<div class="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-8">
		<!-- Logo -->
		<a href="/" class="flex shrink-0 items-center gap-3">
			<MainLogo />
		</a>

		<!-- Desktop Menu (Centered as much as possible) -->
		<nav class="hidden items-center gap-8 lg:flex xl:gap-10">
			{#each menuItems as item (item.label)}
				<a
					href={item.href}
					class="nav-link font-['Inter'] text-[16px] font-semibold text-[#4267AD]"
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<!-- CTAs -->
		<div class="hidden shrink-0 items-center lg:flex">
			<a
				href="/founders-program"
				class="rounded-full bg-[#4267AD] px-[16px] py-[10px] text-[16px] font-semibold text-white shadow-md transition-all hover:bg-[#4267AD]/90 active:scale-95"
			>
				Founders Program
			</a>
		</div>

		<!-- Mobile Menu Button -->
		<button
			class="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-white text-black shadow-[0px_4px_4px_0px_#00000040] transition-all active:scale-95 lg:hidden"
			onclick={() => (open = !open)}
			aria-label="Toggle menu"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				{#if open}
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				{:else}
		
					<line x1="6" y1="7" x2="22" y2="7"></line>
					<line x1="6" y1="12" x2="19" y2="12"></line>
										<line x1="6" y1="17" x2="16" y2="17"></line>
				{/if}
			</svg>
		</button>
	</div>

	<!-- Mobile Menu -->
	{#if open}
		<div class="absolute top-24 left-0 z-40 w-full bg-white p-6 shadow-xl lg:hidden">
			<nav class="mb-8 flex flex-col gap-6">
				{#each menuItems as item (item.label)}
					<a
						href={item.href}
						class="border-b border-slate-50 pb-2 text-xl font-bold text-brand-blue"
						onclick={() => (open = false)}
					>
						{item.label}
					</a>
				{/each}
			</nav>
			<a
				href="/founders-program"
				class="inline-block w-full rounded-full bg-[#2E5B9A] py-4 text-center font-bold text-white shadow-lg"
				onclick={() => (open = false)}
			>
				Founders Program
			</a>
		</div>
	{/if}
</header>
