<script lang="ts">
	import { onMount } from 'svelte';
	import FeatureCard from './FeatureCard.svelte';
	import VideoModal from '$lib/components/new-site/VideoModal.svelte';

	let isVideoModalOpen = $state(false);
	let currentVideoId = $state('');
	let isMobile = $state(true); // Default to mobile for SSR/initial load

	function openVideo(id: string) {
		currentVideoId = id;
		isVideoModalOpen = true;
	}

	onMount(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth < 1024;
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	});

	const features = [
		{
			title: 'Discovery',
			subTitle: 'Get Found by More Local Homeowners',
			body: 'Improve visibility, and reputation so more \n customers discover your business when \n they are ready to start a project',
			linkText: 'See how we increase Discovery',
			mobileVideoId: 'ItuaE-NL6Yw',
			desktopVideoId: 'aBxRSZ0d4r8',
			icon: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M32.6816 32.6821L25.9228 25.9232M25.9228 25.9232C27.0789 24.7671 27.996 23.3946 28.6217 21.884C29.2474 20.3734 29.5694 18.7544 29.5694 17.1194C29.5694 15.4844 29.2474 13.8654 28.6217 12.3548C27.996 10.8443 27.0789 9.47173 25.9228 8.3156C24.7666 7.15947 23.3941 6.24237 21.8835 5.61668C20.373 4.99099 18.754 4.66895 17.1189 4.66895C15.4839 4.66895 13.8649 4.99099 12.3544 5.61668C10.8438 6.24237 9.47128 7.15947 8.31514 8.3156C5.98023 10.6505 4.66849 13.8173 4.66849 17.1194C4.66849 20.4215 5.98023 23.5883 8.31514 25.9232C10.6501 28.2581 13.8169 29.5699 17.1189 29.5699C20.421 29.5699 23.5878 28.2581 25.9228 25.9232Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
		},
		{
			title: 'Engagement',
			subTitle: 'Show the Work. Build Trust Keep \n Them Interested.',
			body: 'Help homeowners explore your services, \n review past projects, and visualize results \n before they ever request a quote',
			linkText: 'See how we increase Engagement',
			mobileVideoId: 'cBOMZHm8DG0',
			desktopVideoId: 'gVcwd4fL7YY',
			icon: `<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1_1102)">
<path d="M33.8529 16.0858C33.7797 15.8892 33.6481 15.7197 33.4758 15.6001C33.3034 15.4805 33.0986 15.4165 32.8889 15.4167H20.4785L27.6369 1.4985C27.7177 1.34175 27.7568 1.16685 27.7504 0.990629C27.744 0.814408 27.6924 0.642791 27.6005 0.492281C27.5087 0.341771 27.3796 0.217431 27.2258 0.131217C27.072 0.0450029 26.8985 -0.000184251 26.7222 5.64652e-07C26.4758 0.000102823 26.2376 0.0887366 26.0511 0.249751L18.5 6.771L3.43995 19.7775C3.28124 19.9145 3.16822 20.0968 3.11606 20.2998C3.0639 20.5029 3.07508 20.7171 3.14812 20.9136C3.22117 21.1101 3.35256 21.2796 3.52469 21.3993C3.69681 21.519 3.90143 21.5832 4.11109 21.5833H16.5215L9.36304 35.5015C9.28227 35.6583 9.2432 35.8331 9.24957 36.0094C9.25595 36.1856 9.30755 36.3572 9.39943 36.5077C9.4913 36.6582 9.30755 36.3572 9.39943 36.5077L18.5 30.229L33.56 17.2225C33.719 17.0856 33.8324 16.9032 33.8847 16.7C33.9371 16.4968 33.926 16.2825 33.8529 16.0858Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_1_1102">
<rect width="37" height="37" fill="white"/>
</clipPath>
</defs>
</svg>`
		},
		{
			title: 'Conversion',
			subTitle: 'Capture More Calls, Quotes, and Inquiries',
			body: 'Turn project interest into real conversations \n with faster follow-up, stronger lead capture, \n and better communication workflows.',
			linkText: 'See how we increase Conversion',
			mobileVideoId: 'nbiTUZ4bfK8',
			desktopVideoId: 't41egbiiPtg',
			icon: `<svg width="31" height="22" viewBox="0 0 31 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M30.1395 0.677839C30.573 1.1115 30.8165 1.69958 30.8165 2.31278C30.8165 2.92597 30.573 3.51406 30.1395 3.94771L12.8065 21.2807C12.5775 21.5098 12.3055 21.6915 12.0062 21.8155C11.7069 21.9395 11.3861 22.0033 11.0621 22.0033C10.7382 22.0033 10.4173 21.9395 10.118 21.8155C9.81874 21.6915 9.54679 21.5098 9.31773 21.2807L0.705979 12.6705C0.485112 12.4571 0.30894 12.202 0.187745 11.9198C0.0665488 11.6377 0.00275551 11.3343 8.73122e-05 11.0272C-0.00258089 10.7202 0.0559295 10.4156 0.172204 10.1314C0.288479 9.84725 0.460189 9.58905 0.677316 9.37193C0.894443 9.1548 1.15264 8.98309 1.43684 8.86681C1.72103 8.75054 2.02554 8.69203 2.33259 8.6947C2.63965 8.69736 2.94309 8.76116 3.22523 8.88235C3.50736 9.00355 3.76253 9.17972 3.97585 9.40059L11.0614 16.4861L26.8681 0.677839C27.0828 0.462947 27.3378 0.292477 27.6185 0.17617C27.8991 0.0598636 28.2 0 28.5038 0C28.8076 0 29.1084 0.0598636 29.3891 0.17617C29.6697 0.292477 29.9247 0.462947 30.1395 0.677839Z" fill="white"/>
</svg>`
		},
		{
			title: 'Growth',
			subTitle: 'Measure What Drives More Booked Jobs',
			body: 'Track what is working-visibility, engagement, \n and lead activity so you can improve \n performance & grow more efficiently.',
			linkText: 'See how we increase Growth',
			mobileVideoId: 'y0iQ6Na3fgM',
			desktopVideoId: 'ktBwsfsaQPQ',
			icon: `<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25.9 5.0877C25.9 4.71971 26.0462 4.36679 26.3064 4.10658C26.5666 3.84638 26.9195 3.7002 27.2875 3.7002H31.9125C32.2805 3.7002 32.6334 3.84638 32.8936 4.10658C33.1538 4.36679 33.3 4.71971 33.3 5.0877V9.7127C33.3 10.0807 33.1538 10.4336 32.8936 10.6938C32.6334 10.954 32.2805 11.1002 31.9125 11.1002C31.5445 11.1002 31.1916 10.954 30.9314 10.6938C30.6712 10.4336 30.525 10.0807 30.525 9.7127V8.4362L22.2555 16.7057C21.9953 16.9655 21.6427 17.1115 21.275 17.1115C20.9073 17.1115 20.5546 16.9655 20.2945 16.7057L15.725 12.1362L7.91799 19.9432C7.79097 20.0795 7.63779 20.1889 7.46759 20.2647C7.29739 20.3405 7.11366 20.3813 6.92736 20.3846C6.74106 20.3879 6.556 20.3536 6.38324 20.2838C6.21047 20.214 6.05352 20.1102 5.92177 19.9784C5.79002 19.8467 5.68615 19.6897 5.61636 19.517C5.54658 19.3442 5.51231 19.1591 5.5156 18.9728C5.51888 18.7865 5.55966 18.6028 5.6355 18.4326C5.71133 18.2624 5.82067 18.1092 5.95699 17.9822L14.7445 9.19469C15.0046 8.93486 15.3573 8.78892 15.725 8.78892C16.0927 8.78892 16.4453 8.93486 16.7055 9.19469L21.275 13.7642L28.564 6.4752H27.2875C26.9195 6.4752 26.5666 6.32901 26.3064 6.06881C26.0462 5.8086 25.9 5.45568 25.9 5.0877ZM6.93749 25.9002C7.30548 25.9002 7.6584 26.0464 7.9186 26.3066C8.17881 26.5668 8.32499 26.9197 8.32499 27.2877V31.9127C8.32499 32.2807 8.17881 32.6336 7.9186 32.8938C7.6584 33.154 7.30548 33.3002 6.93749 33.3002C6.5695 33.3002 6.21659 33.154 5.95638 32.8938C5.69617 32.6336 5.54999 32.2807 5.54999 31.9127V27.2877C5.54999 26.9197 5.69617 26.5668 5.95638 26.3066C6.21659 26.0464 6.5695 25.9002 6.93749 25.9002ZM15.725 21.7377C15.725 21.3697 15.5788 21.0168 15.3186 20.7566C15.0584 20.4964 14.7055 20.3502 14.3375 20.3502C13.9695 20.3502 13.6166 20.4964 13.3564 20.7566C13.0962 21.0168 12.95 21.3697 12.95 21.7377V31.9127C12.95 32.2807 13.0962 32.6336 13.3564 32.8938C13.6166 33.154 13.9695 33.3002 14.3375 33.3002C14.7055 33.3002 15.0584 33.154 15.3186 32.8938C15.5788 32.6336 15.725 32.2807 15.725 31.9127V21.7377ZM21.7375 24.0502C22.1055 24.0502 22.4584 24.1964 22.7186 24.4566C22.9788 24.7168 23.125 25.0697 23.125 25.4377V31.9127C23.125 32.2807 22.9788 32.6336 22.7186 32.8938C22.4584 33.154 22.1055 33.3002 21.7375 33.3002C21.3695 33.3002 21.0166 33.154 20.7564 32.8938C20.4962 32.6336 20.35 32.2807 20.35 31.9127V25.4377C20.35 25.0697 20.4962 24.7168 20.7564 24.4566C21.0166 24.1964 21.3695 24.0502 21.7375 24.0502ZM30.525 18.0377C30.525 17.6697 30.3788 17.3168 30.1186 17.0566C29.8584 16.7964 29.5055 16.6502 29.1375 16.6502C28.7695 16.6502 28.4166 16.7964 28.1564 17.0566C27.8962 17.3168 27.75 17.6697 27.75 18.0377V31.9127C27.75 32.2807 27.8962 32.6336 28.1564 32.8938C28.4166 33.154 28.7695 33.3002 29.1375 33.3002C29.5055 33.3002 29.8584 33.154 30.1186 32.8938C30.3788 32.6336 30.525 32.2807 30.525 31.9127V18.0377Z" fill="white"/>
</svg>`
		}
	];
</script>

<section class="flex flex-col lg:flex-row items-center p-0 gap-[30px] lg:gap-[15px] max-w-[1239px] w-full h-auto justify-center px-4 lg:px-6 mb-10 lg:my-0">
	<!-- Mobile Header (per design) -->
	<div class="lg:hidden flex flex-col justify-center items-center pt-[18px] pb-0 gap-[10px] w-full max-w-[315px] min-h-[73px] mx-auto">
		<h2 class="w-full h-auto font-['Inter'] font-semibold text-[22px] leading-[31px] flex items-center justify-center text-center text-[#4267AD] m-0">
			The ClearSky Growth Engine
		</h2>
		<p class="w-full max-w-[289px] h-auto font-['Inter'] font-normal text-[16px] leading-[16px] flex items-center justify-center text-center text-[rgba(31,42,68,0.8)] m-0">
			Four stages that turn visitors into booked customers
		</p>
	</div>

	{#each features as feature (feature.title)}
		<FeatureCard 
			{...feature} 
			videoId={isMobile ? feature.mobileVideoId : feature.desktopVideoId}
			onclick={() => openVideo(isMobile ? feature.mobileVideoId : feature.desktopVideoId)} 
		/>
	{/each}
</section>

<VideoModal bind:open={isVideoModalOpen} videoId={currentVideoId} />
