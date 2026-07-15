<script lang="ts">
	import PipelineTestCenter from '../components/PipelineTestCenter.svelte';
	import RecentCallsViewer from '../components/RecentCallsViewer.svelte';
</script>

<svelte:head>
	<title>Pipeline Test Center (Sections 1-6) | ClearSky AI</title>
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<PipelineTestCenter />
	<div class="max-w-[1600px] mx-auto px-6 pb-20">
		<RecentCallsViewer />
	</div>
</div>
