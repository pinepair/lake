<script lang="ts">
  import { generateOpml } from '$lib/utils/opml';
  import { getFeedlyUrl, getInoreaderUrl, getFeedProtocolUrl } from '$lib/utils/readers';
  import { resolve } from '$app/paths';

  let { data } = $props();
  let copied = $state(false);

  function downloadOpml() {
    const opml = generateOpml([data.feed], data.feed.title);
    const blob = new Blob([opml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.feed.slug}.opml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(data.feed.xmlUrl);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<svelte:head>
  <title>{data.feed.title} - lake.directory</title>
  <meta name="description" content={data.feed.text} />
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-12">
  <a href={resolve('/')} class="mb-8 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white">
    <span>&larr;</span> Back to feeds
  </a>

  <div class="mb-8">
    <p class="mb-2 font-mono text-sm text-[var(--text-muted)]">{data.feed.text}</p>
    <h1 class="mb-4 text-3xl font-bold">{data.feed.title}</h1>
    <div class="flex gap-2">
      {#each data.feed.tags as tag (tag)}
        <span class="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1 text-sm text-[var(--text-muted)]">
          {tag}
        </span>
      {/each}
    </div>
  </div>

  <div class="mb-8 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
    <h2 class="mb-3 text-sm font-medium text-[var(--text-muted)]">Feed URL</h2>
    <code class="block break-all rounded bg-[var(--bg)] p-3 text-sm">{data.feed.xmlUrl}</code>
  </div>

  <div class="mb-8">
    <h2 class="mb-4 text-sm font-medium text-[var(--text-muted)]">Actions</h2>
    <div class="flex flex-wrap gap-3">
      <button
        onclick={copyUrl}
        class="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-card-hover)]"
      >
        {copied ? 'Copied!' : 'Copy URL'}
      </button>
      <button
        onclick={downloadOpml}
        class="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Download OPML
      </button>
    </div>
  </div>

  <div class="mb-8">
    <h2 class="mb-4 text-sm font-medium text-[var(--text-muted)]">Open in Reader</h2>
    <div class="flex flex-wrap gap-3">
      <a
        href={getFeedProtocolUrl(data.feed.xmlUrl)}
        class="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-card-hover)]"
      >
        Default Reader
      </a>
      <a
        href={getFeedlyUrl(data.feed.xmlUrl)}
        target="_blank"
        rel="noopener"
        class="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-card-hover)]"
      >
        Feedly
      </a>
      <a
        href={getInoreaderUrl(data.feed.xmlUrl)}
        target="_blank"
        rel="noopener"
        class="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-card-hover)]"
      >
        Inoreader
      </a>
    </div>
  </div>

  <div>
    <h2 class="mb-4 text-sm font-medium text-[var(--text-muted)]">Website</h2>
    <a
      href={data.feed.htmlUrl}
      target="_blank"
      rel="noopener"
      class="text-[var(--accent)] hover:underline"
    >
      {data.feed.htmlUrl}
    </a>
  </div>
</main>
