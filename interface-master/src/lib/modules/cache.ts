import { get, set, del, keys, createStore } from 'idb-keyval'

const store = createStore('hayase-chapter-cache', 'chapters')

function chapterKey (sourceId: string, mediaId: number, chapter: number, language: string): string {
  return `${sourceId}:${mediaId}:${chapter}:${language}`
}

function mediaPrefix (mediaId: number): string {
  return `:${mediaId}:`
}

export interface CachedMangaChapter {
  chapter: number
  title?: string
  language: string
  pages: string[]
  cachedAt: number
}

export interface CachedNovelChapter {
  chapter: number
  title?: string
  language: string
  html: string
  cachedAt: number
}

export async function getCachedChapter (sourceId: string, mediaId: number, chapter: number, language: string): Promise<CachedMangaChapter | CachedNovelChapter | undefined> {
  return await get<CachedMangaChapter | CachedNovelChapter>(chapterKey(sourceId, mediaId, chapter, language), store)
}

export async function setCachedChapter (sourceId: string, mediaId: number, chapter: number, language: string, data: { title?: string, pages?: string[], html?: string }): Promise<void> {
  const cached = { ...data, chapter, language, cachedAt: Date.now() }
  await set(chapterKey(sourceId, mediaId, chapter, language), cached, store)
}

export async function deleteCachedChapter (sourceId: string, mediaId: number, chapter: number, language: string): Promise<void> {
  await del(chapterKey(sourceId, mediaId, chapter, language), store)
}

export async function clearCachedMedia (mediaId: number): Promise<void> {
  const allKeys = await keys(store)
  const prefix = mediaPrefix(mediaId)
  for (const key of allKeys) {
    if (typeof key === 'string' && key.includes(prefix)) {
      await del(key, store)
    }
  }
}

export async function cachedChapterCount (mediaId: number): Promise<number> {
  const allKeys = await keys(store)
  const prefix = mediaPrefix(mediaId)
  return allKeys.filter(key => typeof key === 'string' && key.includes(prefix)).length
}
