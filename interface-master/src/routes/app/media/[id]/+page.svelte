<script lang='ts'>
  import { SvelteFlowProvider } from '@xyflow/svelte'
  import BookOpen from 'lucide-svelte/icons/book-open'
  import { toast } from 'svelte-sonner'

  import type { PageData } from './$types'

  import EpisodesList from '$lib/components/EpisodesList.svelte'
  import Recommendation from '$lib/components/ui/cards/recommendation.svelte'
  import { Relations } from '$lib/components/ui/relations'
  import * as Tabs from '$lib/components/ui/tabs'
  import { Themes } from '$lib/components/ui/themes'
  import type { Media } from '$lib/modules/anilist/types'
  import { readerType } from '$lib/modules/anilist'
  import { extensions } from '$lib/modules/extensions/extensions'
  import '@xyflow/svelte/dist/style.css'
  import { dragScroll } from '$lib/modules/navigate'
  import { cn } from '$lib/utils'

  export let data: PageData

  $: anime = data.anime
  $: info = data.info
  // ponytail: info is null for manga; fall back to IDMedia store
  $: media = ($info?.data?.Media ?? $anime.Media) as Media

  $: isManga = media.type === 'MANGA'

  let expanded = false
  $: mediaId = media.id
  $: eps = data.eps

  // Manga chapter listing
  let selectedSourceId: string | null = null
  let chapters: Array<{ chapter: number, title?: string }> = []
  let loadingChapters = false
  let availableSources: Array<{ id: string, name: string }> = []

  $: if (isManga && media) loadSources()

  async function loadSources () {
    availableSources = []
    for await (const src of extensions.readerSources({ media, type: readerType(media) })) {
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
      const results = await extensions.readerChapters({ media, type: readerType(media), language: 'en' })
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

  function selectSource (id: string) {
    selectedSourceId = id
    loadChapters()
  }

  let value: string
</script>

<Tabs.Root bind:value class='w-full' activateOnFocus={false} orientation='horizontal'>
  <div class='flex justify-start overflow-x-auto' use:dragScroll>
    <Tabs.List orientation='horizontal'>
      {#if isManga}
        <Tabs.Trigger value='chapters' tabindex={0} class='px-8 data-[state=active]:bg-custom data-[state=active]:text-contrast data-[state=active]:font-bold'>Chapters</Tabs.Trigger>
        <Tabs.Trigger value='relations' tabindex={0} class='px-8 data-[state=active]:bg-custom data-[state=active]:text-contrast data-[state=active]:font-bold'>Relations</Tabs.Trigger>
        <Tabs.Trigger value='recommendations' tabindex={0} class='px-8 data-[state=active]:bg-custom data-[state=active]:text-contrast data-[state=active]:font-bold'>Recommendations</Tabs.Trigger>
      {:else}
        <Tabs.Trigger value='episodes' tabindex={0} class='px-8 data-[state=active]:bg-custom data-[state=active]:text-contrast data-[state=active]:font-bold'>Episodes</Tabs.Trigger>
        <Tabs.Trigger value='relations' tabindex={0} class='px-8 data-[state=active]:bg-custom data-[state=active]:text-contrast data-[state=active]:font-bold'>Relations</Tabs.Trigger>
        <Tabs.Trigger value='threads' tabindex={0} class='px-8 data-[state=active]:bg-custom data-[state=active]:text-contrast data-[state=active]:font-bold'>Threads</Tabs.Trigger>
        <Tabs.Trigger value='themes' tabindex={0} class='px-8 data-[state=active]:bg-custom data-[state=active]:text-contrast data-[state=active]:font-bold'>Themes</Tabs.Trigger>
        <Tabs.Trigger value='recommendations' tabindex={0} class='px-8 data-[state=active]:bg-custom data-[state=active]:text-contrast data-[state=active]:font-bold'>Recommendations</Tabs.Trigger>
      {/if}
    </Tabs.List>
  </div>

  {#if isManga}
    <Tabs.Content value='chapters' tabindex={-1}>
      <div class='pt-3'>
        {#if availableSources.length > 1}
          <div class='flex items-center gap-2 mb-3'>
            <span class='text-xs text-muted-foreground'>Source:</span>
            <select class='text-xs bg-muted rounded px-2 py-1' value={selectedSourceId} on:change={(e) => selectSource(e.currentTarget.value)}>
              {#each availableSources as src (src.id)}
                <option value={src.id}>{src.name}</option>
              {/each}
            </select>
          </div>
        {/if}
        {#if loadingChapters}
          <div class='p-4 text-xs text-muted-foreground'>Loading chapters...</div>
        {:else if chapters.length === 0}
          <div class='p-4 text-xs text-muted-foreground'>
            {#if availableSources.length === 0}
              No manga sources enabled. Add extensions in Settings.
            {:else}
              No chapters found.
            {/if}
          </div>
        {:else}
          <div class='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
            {#each [...chapters].reverse() as ch (ch.chapter)}
              <a href='/#/app/reader/{media.id}' class='flex items-center gap-2 px-3 py-2 text-sm rounded border border-border hover:bg-muted transition-colors'>
                <BookOpen class='size-3.5 shrink-0 text-muted-foreground' />
                <span class='truncate'>Chapter {ch.chapter}</span>
                {#if ch.title}
                  <span class='text-muted-foreground truncate text-xs ml-auto'>{ch.title}</span>
                {/if}
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </Tabs.Content>
  {:else}
    <Tabs.Content value='episodes' tabindex={-1}>
      <EpisodesList {media} {eps} following={info!} class='overflow-y-visible' />
    </Tabs.Content>
  {/if}
  <Tabs.Content value='relations' tabindex={-1}>
    {#if value === 'relations'}
      <div class={cn('border border-border rounded overflow-clip mt-3 transition-[height]', expanded ? 'h-[80vh]' : 'h-72')}>
        <SvelteFlowProvider>
          <Relations {media} bind:expanded />
        </SvelteFlowProvider>
      </div>
    {/if}
  </Tabs.Content>
  {#if !isManga}
    <Tabs.Content value='threads' tabindex={-1}>
      {#key mediaId}
        {#if value === 'threads'}
        {/if}
      {/key}
    </Tabs.Content>
    <Tabs.Content value='themes' tabindex={-1}>
      {#key mediaId}
        {#if value === 'themes'}
          <Themes {media} />
        {/if}
      {/key}
    </Tabs.Content>
  {/if}
  <Tabs.Content value='recommendations' tabindex={-1}>
    {#key mediaId}
      {#if value === 'recommendations'}
        <div class='pointer-events-auto grid justify-center grid-cols-[repeat(auto-fill,minmax(184px,max-content))]'>
          {#if info}
            <Recommendation query={info} />
          {:else}
            <!-- ponytail: no animePage data for manga, recommendations unavailable -->
            <div class='text-sm text-muted-foreground p-4'>Recommendations not available for manga.</div>
          {/if}
        </div>
      {/if}
    {/key}
  </Tabs.Content>
</Tabs.Root>
