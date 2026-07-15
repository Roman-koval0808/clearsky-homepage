<script lang="ts">
	interface Props {
		icon: string;
		title: string;
		subTitle: string;
		body: string;
		linkText: string;
		onclick: () => void;
		videoId: string;
	}

	let { icon, title, subTitle, body, linkText, onclick, videoId }: Props = $props();

	// Gray placeholder background with a red play button style for "youtube"
</script>

<div class="box-border flex flex-col items-center px-[8px] py-[20px] lg:p-[24px] gap-[16px] w-full max-w-[310px] lg:max-w-[298px] bg-white shadow-[0px_6px_12px_rgba(0,0,0,0.1)] rounded-[20px]">
	<div class="flex justify-center items-center w-[64px] h-[64px] bg-[#4267ad] rounded-full shrink-0">
		{@html icon}
	</div>

	<div class="flex flex-col items-center p-0 gap-[16px] w-full">
		<div class="flex flex-col items-center p-0 gap-[8px] w-full">
			<h3 class="w-auto h-auto min-h-[24px] font-['Inter'] font-semibold lg:font-bold text-[22px] lg:text-[20px] leading-[24px] flex items-center text-center text-[#4267ad] m-0">{title}</h3>
			<p class="lg:w-full h-auto min-h-[38px] font-['Inter'] font-semibold lg:text-[16px] text-[15px] leading-[19px] flex items-center text-center text-[rgba(31,42,68,0.8)] m-0 lg:whitespace-normal whitespace-break-spaces">{subTitle}</p>
		</div>

		<button 
			class="w-full aspect-[234/148.5] bg-[#0F172A] relative flex justify-center items-center cursor-pointer border-none p-0 group overflow-hidden rounded-[10px] shadow-sm"
			onclick={onclick}
			aria-label="Watch video"
		>
			<iframe
				class="absolute inset-0 w-full h-full pointer-events-none scale-110"
				src="https://www.youtube.com/embed/{videoId}?controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3"
				title="YouTube video player"
				frameborder="0"
			></iframe>
		</button>

		<div class="flex flex-col items-center p-0 gap-[16px] w-full">
			<p class="lg:w-full h-auto min-h-auto lg:min-h-[68px] font-['Inter'] font-semibold text-[13px] lg:text-[14px] leading-[17px] flex items-center text-center text-[#1f2a44] m-0 whitespace-pre-line lg:whitespace-normal">{body}</p>
			{#if linkText}
				<a href="/" class="h-[17px] font-['Inter'] font-medium text-[14px] leading-[17px] flex items-center text-center text-[#4267ad] no-underline">{linkText}</a>
			{/if}
		</div>
	</div>
</div>

<style>
</style>
