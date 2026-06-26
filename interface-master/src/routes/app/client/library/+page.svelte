<script lang='ts'>
  import { LibraryTable } from '$lib/components/ui/torrentclient'
  import * as Tabs from '$lib/components/ui/tabs'
  import client from '$lib/modules/anilist/client'
  import { cover, title as titleFn } from '$lib/modules/anilist'
  import { Load } from '$lib/components/ui/img'
  import { goto } from '$app/navigation'
  import { cachedChapterCount } from '$lib/modules/cache'
  import type { Media } from '$lib/modules/anilist'

  // ponytail: subscribe to client.mangalists (a derived store on the client instance)
  const mangalist = client.mangalists
  $: mangaEntries = $mangalist?.data?.MediaListCollection?.lists?.flatMap((l: any) => l?.entries ?? []) ?? []

  let cachedCounts: Record<number, number> = {}
  $: if (mangaEntries.length) {
    mangaEntries.forEach(async (e: any) => {
      if (e?.media?.id) {
        const count = await cachedChapterCount(e.media.id)
        cachedCounts = { ...cachedCounts, [e.media.id]: count }
      }
    })
  }

  function openReader (id: number) {
    goto(`/#/app/reader/${id}`)
  }
</script>

<div class='flex flex-col size-full'>
  <Tabs.Root class='w-full' activateOnFocus={false} orientation='horizontal'>
    <Tabs.List orientation='horizontal'>
      <Tabs.Trigger value='watching' tabindex={0} class='px-8 py-2 data-[state=active]:bg-custom data-[state=active]:text-contrast data-[state=active]:font-bold'>Watching</Tabs.Trigger>
      <Tabs.Trigger value='reading' tabindex={0} class='px-8 py-2 data-[state=active]:bg-custom data-[state=active]:text-contrast data-[state=active]:font-bold'>Reading</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value='watching' tabindex={-1}>
      <LibraryTable />
    </Tabs.Content>
    <Tabs.Content value='reading' tabindex={-1}>
      {#if !mangaEntries.length}
        <div class='flex items-center justify-center h-40 text-sm text-muted-foreground'>
          No manga/novel in your reading list. Track titles on AniList to see them here.
        </div>
      {:else}
        <div class='grid grid-cols-[repeat(auto-fill,minmax(160px,max-content))] gap-4 p-4'>
          {#each mangaEntries as entry (entry?.media?.id)}
            {@const media = entry?.media as Media | undefined}
            {#if media}
              <button class='flex flex-col gap-2 text-left' on:click={() => openReader(media.id)}>
                <div class='w-[140px] h-[200px] rounded overflow-hidden bg-muted'>
                  <Load src={cover(media)} color={media.coverImage?.color} class='size-full object-cover' />
                </div>
                <div class='text-xs font-bold truncate w-[140px]'>{titleFn(media)}</div>
                <div class='text-xs text-muted-foreground'>
                  {#if entry?.media?.mediaListEntry?.progress != null}Ch {entry.media.mediaListEntry.progress}{/if}
                  {#if cachedCounts[media.id]} · {cachedCounts[media.id]} cached{/if}
                </div>
              </button>
            {/if}
          {/each}
        </div>
      {/if}
    </Tabs.Content>
  </Tabs.Root>
</div>