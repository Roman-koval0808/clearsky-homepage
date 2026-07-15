<script lang="ts">
	import { browser } from '$app/environment';

	let { open = $bindable(false) } = $props();

	function closeDialog() {
		open = false;
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			closeDialog();
		}
	}

	$effect(() => {
		if (open && browser) {
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = '';
			};
		}
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
		onclick={handleBackdropClick}
	>
		<div
			class="relative mx-auto max-w-7xl overflow-auto rounded-3xl bg-white shadow-2xl"
			style="max-height: 90vh; width: min(1436px, 95vw);"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Close Button -->
			<button
				onclick={closeDialog}
				class="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-800"
				aria-label="Close dialog"
			>
				×
			</button>

			<div class="p-8 md:p-12">
				<!-- Title -->
				<div class="mb-8 text-center">
					<h2 class="mb-3 font-sans text-3xl font-black leading-tight text-[#0F172B] md:text-4xl">
						ViewRoom: The Virtual Showroom That Closes Deals
					</h2>
					<div class="mx-auto h-1 w-24 rounded-full bg-[#F66922]"></div>
				</div>

				<!-- Description -->
				<div class="mb-10">
					<p class="font-sans text-base leading-relaxed text-gray-700 md:text-lg">
						ViewRoom is an interactive virtual sales environment embedded directly into your
						website, turning every visitor into a live, engaged prospect with a single click.
						Instead of static pages or scheduled calls, ViewRoom opens a branded digital room
						where the first person to arrive becomes the host and can invite others instantly.
					</p>
					<p class="mt-4 font-sans text-base leading-relaxed text-gray-700 md:text-lg">
						Inside, businesses can showcase videos, PDFs, photos, demos, proposals, and
						sector-specific assets—creating a true on-demand showroom. Visitors and hosts can
						co-watch content, chat in real time, and walk through options together. An
						integrated AI assistant answers questions, explains features, and escalates the
						session to a live representative when needed.
					</p>
					<p class="mt-4 font-sans text-base leading-relaxed text-gray-700 md:text-lg">
						With the native ViewRoom mobile app, reps can join from anywhere using multiple
						cameras to show job-site conditions, deliver product demos, or guide inspections
						in real time. This eliminates uncertainty—the biggest barrier to customer
						decisions. People don't need to imagine what you mean; they can see it. They
						understand their options clearly. They feel supported.
					</p>
					<p class="mt-4 font-sans text-base font-semibold leading-relaxed text-[#0F172B] md:text-lg">
						For trades, it clarifies scope and boosts quote acceptance. For tourism, it
						previews experiences. For manufacturers, it simplifies complex demos. For services,
						it makes explanations visual and effortless. ViewRoom is a virtual showroom, live
						demo space, and conversion engine—all in one—designed to make every interaction
						clearer, faster, and far more likely to end in "yes."
					</p>
				</div>

				<!-- What's the impact section -->
				<div class="mb-6">
					<h3 class="mb-6 font-sans text-2xl font-bold text-[#0F172B] md:text-3xl">
						What's the impact?
					</h3>

					<!-- Table Container -->
					<div class="flex flex-col gap-6 lg:flex-row">
						<!-- Table -->
						<div class="flex-1 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
							<table class="w-full border-collapse">
								<!-- Table Header -->
								<thead class="bg-gradient-to-r from-[#F66922]/10 to-[#F66922]/5">
									<tr>
										<th
											class="px-6 py-4 text-left font-sans text-sm font-bold uppercase tracking-wider text-[#0F172B]"
										>
											Sector
										</th>
										<th
											class="border-l border-gray-200 px-6 py-4 text-left font-sans text-sm font-bold uppercase tracking-wider text-[#0F172B]"
										>
											Conservative Lift
										</th>
										<th
											class="border-l border-gray-200 px-6 py-4 text-left font-sans text-sm font-bold uppercase tracking-wider text-[#0F172B]"
										>
											Why
										</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-100">
									<tr class="transition-colors hover:bg-gray-50">
										<td class="px-6 py-4 font-sans text-sm font-semibold text-[#0F172B]">
											Trades
										</td>
										<td class="border-l border-gray-200 px-6 py-4">
											<span
												class="inline-block rounded-full bg-[#F66922]/20 px-3 py-1 font-sans text-sm font-bold text-[#F66922]"
											>
												14-20%
											</span>
										</td>
										<td class="border-l border-gray-200 px-6 py-4 font-sans text-sm leading-relaxed text-gray-700">
											Visual walkthroughs + multi-camera demos drastically reduce uncertainty,
											boost quote acceptance, and shorten decision cycles
										</td>
									</tr>
									<tr class="transition-colors hover:bg-gray-50">
										<td class="px-6 py-4 font-sans text-sm font-semibold text-[#0F172B]">
											Tourism
										</td>
										<td class="border-l border-gray-200 px-6 py-4">
											<span
												class="inline-block rounded-full bg-[#F66922]/20 px-3 py-1 font-sans text-sm font-bold text-[#F66922]"
											>
												10-16%
											</span>
										</td>
										<td class="border-l border-gray-200 px-6 py-4 font-sans text-sm leading-relaxed text-gray-700">
											Experience previews and sales-assisted virtual tours significantly improve
											booking confidence.
										</td>
									</tr>
									<tr class="transition-colors hover:bg-gray-50">
										<td class="px-6 py-4 font-sans text-sm font-semibold text-[#0F172B]">
											Professional Services
										</td>
										<td class="border-l border-gray-200 px-6 py-4">
											<span
												class="inline-block rounded-full bg-[#F66922]/20 px-3 py-1 font-sans text-sm font-bold text-[#F66922]"
											>
												6-10%
											</span>
										</td>
										<td class="border-l border-gray-200 px-6 py-4 font-sans text-sm leading-relaxed text-gray-700">
											Improves clarity in consultations and onboarding; modest but meaningful lift
											for high-ticket services.
										</td>
									</tr>
									<tr class="transition-colors hover:bg-gray-50">
										<td class="px-6 py-4 font-sans text-sm font-semibold text-[#0F172B]">
											Manufacturing
										</td>
										<td class="border-l border-gray-200 px-6 py-4">
											<span
												class="inline-block rounded-full bg-[#F66922]/20 px-3 py-1 font-sans text-sm font-bold text-[#F66922]"
											>
												12-18%
											</span>
										</td>
										<td class="border-l border-gray-200 px-6 py-4 font-sans text-sm leading-relaxed text-gray-700">
											Complex products benefit from guided demos, reducing friction in procurement
											and increasing close rates
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						<!-- Placeholder Rectangles -->
						<div class="flex flex-col gap-4 lg:w-auto">
							<div
								class="flex h-[218px] w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 lg:w-[378px]"
							>
								<span class="text-sm font-medium text-gray-400">Image Placeholder</span>
							</div>
							<div
								class="flex h-[54px] w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 lg:w-[267px]"
							>
								<span class="text-sm font-medium text-gray-400">Image Placeholder</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
