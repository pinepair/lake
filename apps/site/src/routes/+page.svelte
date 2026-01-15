<script lang="ts">
  import Fuse from 'fuse.js';
  import { generateOpml } from '$lib/utils/opml';

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

<div class="mx-auto max-w-4xl p-6">
  <h1 class="mb-6 text-3xl font-bold">RSS Feed Directory</h1>

  <input
    type="search"
    bind:value={search}
    placeholder="Search feeds..."
    class="mb-4 w-full rounded border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
  />

  <div class="mb-4 flex flex-wrap gap-2">
    {#each data.tags as tag (tag)}
      <button
        onclick={() => toggleTag(tag)}
        class="rounded-full px-3 py-1 text-sm {selectedTags.includes(tag)
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
      >
        {tag}
      </button>
    {/each}
  </div>

  {#if selectedSlugs.length > 0}
    <div class="mb-4 flex items-center gap-4 rounded bg-blue-50 p-3">
      <span class="text-sm">{selectedSlugs.length} selected</span>
      <button onclick={downloadSelectedOpml} class="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600">
        Download OPML
      </button>
      <button onclick={clearSelection} class="text-sm text-gray-600 hover:text-gray-800">
        Clear
      </button>
    </div>
  {:else}
    <div class="mb-4 flex items-center gap-4">
      <button onclick={selectAll} class="text-sm text-blue-600 hover:underline">
        Select all
      </button>
    </div>
  {/if}

  <div class="space-y-3">
    {#each filteredFeeds() as feed (feed.slug)}
      <div class="flex items-center gap-3 rounded border p-4 hover:bg-gray-50">
        <input
          type="checkbox"
          checked={selectedSlugs.includes(feed.slug)}
          onchange={() => toggleSelect(feed.slug)}
          class="h-4 w-4"
        />
        <a href="/{feed.slug}" class="flex-1">
          <h2 class="font-semibold">{feed.title}</h2>
          <p class="text-sm text-gray-600">{feed.text}</p>
          <div class="mt-1 flex gap-1">
            {#each feed.tags as tag (tag)}
              <span class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{tag}</span>
            {/each}
          </div>
        </a>
      </div>
    {/each}
  </div>
</div>
