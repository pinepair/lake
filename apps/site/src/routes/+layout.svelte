<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import {resolve} from '$app/paths'

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta property="og:image" content={favicon} />
	<meta name="twitter:image" content={favicon} />
</svelte:head>

<div class="min-h-screen">
	<header class="border-b border-(--border) px-6 py-4">
		<nav class="mx-auto flex max-w-6xl items-center justify-between">
			<a href={resolve('/')} class="text-lg font-medium flex items-center gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>
				lake.lochy
			</a>
			<div class="flex items-center gap-6 text-sm text-(--text-muted)">
				<a href={resolve('/')} class="hover:text-white">Feeds</a>
				<a href={resolve('/editor')} class="hover:text-white">Editor</a>
				<a href="https://github.com/pinepair/lake" target="_blank" rel="noopener" class="hover:text-white">GitHub</a>
				<a href="https://www.lochy.org" target="_blank" rel="noopener" class="hover:text-white">lochy.org</a>
			</div>
		</nav>
	</header>
	{@render children()}
</div>
