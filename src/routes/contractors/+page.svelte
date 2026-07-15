<script>
	import Hero from './contractor-page/Hero.svelte';
	import Partners from './contractor-page/Partners.svelte';
	import FeaturesContainer from './contractor-page/FeaturesContainer.svelte';
	import FAQSection from './contractor-page/FAQSection.svelte';
	import BottomCTA from './contractor-page/BottomCTA.svelte';
	import Header from '$lib/components/new-site/Header.svelte';
	import FooterBar from '../FooterBar.svelte';
</script>

<div class="flex flex-col items-center p-0 w-full mx-auto bg-white overflow-hidden">
	<Header/>

	<div class="flex flex-col items-center w-full gap-[30px]">
		<Hero />
		<Partners />
		<FeaturesContainer />
		<FAQSection />
		<BottomCTA />
	</div>

	<FooterBar/>
</div>
