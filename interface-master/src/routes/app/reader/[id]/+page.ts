import { error } from '@sveltejs/kit'
import { get } from 'svelte/store'

import type { PageLoad } from './$types'

import { asyncStore } from '$lib/modules/anilist/client'
import { IDMedia } from '$lib/modules/anilist/queries'

export const load: PageLoad = async ({ params }) => {
  const id = Number(params.id)
  if (!id) return error(400, 'Invalid media ID')

  try {
    const store = await asyncStore(IDMedia, { id, type: 'MANGA' }, { requestPolicy: 'cache-first' })
    const media = get(store).Media
    if (!media) return error(404, 'Media not found')
    return { media }
  } catch (err) {
    return error(500, err as Error)
  }
}
