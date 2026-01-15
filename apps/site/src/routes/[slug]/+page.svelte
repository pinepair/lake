<script lang="ts">
  import { generateOpml } from '$lib/utils/opml';
  import { getFeedlyUrl, getInoreaderUrl, getFeedProtocolUrl } from '$lib/utils/readers';

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
  <title>{data.feed.title} - RSS Feed Directory</title>
  <meta name="description" content={data.feed.text} />
</svelte:head>

<div class="mx-auto max-w-4xl p-6">
  <a href="/" class="mb-4 inline-block text-blue-600 hover:underline">&larr; Back</a>

  <h1 class="mb-2 text-3xl font-bold">{data.feed.title}</h1>
  <p class="mb-4 text-gray-600">{data.feed.text}</p>

  <div class="mb-6 flex gap-2">
    {#each data.feed.tags as tag}
      <span class="rounded bg-gray-100 px-2 py-1 text-sm text-gray-600">{tag}</span>
    {/each}
  </div>

  <div class="mb-6 rounded border bg-gray-50 p-4">
    <h2 class="mb-2 font-semibold">Feed URL</h2>
    <code class="block break-all rounded bg-white p-2 text-sm">{data.feed.xmlUrl}</code>
  </div>

  <div class="mb-6">
    <h2 class="mb-3 font-semibold">Actions</h2>
    <div class="flex flex-wrap gap-3">
      <button
        onclick={copyUrl}
        class="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
      >
        {copied ? 'Copied!' : 'Copy URL'}
      </button>
      <button
        onclick={downloadOpml}
        class="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
      >
        Download OPML
      </button>
    </div>
  </div>

  <div class="mb-6">
    <h2 class="mb-3 font-semibold">Open in Reader</h2>
    <div class="flex flex-wrap gap-3">
      <a
        href={getFeedProtocolUrl(data.feed.xmlUrl)}
        class="rounded bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
      >
        Default Reader
      </a>
      <a
        href={getFeedlyUrl(data.feed.xmlUrl)}
        target="_blank"
        rel="noopener"
        class="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
      >
        Feedly
      </a>
      <a
        href={getInoreaderUrl(data.feed.xmlUrl)}
        target="_blank"
        rel="noopener"
        class="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        Inoreader
      </a>
    </div>
  </div>

  <div>
    <h2 class="mb-3 font-semibold">Website</h2>
    <a
      href={data.feed.htmlUrl}
      target="_blank"
      rel="noopener"
      class="text-blue-600 hover:underline"
    >
      {data.feed.htmlUrl}
    </a>
  </div>
</div>
