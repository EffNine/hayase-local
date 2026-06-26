/* eslint-disable @typescript-eslint/no-explicit-any */
export type Accuracy = 'high' | 'medium' | 'low'

type CountryCodes = 'ALL' | 'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 'AQ' | 'AR' | 'AS' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | 'BA' | 'BB' | 'BD' | 'BE' | 'BF' | 'BG' | 'BH' | 'BI' | 'BJ' | 'BL' | 'BM' | 'BN' | 'BO' | 'BQ' | 'BR' | 'BS' | 'BT' | 'BV' | 'BW' | 'BY' | 'BZ' | 'CA' | 'CC' | 'CD' | 'CF' | 'CG' | 'CH' | 'CI' | 'CK' | 'CL' | 'CM' | 'CN' | 'CO' | 'CR' | 'CU' | 'CV' | 'CW' | 'CX' | 'CY' | 'CZ' | 'DE' | 'DJ' | 'DK' | 'DM' | 'DO' | 'DZ' | 'EC' | 'EE' | 'EG' | 'EH' | 'ER' | 'ES' | 'ET' | 'FI' | 'FJ' | 'FK' | 'FM' | 'FO' | 'FR' | 'GA' | 'GB' | 'GD' | 'GE' | 'GF' | 'GG' | 'GH' | 'GI' | 'GL' | 'GM' | 'GN' | 'GP' | 'GQ' | 'GR' | 'GS' | 'GT' | 'GU' | 'GW' | 'GY' | 'HK' | 'HM' | 'HN' | 'HR' | 'HT'

export type SearchOptions = Record<string, {
  type: 'string' | 'number' | 'boolean' | 'select'
  description: string
  values?: any[]
  default: any
}>

export type ExtensionType = 'torrent' | 'nzb' | 'subtitle' | 'manga' | 'novel'

export type ReadingDirection = 'rtl' | 'ltr' | 'vertical'

interface BaseExtensionConfig {
  manifestVersion: number
  deprecated: boolean
  name: string
  version: string
  description?: string
  id: string
  type: ExtensionType
  icon: string
  url?: string | string[]
  languages: CountryCodes[]
  update?: string
  code: string
  options?: SearchOptions
  nsfw?: boolean
  rateLimit?: number
}

export interface TorrentExtensionConfig extends BaseExtensionConfig {
  type: 'torrent'
  accuracy: Accuracy
  ratio?: 'perma' | number
  media: 'sub' | 'dub' | 'both'
  updatePeers?: false
}

export interface NZBExtensionConfig extends BaseExtensionConfig {
  type: 'nzb'
  accuracy: Accuracy
  ratio?: 'perma' | number
  media: 'sub' | 'dub' | 'both'
}

export interface SubtitleExtensionConfig extends BaseExtensionConfig {
  type: 'subtitle'
}

export interface MangaExtensionConfig extends BaseExtensionConfig {
  type: 'manga'
  readingDirection?: ReadingDirection
}

export interface NovelExtensionConfig extends BaseExtensionConfig {
  type: 'novel'
}

export type ExtensionConfig = TorrentExtensionConfig | NZBExtensionConfig | SubtitleExtensionConfig | MangaExtensionConfig | NovelExtensionConfig

export interface TorrentResult {
  title: string
  link: string
  id?: number
  seeders: number
  leechers: number
  downloads: number
  accuracy: Accuracy
  hash: string
  size: number
  date: Date
  type?: 'batch' | 'best' | 'alt'
}

export interface AnimeQuery {
  media: any
  anilistId: number
  anidbAid?: number
  anidbEid?: number
  tvdbId?: number
  tvdbEId?: number
  imdbId?: string
  tmdbId?: string
  titles: string[]
  episode: number
  episodeCount?: number
  absoluteEpisodeNumber?: number
  resolution: '2160' | '1080' | '720' | '540' | '480' | ''
  exclusions: string[]
}

export type AnimeQueryWithFetch = AnimeQuery & { fetch: typeof fetch }

export type NZBQuery<T> = {
  hash: string
  name: string
} & Omit<AnimeQuery, 'resolution' | 'exclusions'> & T

export type NZBQueryWithFetch<T> = NZBQuery<T> & { fetch: typeof fetch }

export type SearchFunction = (query: AnimeQueryWithFetch, options?: SearchOptions) => Promise<TorrentResult[]>
export type NZBFunction<T> = (query: NZBQueryWithFetch<T>, options?: SearchOptions) => Promise<string | undefined>

export class TorrentSource {
  test: () => Promise<boolean>
  single: SearchFunction
  batch: SearchFunction
  movie: SearchFunction
}

export class NZBSource {
  test: () => Promise<boolean>
  single: NZBFunction<{file: string}>
  batch: NZBFunction<{files: string[]}>
}

export class SubtitleSource {
  test: () => Promise<boolean>
  single: (query: Omit<AnimeQueryWithFetch, 'resolution' | 'exclusions'>, options?: SearchOptions) => Promise<Array<{url: string, language: string}>>
}

export interface ReaderQuery {
  media: any
  anilistId: number
  malId?: number
  titles: string[]
  chapter?: number
  language: string
  fetch: typeof fetch
}

export interface ChapterInfo {
  chapter: number
  title?: string
}

export interface MangaChapterResult {
  chapter: number
  title?: string
  language: string
  pages: string[]
}

export interface NovelChapterResult {
  chapter: number
  title?: string
  language: string
  html: string
}

export class MangaSource {
  test: () => Promise<boolean>
  chapters: (query: Omit<ReaderQuery, 'chapter'>, options?: SearchOptions) => Promise<ChapterInfo[]>
  chapter: (query: ReaderQuery, options?: SearchOptions) => Promise<MangaChapterResult>
}

export class NovelSource {
  test: () => Promise<boolean>
  chapters: (query: Omit<ReaderQuery, 'chapter'>, options?: SearchOptions) => Promise<ChapterInfo[]>
  chapter: (query: ReaderQuery, options?: SearchOptions) => Promise<NovelChapterResult>
}