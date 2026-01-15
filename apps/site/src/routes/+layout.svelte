<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import {resolve} from '$app/paths'

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen">
	<header class="border-b border-[var(--border)] px-6 py-4">
		<nav class="mx-auto flex max-w-6xl items-center justify-between">
			<a href={resolve('/')} class="text-lg font-medium">lake.lochy</a>
			<div class="flex items-center gap-6 text-sm text-(--text-muted)">
				<a href={resolve('/')} class="hover:text-white">Feeds</a>
				<a href="https://github.com/pinepair/lake" target="_blank" rel="noopener" class="hover:text-white">GitHub</a>
				<a href="https://www.lochy.org" target="_blank" rel="noopener" class="hover:text-white">lochy.org</a>
			</div>
		</nav>
	</header>
	{@render children()}
</div>
