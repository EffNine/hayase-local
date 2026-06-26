# Hayase-lite Extension Examples

Reference extensions for source authors. Each file demonstrates the contract for one extension type. These are **not real sources** — they return placeholder content.

## Extension types

| Type | Code file | Query shape | Result shape |
|------|-----------|-------------|--------------|
| `torrent` | `dummy-torrent.js` | `AnimeQuery` (episode, titles, resolution) | `TorrentResult[]` (hash, link, seeders) |
| `nzb` | `dummy-nzb.js` | `NZBQuery` (file/files, hash, name) | `string` (NZB XML) or `undefined` |
| `subtitle` | `dummy-subtitle.js` | `AnimeQuery` (without resolution/exclusions) | `Array<{ url, language }>` |
| `manga` | `dummy-manga.js` | `MangaQuery` (chapter, titles, language) | `MangaChapterResult` (pages: string[]) |
| `novel` | `dummy-novel.js` | `NovelQuery` (chapter, titles, language) | `NovelChapterResult` (html: string) |

## Manifest schema

All types share one manifest schema (`ExtensionConfig`), discriminated by `type`. See `index.json` for examples.

### Shared fields (all types)

| Field | Required | Description |
|-------|----------|-------------|
| `manifestVersion` | yes | Currently `2` |
| `deprecated` | yes | `false` to show in the extension list |
| `name` | yes | Display name |
| `id` | yes | Unique identifier (kebab-case) |
| `version` | yes | Semantic version string |
| `type` | yes | `torrent` \| `nzb` \| `subtitle` \| `manga` \| `novel` |
| `languages` | yes | Array of ISO country codes or `["ALL"]` |
| `icon` | yes | URL to the extension icon |
| `code` | yes | URL to the extension code (`gh:`, `npm:`, or direct URL) |
| `update` | yes | URL to the index file for update checks |
| `description` | no | Short description |
| `url` | no | Base64-encoded API URL(s) to enable CORS on. String or array of strings. |
| `options` | no | User-configurable options (see `SearchOptions`) |

### Torrent/NZB-only fields

| Field | Required | Description |
|-------|----------|-------------|
| `media` | yes | `"sub"` \| `"dub"` \| `"both"` |
| `accuracy` | yes | `"high"` \| `"medium"` \| `"low"` — confidence of source matching |
| `ratio` | no | Perma-seeding ratio or `0` |
| `updatePeers` | no | `false` to skip peer count scraping |

### Manga-only fields

| Field | Required | Description |
|-------|----------|-------------|
| `readingDirection` | no | `"rtl"` \| `"ltr"` \| `"vertical"`. Default: `"rtl"`. Manga → rtl, manhwa → vertical, manhua → ltr. User-overridable. |

### Manga/Novel shared optional fields

| Field | Required | Description |
|-------|----------|-------------|
| `nsfw` | no | `true` if the source serves adult content. UI can filter/hide by default. |
| `rateLimit` | no | Max requests per second. The orchestrator throttles via `bottleneck`. |

## Source interfaces

### Torrent/NZB/Subtitle (existing)

```ts
class TorrentSource {
  test: () => Promise<boolean>
  single: (query: AnimeQuery, options?: SearchOptions) => Promise<TorrentResult[]>
  batch: (query: AnimeQuery, options?: SearchOptions) => Promise<TorrentResult[]>
  movie: (query: AnimeQuery, options?: SearchOptions) => Promise<TorrentResult[]>
}

class NZBSource {
  test: () => Promise<boolean>
  single: (query: NZBQuery<{ file: string }>, options?: SearchOptions) => Promise<string | undefined>
  batch: (query: NZBQuery<{ files: string[], name: string }>, options?: SearchOptions) => Promise<string | undefined>
}

class SubtitleSource {
  test: () => Promise<boolean>
  single: (query: AnimeQuery, options?: SearchOptions) => Promise<Array<{ url: string, language: string }>>
}
```

### Manga (new)

```ts
interface MangaQuery {
  media: any           // AniList Media object
  anilistId: number
  malId?: number
  titles: string[]     // romaji, english, native, synonyms
  chapter?: number     // specific chapter; undefined = latest
  language: string
  fetch: typeof fetch
}

interface MangaChapterResult {
  chapter: number
  title?: string
  language: string
  pages: string[]      // ordered image URLs
}

class MangaSource {
  test: () => Promise<boolean>
  chapters: (query: Omit<MangaQuery, 'chapter'>) => Promise<Array<{ chapter: number, title?: string }>>
  chapter: (query: MangaQuery) => Promise<MangaChapterResult>
}
```

### Novel (new)

```ts
interface NovelQuery {
  media: any           // AniList Media object
  anilistId: number
  malId?: number
  titles: string[]
  chapter?: number
  language: string
  fetch: typeof fetch
}

interface NovelChapterResult {
  chapter: number
  title?: string
  language: string
  html: string         // sanitized HTML text (DOMPurify runs before render)
}

class NovelSource {
  test: () => Promise<boolean>
  chapters: (query: Omit<NovelQuery, 'chapter'>) => Promise<Array<{ chapter: number, title?: string }>>
  chapter: (query: NovelQuery) => Promise<NovelChapterResult>
}
```

## How to write a source

1. Copy the dummy file for your type (e.g. `dummy-manga.js`).
2. Replace `test()`, `chapters()`, and `chapter()` (or `single`/`batch`/`movie` for torrent) with your target site's logic.
3. Use the injected `fetch` from the query for all HTTP requests — it handles CORS.
4. If your source fetches from multiple domains, list them all in the `url` manifest field (base64-encoded, string or array).
5. Add an entry to `index.json` with your manifest.
6. Host the `.js` file and `index.json` on GitHub raw, npm, or any static URL.
7. Users install by pasting the `index.json` URL in Settings → Extensions.

## Legal note

Hayase-lite ships no sources. Users supply their own. Source authors are responsible for complying with the terms of service of the sites they scrape.