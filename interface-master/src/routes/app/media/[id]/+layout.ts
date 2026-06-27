import { error } from '@sveltejs/kit'
import { get } from 'svelte/store'

import type { LayoutLoad } from './$types'

import { getParentForSpecial } from '$lib/modules/anilist'
import client, { asyncStore } from '$lib/modules/anilist/client'
import { IDMedia } from '$lib/modules/anilist/queries'
import { episodes } from '$lib/modules/anizip'

export const load: LayoutLoad = async ({ params, fetch }) => {
  const id = Number(params.id)

  // Try ANIME first (most common case)
  let store = asyncStore(IDMedia, { id, type: 'ANIME' }, { requestPolicy: 'cache-first' })
  let anime = await store
  let media = get(anime).Media

  if (!media) {
    // Not an anime — try manga (covers both manga and novel per CONTEXT.md)
    store = asyncStore(IDMedia, { id, type: 'MANGA' }, { requestPolicy: 'cache-first' })
    anime = await store
    media = get(anime).Media
    if (!media) return error(404, 'Media not found')
    return { eps: null, info: null, anime }
  }

  // Anime path — existing behavior
  const info = client.animePage(id)
  let eps = await episodes(id, fetch)

  if (!eps?.mappings?.anidb_id) {
    const parentID = getParentForSpecial(media)
    if (!parentID) return { eps, info, anime }
    eps = await episodes(parentID, fetch)
  }

  try {
    return { eps, info, anime }
  } catch (err) {
    return error(500, err as Error)
  }
}
