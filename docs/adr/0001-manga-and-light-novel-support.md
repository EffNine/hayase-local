# ADR 0001: Manga and Light Novel Support via Extended Extension System

**Date:** 2026-06-26
**Status:** Accepted

## Context

Hayase-lite is a desktop torrent-streaming app (Electron + SvelteKit), forked from Miru. The existing extension system supports `torrent`, `nzb`, and `subtitle` source types — all anime-focused, returning magnet links / NZB strings / subtitle URLs based on episode-number queries.

The goal is to add manga, manhwa, manhua, and light novel reading. These media types have fundamentally different acquisition and rendering models:

- **Acquisition:** chapter-based HTTP fetch (per-chapter image pages or HTML text), not episode-based torrent streaming.
- **Rendering:** image-sequence reader (manga) or text reader (novel), not a video player.
- **Tracking:** chapter-count progress on AniList/MAL, not episode-count.

The app stays legally clean by shipping no sources — users supply their own via the extension system, same as the existing torrent sources.

## Decision

Extend the existing extension system with two new types (`manga`, `novel`) rather than building a parallel plugin architecture.

### 1. One manifest schema, discriminated union on `type`

Add `manga` and `novel` to `ExtensionConfig.type`. Shared fields (`id`, `name`, `version`, `code`, `update`, `languages`, `options`, `url`, `icon`) are reused. `media` and `accuracy` are optional — only required for `torrent`/`nzb`. New type-specific fields: `readingDirection` (manga), `nsfw` (both), `rateLimit` (both). The `url` field accepts a string or array (for multi-domain CORS).

**Rejected: Separate manifest schema for manga/novel.** Would split documentation, install UI, and source-author learning. One manifest = one install flow = one settings page.

### 2. New query/result interfaces, same worker class

Manga/novel sources implement `chapters(query) → Array<{ chapter, title? }>` and `chapter(query) → MangaChapterResult | NovelChapterResult`. MangaChapterResult returns `pages: string[]` (image URLs). NovelChapterResult returns `html: string` (sanitized text).

The existing `ExtensionWorker` class is extended — one class handles all five types. `single`/`batch`/`movie` serve torrent/nzb/subtitle; `chapters`/`chapter` serve manga/novel. The accuracy proxy (`queryProxy`/`computeAccuracy`) applies to torrent/nzb only.

**Rejected: Separate worker classes per type.** Would duplicate blob-URL loading, `finalizer`, and `url()` logic with 80% overlap.

### 3. Two readers, shared route shell

`MangaReader.svelte` (image-sequence, direction from manifest, page-by-page or vertical scroll) and `NovelReader.svelte` (HTML text, font controls, night mode). Shared route `/app/reader/[id]` dispatches by media type. Shared chapter-list navigation and progress tracking.

**Rejected: One unified reader with mode toggle.** Image rendering and text rendering share no meaningful code. A unified component would be bloated with two unrelated rendering engines.

### 4. HTTP path first, torrent-archive deferred

Manga/novel v1 uses the HTTP path only — source extensions fetch per-chapter content via injected `fetch`. Torrent-archive rendering (CBZ/CBR/EPUB extraction from downloaded torrents) is deferred to a later phase.

**Rejected: Torrent-only for manga/LN.** Would exclude MangaDex/Comick-style sources, which are the highest-quality and most stable. The HTTP path is higher-value and lower-effort.

### 5. AniList/MAL for all four media types

Reuse the existing tracker integration for discovery and progress. AniList has manga entries with chapter/volume progress. Novels are `MANGA` type with `format: NOVEL`. Search gets a media-type filter toggle (Anime / Manga / All). Progress syncs on chapter transition (navigate to next or close reader).

**Rejected: Separate tracker for novels (e.g. NovelUpdates).** Would double the auth surface and fragment the user's tracked list.

### 6. IDB caching, cache-on-read + preload-next

Manga pages and novel HTML cached in IndexedDB (`idb-keyval`), keyed by `sourceId:mediaId:chapter:language`. Service worker + Workbox intercepts image requests. LRU eviction by user-configurable size cap. "Download all chapters" deferred.

**Rejected: Disk caching in the torrent download folder.** Would require routing through IPC to the torrent utility process, adding complexity. IDB stays in the renderer, uses existing dependencies, and is sufficient for v1.

### 7. No source deduplication for manga/novel

Chapter lists are per-source. Two sources' chapter 47 are different content (different scanlators). User picks a source from a dropdown; user-configured priority order determines the default.

**Rejected: Merge chapters across sources like torrent hash dedup.** Manga/novel chapters aren't hash-identifiable — different sources serve genuinely different content for the same chapter number.

### 8. Dummy examples in the main app repo

Reference extensions at `examples/extensions/` — one per type (`dummy-torrent.js`, `dummy-nzb.js`, `dummy-subtitle.js`, `dummy-manga.js`, `dummy-novel.js`) with `index.json` and `README.md`. The `hayase-new-extensions` repo stays separate and will be updated later to match these formats.

## Consequences

- `native-main/index.ts` `ExtensionConfig.type` union grows from 3 to 5 values.
- `interface-master/src/lib/modules/extensions/types.d.ts` gains `MangaSource`, `NovelSource`, `MangaQuery`, `NovelQuery`, `MangaChapterResult`, `NovelChapterResult` interfaces.
- `interface-master/src/lib/modules/extensions/worker.ts` `ExtensionWorker` gains `chapters()` and `chapter()` methods; `_state` union grows.
- `interface-master/src/lib/modules/extensions/extensions.ts` gains manga/novel orchestration (chapter listing, source priority, no dedup, no accuracy).
- New routes: `/app/reader/[id]` (reader shell), generalization of `/app/anime/[id]` → `/app/media/[id]`.
- New components: `MangaReader.svelte`, `NovelReader.svelte`.
- IDB cache module in `interface-master/src/lib/modules/` for chapter caching.
- Library page gains tabs for media type.
- Search modal gains media-type filter.
- `examples/extensions/` directory with 5 dummy extensions + docs.