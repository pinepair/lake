<script lang="ts">
  import Fuse from 'fuse.js';
  import { generateOpml } from '$lib/utils/opml';
  import {resolve} from "$app/paths";

  let { data } = $props();

  let search = $state('');
  let selectedTags = $state<string[]>([]);
  let selectedSlugs = $state<string[]>([]);

  const fuse = new Fuse(data.feeds, {
    keys: ['title', 'text', 'tags'],
    threshold: 0.3
  });

  const filteredFeeds = $derived(() => {
    let results = data.feeds;

    if (search.trim()) {
      results = fuse.search(search).map((r) => r.item);
    }

    if (selectedTags.length > 0) {
      results = results.filter((feed) => selectedTags.some((tag) => feed.tags.includes(tag)));
    }

    return results;
  });

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter((t) => t !== tag);
    } else {
      selectedTags = [...selectedTags, tag];
    }
  }

  function toggleSelect(slug: string) {
    if (selectedSlugs.includes(slug)) {
      selectedSlugs = selectedSlugs.filter((s) => s !== slug);
    } else {
      selectedSlugs = [...selectedSlugs, slug];
    }
  }

  function downloadSelectedOpml() {
    const selected = data.feeds.filter((f) => selectedSlugs.includes(f.slug));
    const opml = generateOpml(selected, 'Selected Feeds');
    const blob = new Blob([opml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feeds.opml';
    a.click();
    URL.revokeObjectURL(url);
  }

  function selectAll() {
    selectedSlugs = filteredFeeds().map((f) => f.slug);
  }

  function clearSelection() {
    selectedSlugs = [];
  }
</script>

<!-- Hero Section -->
<section class="px-6 py-16 text-center">
  <h1 class="mb-4 text-4xl font-bold">Discover RSS Feeds</h1>
  <p class="mx-auto mb-8 max-w-2xl text-[var(--text-muted)]">
    A curated directory of RSS feeds. Browse, search, and export feeds to your favorite reader.
  </p>

  <div class="mx-auto max-w-2xl">
    <input
      type="search"
      bind:value={search}
      placeholder="Search for a feed..."
      class="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
    />
  </div>
</section>

<main class="mx-auto max-w-6xl px-6 pb-16">
  <!-- Tags -->
  <section class="mb-10">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-medium">Tags</h2>
      {#if selectedTags.length > 0}
        <button onclick={() => (selectedTags = [])} class="text-sm text-[var(--text-muted)] hover:text-white">
          Clear filters
        </button>
      {/if}
    </div>
    <div class="flex flex-wrap gap-2">
      {#each data.tags as tag (tag)}
        <button
          onclick={() => toggleTag(tag)}
          class="rounded-full border px-4 py-1.5 text-sm transition-colors {selectedTags.includes(tag)
            ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
            : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'}"
        >
          {tag}
        </button>
      {/each}
    </div>
  </section>

  <!-- Selection Bar -->
  {#if selectedSlugs.length > 0}
    <div class="mb-6 flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4">
      <span class="text-sm text-[var(--text-muted)]">{selectedSlugs.length} selected</span>
      <button
        onclick={downloadSelectedOpml}
        class="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Download OPML
      </button>
      <button onclick={clearSelection} class="text-sm text-[var(--text-muted)] hover:text-white">
        Clear
      </button>
    </div>
  {/if}

  <!-- Feeds Grid -->
  <section>
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-medium">Feeds</h2>
      <button onclick={selectAll} class="text-sm text-[var(--text-muted)] hover:text-white">
        Select all
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each filteredFeeds() as feed (feed.slug)}
        <div
          class="group relative rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-colors hover:bg-[var(--bg-card-hover)]"
        >
          <label class="absolute right-4 top-4 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedSlugs.includes(feed.slug)}
              onchange={() => toggleSelect(feed.slug)}
              class="h-4 w-4 rounded border-[var(--border)] bg-transparent text-[var(--accent)] focus:ring-0 focus:ring-offset-0"
            />
          </label>

          <a href={resolve('/[slug]', {slug: feed.slug})} class="block">
            <p class="mb-3 line-clamp-2 font-mono text-sm text-(--text-muted)">
              {feed.text}
            </p>
            <h3 class="mb-3 font-semibold">{feed.title}</h3>
            <div class="flex flex-wrap gap-1.5">
              {#each feed.tags as tag (tag)}
                <span class="text-xs text-[var(--text-muted)]">{tag}</span>
                {#if feed.tags.indexOf(tag) < feed.tags.length - 1}
                  <span class="text-xs text-[var(--text-muted)]">·</span>
                {/if}
              {/each}
            </div>
          </a>
        </div>
      {/each}
    </div>

    {#if filteredFeeds().length === 0}
      <p class="py-12 text-center text-[var(--text-muted)]">No feeds found.</p>
    {/if}
  </section>
</main>
