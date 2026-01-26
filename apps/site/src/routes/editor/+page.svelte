<script lang="ts">
  import {SvelteMap, SvelteSet} from "svelte/reactivity";

  type OPMLItem = OPMLFeed | OPMLFolder;

  interface OPMLFeed {
    id: string;
    type: 'feed';
    title: string;
    xmlUrl: string;
    htmlUrl?: string;
    parentId: string | null;
  }

  interface OPMLFolder {
    id: string;
    type: 'folder';
    title: string;
    parentId: string | null;
    isExpanded: boolean;
  }

  let xmlInput = $state('');
  let items = $state<OPMLItem[]>([]);
  let selectedIds = $state<Set<string>>(new Set());
  let newTitle = $state('');
  let newUrl = $state('');
  let newParentId = $state<string | null>(null);

  function generateId(): string {
    return crypto.randomUUID()
  }

  function escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function parseOPML(xml: string): OPMLItem[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const result: OPMLItem[] = [];

    function parseOutline(el: Element, parentId: string | null) {
      const xmlUrl = el.getAttribute('xmlUrl');
      const title = el.getAttribute('title') || el.getAttribute('text') || 'Untitled';
      const children = el.querySelectorAll(':scope > outline');

      if (xmlUrl) {
        // It's a feed
        result.push({
          id: generateId(),
          type: 'feed',
          title,
          xmlUrl,
          htmlUrl: el.getAttribute('htmlUrl') || undefined,
          parentId
        });
      } else if (children.length > 0) {
        // It's a folder
        const folderId = generateId();
        result.push({
          id: folderId,
          type: 'folder',
          title,
          parentId,
          isExpanded: true
        });
        children.forEach((child) => parseOutline(child, folderId));
      } else if (el.getAttribute('type') !== 'rss') {
        // Empty folder (no children, no xmlUrl, not rss type)
        result.push({
          id: generateId(),
          type: 'folder',
          title,
          parentId,
          isExpanded: true
        });
      }
    }

    const body = doc.querySelector('body');
    if (body) {
      body.querySelectorAll(':scope > outline').forEach((el) => parseOutline(el, null));
    }

    return result;
  }

  function generateOPML(): string {
    function renderItem(item: OPMLItem, indent: string): string {
      if (item.type === 'feed') {
        const htmlAttr = item.htmlUrl ? ` htmlUrl="${escapeXml(item.htmlUrl)}"` : '';
        return `${indent}<outline type="rss" text="${escapeXml(item.title)}" title="${escapeXml(item.title)}" xmlUrl="${escapeXml(item.xmlUrl)}"${htmlAttr}/>\n`;
      } else {
        const children = items.filter((i) => i.parentId === item.id);
        const childrenXml = children.map((c) => renderItem(c, indent + '  ')).join('');
        return `${indent}<outline text="${escapeXml(item.title)}" title="${escapeXml(item.title)}">\n${childrenXml}${indent}</outline>\n`;
      }
    }

    const rootItems = items.filter((i) => i.parentId === null);
    const outlines = rootItems.map((i) => renderItem(i, '    ')).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>RSS Feeds</title>
  </head>
  <body>
${outlines}  </body>
</opml>`;
  }

  function handleParse() {
    if (!xmlInput.trim()) return;
    items = parseOPML(xmlInput);
    selectedIds = new Set();
  }

  function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      xmlInput = reader.result as string;
      handleParse();
    };
    reader.readAsText(file);
  }

  function handleClear() {
    xmlInput = '';
    items = [];
    selectedIds = new Set();
  }

  function addFeed() {
    if (!newTitle.trim() || !newUrl.trim()) return;
    items = [
      ...items,
      {
        id: generateId(),
        type: 'feed',
        title: newTitle.trim(),
        xmlUrl: newUrl.trim(),
        parentId: newParentId
      }
    ];
    newTitle = '';
    newUrl = '';
  }

  function addFolder() {
    if (!newTitle.trim()) return;
    items = [
      ...items,
      {
        id: generateId(),
        type: 'folder',
        title: newTitle.trim(),
        parentId: newParentId,
        isExpanded: true
      }
    ];
    newTitle = '';
  }

  function deleteItem(id: string) {
    // Delete item and all children recursively
    const toDelete = new SvelteSet<string>();
    function collectChildren(parentId: string) {
      toDelete.add(parentId);
      items.filter((i) => i.parentId === parentId).forEach((i) => collectChildren(i.id));
    }
    collectChildren(id);
    items = items.filter((i) => !toDelete.has(i.id));
    selectedIds = new Set([...selectedIds].filter((id) => !toDelete.has(id)));
  }

  function deleteSelected() {
    const toDelete = new SvelteSet<string>();
    function collectChildren(parentId: string) {
      toDelete.add(parentId);
      items.filter((i) => i.parentId === parentId).forEach((i) => collectChildren(i.id));
    }
    selectedIds.forEach((id) => collectChildren(id));
    items = items.filter((i) => !toDelete.has(i.id));
    selectedIds = new Set();
  }

  function toggleSelect(id: string) {
    const newSet = new SvelteSet(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    selectedIds = newSet;
  }

  function toggleFolder(id: string) {
    items = items.map((i) => (i.id === id && i.type === 'folder' ? { ...i, isExpanded: !i.isExpanded } : i));
  }

  function downloadOPML() {
    const opml = generateOPML();
    const blob = new Blob([opml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feeds.opml';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Get folders for parent dropdown
  const folders = $derived(items.filter((i): i is OPMLFolder => i.type === 'folder'));

  // Build lookup map + precompute depth/visibility in one pass
  const itemMeta = $derived(() => {
    const byId = new Map<string, OPMLItem>(items.map((i) => [i.id, i]));
    const depth = new SvelteMap<string, number>();
    const visible = new SvelteMap<string, boolean>();

    function computeDepth(id: string | null): number {
      if (id === null) return -1;
      if (depth.has(id)) return depth.get(id)!;
      const item = byId.get(id);
      if (!item) return -1;
      const d = 1 + computeDepth(item.parentId);
      depth.set(id, d);
      return d;
    }

    function computeVisible(id: string | null): boolean {
      if (id === null) return true;
      if (visible.has(id)) return visible.get(id)!;
      const item = byId.get(id);
      if (!item) return true;
      const parent = item.parentId ? byId.get(item.parentId) : null;
      const v = parent?.type === 'folder' && !parent.isExpanded ? false : computeVisible(item.parentId);
      visible.set(id, v);
      return v;
    }

    items.forEach((i) => {
      computeDepth(i.id);
      computeVisible(i.id);
    });

    return { depth, visible };
  });

  function isVisible(item: OPMLItem): boolean {
    return itemMeta().visible.get(item.id) ?? true;
  }

  function getDepth(item: OPMLItem): number {
    return itemMeta().depth.get(item.id) ?? 0;
  }

  // Sort items by parent hierarchy
  const sortedItems = $derived(() => {
    const result: OPMLItem[] = [];
    const byParent = new SvelteMap<string | null, OPMLItem[]>();
    items.forEach((i) => {
      const list = byParent.get(i.parentId) ?? [];
      list.push(i);
      byParent.set(i.parentId, list);
    });

    function addChildren(parentId: string | null) {
      (byParent.get(parentId) ?? []).forEach((item) => {
        result.push(item);
        if (item.type === 'folder') addChildren(item.id);
      });
    }
    addChildren(null);
    return result;
  });
</script>

<svelte:head>
  <title>OPML Editor - lake.lochy</title>
  <meta name="description" content="Edit, create, and manage OPML files. Import existing feeds, organize into folders, and export valid OPML 2.0." />
  <meta property="og:title" content="OPML Editor - lake.lochy" />
  <meta property="og:description" content="Edit, create, and manage OPML files. Import existing feeds, organize into folders, and export valid OPML 2.0." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="OPML Editor - lake.lochy" />
  <meta name="twitter:description" content="Edit, create, and manage OPML files. Import existing feeds, organize into folders, and export valid OPML 2.0." />
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-8">
  <div class="mb-8 flex items-center justify-between">
    <h1 class="text-2xl font-bold">OPML Editor</h1>
    <button
      onclick={downloadOPML}
      disabled={items.length === 0}
      class="rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Export
    </button>
  </div>

  <!-- XML Input -->
  <section class="mb-6">
    <textarea
      bind:value={xmlInput}
      placeholder="Paste OPML XML here..."
      rows="6"
      class="w-full rounded-lg border border-(--border) bg-(--bg-card) px-4 py-3 font-mono text-sm text-white placeholder-(--text-muted) focus:border-(--accent) focus:outline-none"
    ></textarea>
    <div class="mt-3 flex gap-3">
      <label
        class="cursor-pointer rounded-lg border border-(--border) bg-(--bg-card) px-4 py-2 text-sm text-(--text-muted) hover:border-(--text-muted) hover:text-white"
      >
        Upload File
        <input type="file" accept=".opml,.xml" onchange={handleFileUpload} class="hidden" />
      </label>
      <button
        onclick={handleParse}
        class="rounded-lg border border-(--border) bg-(--bg-card) px-4 py-2 text-sm text-(--text-muted) hover:border-(--text-muted) hover:text-white"
      >
        Parse
      </button>
      <button
        onclick={handleClear}
        class="rounded-lg border border-(--border) bg-(--bg-card) px-4 py-2 text-sm text-(--text-muted) hover:border-(--text-muted) hover:text-white"
      >
        Clear
      </button>
    </div>
  </section>

  <!-- Add New -->
  <section class="mb-6 rounded-lg border border-(--border) bg-(--bg-card) p-4">
    <h2 class="mb-3 text-sm font-medium text-(--text-muted)">Add New</h2>
    <div class="flex flex-wrap gap-3">
      <input
        type="text"
        bind:value={newTitle}
        placeholder="Title"
        class="flex-1 min-w-30 rounded-lg border border-(--border) bg-transparent px-3 py-2 text-sm text-white placeholder-(--text-muted) focus:border-(--accent) focus:outline-none"
      />
      <input
        type="url"
        bind:value={newUrl}
        placeholder="Feed URL"
        class="flex-1 min-w-50 rounded-lg border border-(--border) bg-transparent px-3 py-2 text-sm text-white placeholder-(--text-muted) focus:border-(--accent) focus:outline-none"
      />
      <select
        bind:value={newParentId}
        class="rounded-lg border border-(--border) bg-transparent px-3 py-2 text-sm text-white focus:border-(--accent) focus:outline-none"
      >
        <option value={null}>Root</option>
        {#each folders as folder (folder.id)}
          <option value={folder.id}>{folder.title}</option>
        {/each}
      </select>
      <button
        onclick={addFeed}
        disabled={!newTitle.trim() || !newUrl.trim()}
        class="rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Feed
      </button>
      <button
        onclick={addFolder}
        disabled={!newTitle.trim()}
        class="rounded-lg border border-(--accent) px-4 py-2 text-sm font-medium text-(--accent) hover:bg-(--accent) hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Folder
      </button>
    </div>
  </section>

  <!-- Entries List -->
  <section>
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-lg font-medium">Entries ({items.length})</h2>
      {#if selectedIds.size > 0}
        <button onclick={deleteSelected} class="text-sm text-red-400 hover:text-red-300">
          Delete Selected ({selectedIds.size})
        </button>
      {/if}
    </div>

    {#if items.length === 0}
      <p class="py-8 text-center text-(--text-muted)">No entries. Paste OPML or add items manually.</p>
    {:else}
      <div class="rounded-lg border border-(--border) divide-y divide-(--border)">
        {#each sortedItems() as item (item.id)}
          {#if isVisible(item)}
            <div
              class="flex items-center gap-3 px-4 py-3 hover:bg-(--bg-card-hover)"
              style="padding-left: {16 + getDepth(item) * 24}px"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onchange={() => toggleSelect(item.id)}
                class="h-4 w-4 rounded border-(--border) bg-transparent text-(--accent) focus:ring-0 focus:ring-offset-0"
              />

              {#if item.type === 'folder'}
                <button onclick={() => toggleFolder(item.id)} class="text-(--text-muted) hover:text-white">
                  {item.isExpanded ? '▼' : '▶'}
                </button>
                <span class="font-medium">{item.title}</span>
                <span class="text-xs text-(--text-muted)">(folder)</span>
              {:else}
                <span class="w-5"></span>
                <span class="flex-1 truncate">{item.title}</span>
                <span class="flex-1 truncate font-mono text-xs text-(--text-muted)">{item.xmlUrl}</span>
              {/if}

              <button onclick={() => deleteItem(item.id)} class="text-(--text-muted) hover:text-red-400">
                ✕
              </button>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </section>
</main>
