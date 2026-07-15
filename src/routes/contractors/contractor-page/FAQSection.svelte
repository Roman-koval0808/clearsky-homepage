<script lang="ts">
	let faqs = $state([
		{
			question: 'How does ClearSky help contractors win more local work?',
			answer: 'ClearSky improves your online visibility and lead capture, ensuring that homeowners in your area find your business when they need your services.',
			active: false
		},
		{
			question: 'What parts of the customer journey does ClearSky improve?',
			answer:
				'Founders help shape the platform. Real-world performance data improves workflows, automation, and AI recommendations.',
			active: true
		},
		{
			question:
				'Can homeowners interact with visuals, galleries, or project examples before requesting a quote?',
			answer: 'Yes, ClearSky offers interactive galleries and project showcases that allow homeowners to visualize the quality and variety of your work.',
			active: false
		},
		{
			question: 'How much will ClearSky cost for my business?',
			answer: 'We offer flexible pricing plans tailored to the size and needs of your contracting business. Contact us for a detailed quote.',
			active: false
		},
		{
			question: 'What happens if I’m not happy with the platform?',
			answer: 'We offer a satisfaction guarantee and flexible cancellation policies to ensure you feel confident in your investment.',
			active: false
		}
	]);

	function toggleFaq(index: number) {
		faqs[index].active = !faqs[index].active;
	}
</script>

<section class="flex flex-col items-center px-4 lg:px-[100px] lg:py-10 gap-[24px] max-w-[1440px] w-full mx-auto box-border">
	<div class="flex flex-col justify-center items-center p-0 gap-[10px] w-full max-w-[143px] h-auto">
		<div class="flex flex-row justify-center items-center py-[8px] px-[16px] gap-[10px] w-full h-[38px] bg-[#fdfeff] rounded-[40px] text-[#4267ad] font-['Inter'] font-bold text-[18px] ">Get In Touch</div>
		<h2 class="w-auto h-[29px] font-['Inter'] font-semibold text-[24px] leading-[29px] text-[rgba(31,42,68,0.8)] m-0">FAQs</h2>
	</div>


	<div class="flex flex-col lg:flex-row items-center p-0 gap-[15px] max-w-[1239px] w-full min-h-auto lg:min-h-[519px]">
		<div class="box-border flex flex-col items-start p-[16px] lg:p-[24px] gap-[24px] w-full lg:w-[926px] h-auto bg-[#4267ad] shadow-[0px_6px_12px_rgba(0,0,0,0.1)] rounded-[20px]">
			<div class="flex flex-col gap-[8px] w-full">
				{#each faqs as faq, i (faq.question)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div 
						class="box-border flex flex-row items-center py-[12px] px-[12px] lg:px-[16px] gap-[10px] w-full max-w-[878px] min-h-[60px] border-2 border-white rounded-[10px] text-white cursor-pointer transition-all duration-300 hover:drop-shadow-[0px_0px_8px_#ffffff] {faq.active ? 'h-auto py-4 lg:py-6' : ''}"
						onclick={() => toggleFaq(i)}
					>
						<div class="flex flex-col justify-center items-start gap-[8px] grow">
							<span class="font-['Inter'] font-semibold text-[15px] lg:text-[18px] leading-[20px] lg:leading-[22px]">{faq.question}</span>
							{#if faq.active && faq.answer}
								<p class="font-['Inter'] font-normal text-[14px] lg:text-[16px] leading-[17px] lg:leading-[19px] m-0">{faq.answer}</p>
							{/if}
						</div>
						<div class="w-[32px] lg:w-[44px] h-[32px] lg:h-[44px] flex justify-center items-center shrink-0">
							<svg width="32" height="32" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform duration-300 {faq.active ? 'rotate-180' : ''} hidden lg:block">
								<path d="M31.1666 16.5003L22 25.667L12.8333 16.5003" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform duration-300 {faq.active ? 'rotate-180' : ''} block lg:hidden">
								<path d="M19 9L12 16L5 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<img src="/img/contractors/faq-image.png" class="w-full max-w-[299px] h-auto lg:h-[519px] bg-[#d9d9d9] rounded-[20px] hidden lg:block" alt="FAQ"/>
	</div>

</section>

<style>
</style>
