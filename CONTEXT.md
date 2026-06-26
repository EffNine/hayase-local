# Hayase-lite — Ubiquitous Language

A glossary of canonical terms used in the Hayase-lite domain.
This is a glossary, not a spec. Implementation details live in ADRs and code.

## Media types

- **Anime** — Japanese animation. Streamed as video from torrent pieces on demand. Tracked via AniList/MAL/Simkl/Kitsu.
- **Manga** — Japanese comics. Read as page images, chapter-by-chapter. Acquired via user-supplied sources (HTTP) or torrent archives (CBZ/CBR).
- **Manhwa** — Korean comics. Same reading model as manga; sources differ.
- **Light Novel (LN)** — Japanese prose novels. Read as text, chapter-by-chapter. Acquired via user-supplied sources (HTTP) or torrent files (EPUB/TXT/PDF).

## Acquisition

- **Source** — A user-supplied extension that fetches content for a media type. The app ships no sources. Users install them from community repos or write their own. A source has a manifest describing its type, capabilities, and options.
- **HTTP path** — Acquisition via direct HTTP from a source's API or HTML: content is fetched per-chapter/per-episode and rendered directly. No torrent engine involvement. The first-shipped path for manga/LN.
- **Torrent path** — Acquisition via the WebTorrent engine: content is downloaded as pieces from a swarm, streamed (video) or fetched-to-completion (archives), then rendered. Used for anime today. Manga/LN torrent-archive rendering (CBZ/CBR/EPUB extraction) is deferred to a later phase — not in v1.
- **Extension** — The unit of user-supplied functionality. Has a manifest (`ExtensionConfig`), runs in a sandboxed Web Worker, and implements one or more source interfaces. The term covers both torrent sources and HTTP sources.

## Extension system

- **Extension manifest** — The declarative config (`ExtensionConfig`) describing an extension: id, name, version, type, languages, code URL, options. Distributed via `gh:`, `npm:`, or direct URL. One manifest schema, discriminated union on `type`. Fields `media` and `accuracy` are optional — only required for `torrent`/`nzb` types. Type-specific optional fields: `readingDirection` (manga), `nsfw` (both), `rateLimit` (both). The `url` field (base64-encoded) accepts a string or array of strings — all domains the source fetches from, auto-registered with `enableCORS` on install/enable.
- **Extension worker** — The sandboxed Web Worker (`ExtensionWorker`) that loads extension code via blob URL + dynamic import, injects `fetch`, and proxies query/result calls. One class handles all five types. `single`/`batch`/`movie` methods serve torrent/nzb/subtitle; `chapters`/`chapter` methods serve manga/novel. The accuracy proxy (`queryProxy`/`computeAccuracy`) applies to torrent/nzb only — manga/novel sources receive the query directly, no accuracy tracking.
- **Extension type** — The category of content an extension provides. Currently `torrent | nzb | subtitle`; planned to add `manga | novel`. Each type has its own query/result interfaces. Source authors implement only the type they need.
- **Extension settings** — Single settings page (`/app/settings/extensions`) for all extension types. Grouped by type in collapsible sections. One install flow (paste URL / import from repo). No curated marketplace — the app ships no sources and recommends none, for legal cleanliness.

## Manga/novel source contract

- **MangaQuery** — What the app sends to a manga source: `media` (AniList Media), `anilistId`, `malId`, `titles`, `chapter`, `language`, `fetch`. Chapter-based, not episode-based.
- **NovelQuery** — Same shape as MangaQuery, for novel sources.
- **MangaChapterResult** — What a manga source returns: `chapter`, `title?`, `language`, `pages` (ordered image URLs).
- **NovelChapterResult** — What a novel source returns: `chapter`, `title?`, `language`, `html` (sanitized HTML text).
- **chapters()** — Source method: lists available chapters for a title. Returns `Array<{ chapter, title? }>`.
- **chapter()** — Source method: fetches one chapter's content (pages or text).
- **Source selection** — Chapter list is per-source, not merged across sources. User selects a source from a dropdown of enabled sources; the chapter list shows that source's chapters. No deduplication — two sources' chapter 47 are different content (different scanlators/translations).
- **Source priority** — User-configured drag-to-reorder list of enabled sources in settings. When opening a chapter, the first source that has it wins. User can manually switch source from a dropdown in the reader.
- **Dummy example** — Reference extensions shipped in the main app repo at `examples/extensions/` — one per type (`torrent`, `nzb`, `subtitle`, `manga`, `novel`). Source authors copy these and replace fetch logic. Each has a manifest entry in `examples/extensions/index.json` and a `.js` code file. Not real sources — return placeholder content. The `hayase-new-extensions` repo is separate and will be updated later to match these formats.
- **Reading direction** — Display concern, not acquisition. Declared per-source in the manifest (`readingDirection: 'rtl' | 'ltr' | 'vertical'`), user-overridable. Manga → rtl, manhwa → vertical, manhua → ltr. One reader component handles all three via this setting.
## Readers

- **MangaReader** — Image-sequence reader for manga, manhwa, and manhua. Takes `pages: string[]`, direction from manifest (`readingDirection`), mode toggleable (page-by-page or vertical scroll). One component, three media subtypes.
- **NovelReader** — Text reader for light novels. Takes `html: string` (sanitized via `dompurify`). Separate component — shares no rendering code with MangaReader. Font controls, night mode, text pagination/scroll.
- **Reader route** — Shared route shell (`/app/reader/[id]`) that dispatches to MangaReader or NovelReader based on media type. Both readers share chapter list navigation and reading progress tracking.
- **Detail page** — Generalized `/app/media/[id]` route (replaces `/app/anime/[id]`). Branches internally on AniList `media.type`: anime shows episode list + torrent sources + player link; manga/novel shows chapter list + source extensions + reader link. Shared shell: AniList metadata (cover, title, description, tags, scores), tracking buttons.
- **EPUB** — A source acquisition format, not a reader format. Source extensions running in the worker unzip EPUBs and extract XHTML chapters. The NovelReader never sees EPUB — only canonical HTML.

## Caching

- **Chapter cache** — Manga pages and novel HTML are cached in IndexedDB (`idb-keyval`), keyed by `sourceId:mediaId:chapter:language`. Cache-on-read: first fetch stores, subsequent reads serve from cache. Enables offline reading.
- **Preload** — When reading chapter N, chapter N+1 is preloaded in the background for seamless reading.
- **Cache eviction** — LRU by size cap, user-configurable. User can clear cache per-series or globally from settings.
- **Download all** — Batch-download-all-chapters for offline. Deferred to a later phase, not v1. Single-chapter cache-on-read + preload-next is the v1 scope.

## Tracking

- **Tracker** — An external service (AniList, MAL, Simkl, Kitsu) used for progress tracking and metadata. Distinct from a Source (which provides content). Same trackers serve all four media types — AniList and MAL have manga entries with chapter/volume progress.
- **Progress sync** — Reading progress syncs to AniList/MAL on chapter transition (navigate to next chapter or close reader). The chapter number becomes `progress` in the tracker's media list entry. Same `SaveMediaListEntry` mutation as anime episode tracking. No "reached end" detection — sync is on navigation, not on scroll position.
- **Manual mark** — User can manually mark chapters as read/unread from the chapter list (context menu). For correcting progress when chapters are skipped or re-read.
- **Library** — Single library page, tabbed by media type: "Watching" (anime, from torrent engine + AniList tracking) / "Reading" (manga + LN, from AniList tracking + IDB cache) / "All". Tabs map to AniList status values. Manga/novel entries show a cached-chapters badge ("N chapters cached") from IDB lookup.
- **Discovery** — The flow of finding a title to read/watch. Reuses AniList/MAL search across all media types. The user searches AniList, clicks a title, then the app fetches chapters/episodes from the user's enabled source extensions by matching titles.
- **Media-type filter** — A toggle in the search modal (Anime / Manga / All). Maps to AniList's `type` field (`ANIME | MANGA`). Novels are `MANGA` with `format: NOVEL` on AniList — covered by the broad "Manga" toggle in v1. Format sub-filters (manhwa, manhua, novel) deferred.