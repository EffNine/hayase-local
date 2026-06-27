<script lang='ts'>
  import ChevronLeft from 'lucide-svelte/icons/chevron-left'
  import { toast } from 'svelte-sonner'

  import type { PageData } from './$types'

  import { goto } from '$app/navigation'
  import MangaReader from '$lib/components/readers/MangaReader.svelte'
  import NovelReader from '$lib/components/readers/NovelReader.svelte'
  import { Button } from '$lib/components/ui/button'
  import { authAggregator as auth } from '$lib/modules/auth'
  import { getCachedChapter, setCachedChapter } from '$lib/modules/cache'
  import { extensions } from '$lib/modules/extensions/extensions'
  import { readerType as getReaderType } from '$lib/modules/anilist'

  export let data: PageData

  $: media = data.media

  $: readerType = getReaderType(media)

  let selectedSourceId: string | null = null
  let chapters: Array<{ chapter: number, title?: string }> = []
  let currentChapter: number | null = null
  let chapterContent: { pages?: string[], html?: string, title?: string, language: string } | null = null
  let loading = false
  let loadingChapters = false
  let availableSources: Array<{ id: string, name: string, readingDirection?: 'rtl' | 'ltr' | 'vertical' }> = []

  $: if (media) loadSources()

  async function loadSources () {
    const type = readerType as 'manga' | 'novel'
    availableSources = []
    for await (const src of extensions.readerSources({ media, type })) {
      availableSources = [...availableSources, src]
    }
    if (!selectedSourceId && availableSources.length) {
      selectedSourceId = availableSources[0]!.id
      await loadChapters()
    }
  }

  async function loadChapters () {
    if (!selectedSourceId) return
    loadingChapters = true
    chapters = []
    try {
      const type = readerType as 'manga' | 'novel'
      const results = await extensions.readerChapters({ media, type, language: 'en' })
      const sourceResult = results[selectedSourceId]
      if (sourceResult?.error) {
        toast.error(`Error from ${availableSources.find(s => s.id === selectedSourceId)?.name}`, { description: sourceResult.error.error.message })
      }
      chapters = sourceResult?.chapters ?? []
    } catch (e) {
      toast.error('Failed to load chapters', { description: (e as Error).message })
    }
    loadingChapters = false
  }

  async function openChapter (chapter: number) {
    if (!selectedSourceId) return
    currentChapter = chapter
    loading = true
    chapterContent = null

    const cached = await getCachedChapter(selectedSourceId, media.id, chapter, 'en')
    if (cached) {
      chapterContent = { pages: 'pages' in cached ? cached.pages : undefined, html: 'html' in cached ? cached.html : undefined, title: cached.title, language: cached.language }
      loading = false
      preloadChapter(chapter + 1)
      return
    }

    try {
      const type = readerType as 'manga' | 'novel'
      const result = await extensions.readerChapter({ media, type, chapter, sourceId: selectedSourceId, language: 'en' })
      chapterContent = { pages: result.pages, html: result.html, title: result.title, language: result.language }
      await setCachedChapter(selectedSourceId, media.id, chapter, 'en', { title: result.title, pages: result.pages, html: result.html })
    } catch (e) {
      toast.error('Failed to load chapter', { description: (e as Error).message })
    }
    loading = false
    preloadChapter(chapter + 1)
  }

  async function preloadChapter (chapter: number) {
    if (!selectedSourceId || !chapters.some(c => c.chapter === chapter)) return
    const cached = await getCachedChapter(selectedSourceId, media.id, chapter, 'en')
    if (cached) return
    try {
      const type = readerType as 'manga' | 'novel'
      const result = await extensions.readerChapter({ media, type, chapter, sourceId: selectedSourceId, language: 'en' })
      await setCachedChapter(selectedSourceId, media.id, chapter, 'en', { title: result.title, pages: result.pages, html: result.html })
    } catch {
    // silent fail for preload
    }
  }

  async function onNextChapter () {
    if (currentChapter == null) return
    const next = chapters.find(c => c.chapter > currentChapter!)
    if (next) {
      await openChapter(next.chapter)
    } else {
      await syncProgress(currentChapter, 'COMPLETED')
      goto(`/#/app/media/${media.id}`)
    }
  }

  async function onPrevChapter () {
    if (currentChapter == null) return
    const prev = [...chapters].reverse().find(c => c.chapter < currentChapter!)
    if (prev) await openChapter(prev.chapter)
  }

  async function onCloseReader () {
    if (currentChapter != null) await syncProgress(currentChapter)
    goto(`/#/app/media/${media.id}`)
  }

  // ponytail: progress sync via auth module — same Entry mutation as anime episode tracking
  async function syncProgress (chapter: number, status: 'CURRENT' | 'COMPLETED' = 'CURRENT') {
    try {
      await auth.entry({ id: media.id, progress: Math.floor(chapter), status })
    } catch {
    // silent fail — progress sync is best-effort
    }
  }

  function selectSource (id: string) {
    selectedSourceId = id
    currentChapter = null
    chapterContent = null
    loadChapters()
  }
</script>

<div class='flex flex-col h-full'>
  <div class='flex items-center gap-2 px-4 py-2 bg-background border-b border-border shrink-0'>
    <Button size='icon' variant='ghost' on:click={onCloseReader}>
      <ChevronLeft class='size-4' />
    </Button>
    <div class='flex-1 min-w-0'>
      <h2 class='text-sm font-bold truncate'>{media.title?.userPreferred}</h2>
      {#if currentChapter != null}
        <p class='text-xs text-muted-foreground'>Chapter {currentChapter}</p>
      {/if}
    </div>
    {#if availableSources.length > 1}
      <select class='text-xs bg-muted rounded px-2 py-1' value={selectedSourceId} on:change={(e) => selectSource(e.currentTarget.value)}>
        {#each availableSources as src (src.id)}
          <option value={src.id}>{src.name}</option>
        {/each}
      </select>
    {/if}
  </div>

  <div class='flex flex-1 min-h-0'>
    <div class='w-48 shrink-0 border-r border-border overflow-y-auto bg-muted/30'>
      {#if loadingChapters}
        <div class='p-4 text-xs text-muted-foreground'>Loading chapters...</div>
      {:else if chapters.length === 0}
        <div class='p-4 text-xs text-muted-foreground'>
          {#if availableSources.length === 0}
            No {readerType} sources enabled. Add extensions in Settings.
          {:else}
            No chapters found.
          {/if}
        </div>
      {:else}
        <div class='flex flex-col'>
          {#each [...chapters].reverse() as ch (ch.chapter)}
            <button
              class='text-left px-3 py-2 text-xs hover:bg-muted transition-colors border-b border-border/50 {currentChapter === ch.chapter ? 'bg-accent font-bold' : ''}'
              on:click={() => openChapter(ch.chapter)}
            >
              <div class='truncate'>Chapter {ch.chapter}</div>
              {#if ch.title}
                <div class='text-muted-foreground truncate text-[10px]'>{ch.title}</div>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class='flex-1 min-w-0 overflow-hidden'>
      {#if loading}
        <div class='flex items-center justify-center h-full'>
          <div class='text-sm text-muted-foreground'>Loading chapter...</div>
        </div>
      {:else if chapterContent}
        {#if readerType === 'novel'}
          <NovelReader
            html={chapterContent.html ?? ''}
            {onNextChapter}
            {onPrevChapter}
          />
        {:else}
          <MangaReader
            pages={chapterContent.pages ?? []}
            readingDirection={availableSources.find(s => s.id === selectedSourceId)?.readingDirection ?? 'rtl'}
            {onNextChapter}
            {onPrevChapter}
          />
        {/if}
      {:else if currentChapter == null}
        <div class='flex items-center justify-center h-full'>
          <div class='text-sm text-muted-foreground'>Select a chapter to start reading</div>
        </div>
      {/if}
    </div>
  </div>
</div>
