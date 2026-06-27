# Manga/Novel v1 — Implementation Plan

Outcome of the grill-with-docs session (see `CONTEXT.md` for the ubiquitous language and `docs/adr/0001-novel-as-distinct-extension-type.md` for the novel-type decision). This plan turns the resolved decisions into actionable work.

Design decisions are settled; this doc covers sequencing, files touched, acceptance criteria, and the deferred backlog.

## Section A — v1 fixes (in flight)

All decisions below are recorded in `CONTEXT.md`. Verification gate for code changes: `pnpm --filter interface-master check` (svelte-check, error threshold) must pass.

### A0 — Persist manga reader page/scroll mode  ✅ done
- **Files:** `interface-master/src/lib/components/readers/MangaReader.svelte`, `interface-master/src/lib/modules/settings/settings.ts` (`readerMode` persisted store).
- **Change:** `mode` initializes from the `readerMode` store (falls back to `readingDirection`-derived default when `null`); `toggleMode()` writes the choice. Survives chapter changes and restarts.
- **Acceptance:** Toggle Scroll/Pages, open another chapter — mode persists. Restart app — mode persists.
- **Commit:** standalone (`feat: persist manga reader page/scroll mode`).

### A1 — Reader type helper + detail page novel-source fix
- **Decision:** manga/novel split keys off `media.format === 'NOVEL'`, never `media.type` (Reader type, per CONTEXT.md).
- **Files:** `interface-master/src/lib/modules/anilist/util.ts` (new `readerType(media)` helper), `interface-master/src/routes/app/media/[id]/+page.svelte` (`loadSources`/`loadChapters`).
- **Change:** Add `readerType(media: Media): 'manga' | 'novel'` = `media.format === 'NOVEL' ? 'novel' : 'manga'`. Replace the hardcoded `type: 'manga'` at `+page.svelte:42` and `:56` with `readerType(media)`. The reader route already does this inline — switch it to the shared helper too.
- **Acceptance:** A `format: NOVEL` title's detail-page Chapters tab lists *novel*-source chapters (not manga); opening the reader shows novel content. svelte-check passes.
- **Commit:** standalone (`fix: route novels to novel sources on detail page`).

### A2 — Set COMPLETED on last-chapter advance
- **Decision:** completion detected on advancing past the last chapter, not scroll position (Progress sync, per CONTEXT.md).
- **Files:** `interface-master/src/routes/app/reader/[id]/+page.svelte` (`onNextChapter`, `syncProgress`).
- **Change:** `syncProgress(chapter, status = 'CURRENT')`; `onNextChapter`'s no-next-chapter branch calls `syncProgress(currentChapter, 'COMPLETED')`.
- **Acceptance:** Read the last chapter, hit Next → AniList media-list entry status becomes `COMPLETED`. svelte-check passes.
- **Commit:** combined with A3 (`fix: floor chapter + set COMPLETED on progress sync`).

### A3 — Floor chapter number on progress sync
- **Decision:** keep `chapter: number` (decimals OK in-reader); floor to int on AniList sync (Progress sync, per CONTEXT.md).
- **Files:** `interface-master/src/routes/app/reader/[id]/+page.svelte` (`syncProgress`).
- **Change:** `auth.entry({ id: media.id, progress: Math.floor(chapter), status })`.
- **Acceptance:** A decimal chapter (e.g. 47.5) syncs to AniList as `47`. svelte-check passes.
- **Commit:** combined with A2.

### A4 — Repoint example extension URLs to hayase-lite
- **Decision:** canonical app repo is `afnanrudy/hayase-lite` (Q6 of grilling).
- **Files:** `examples/extensions/index.json`.
- **Change:** replace `afnanrudy/hayase-local/main` → `afnanrudy/hayase-lite/main` in all `update`/`code` URLs (10 occurrences).
- **Acceptance:** `curl -sI` each repointed URL returns 200 (files exist on `hayase-lite/main`).
- **Commit:** standalone (`fix: repoint example extension URLs to hayase-lite`).

### Sequencing
A0 (done) → A1+A2+A3 (one commit — they share `reader/[id]/+page.svelte`) → A4 (data). No hard dependencies; A1 is the highest-value bug. All four are independently verifiable.

> Commit grouping note: A1, A2, A3 all touch the reader route, so they ship as one commit. `util.ts` (A1's helper) is otherwise clean; the detail-page and reader-route files also carry pre-existing uncommitted feature WIP on this branch, so that commit will include it.

## Section B — Post-v1 backlog (deferred, not actionable now)

Captured so the deferred decisions from grilling are not lost. One line each; no design work until v1 ships.

- **Source priority / reorder** — drag-to-reorder enabled sources; auto-select first source that has a chapter. v1 ships manual dropdown only.
- **LRU cache eviction** — size-capped LRU with per-series and global clear from settings. v1 ships unbounded cache-on-read.
- **Language picker** — source language is hardcoded `'en'` in the reader and detail page.
- **Download-all** — batch-download all chapters for offline.
- **Manual mark read/unread** — context menu on the chapter list to correct progress. v1 auto-sets COMPLETED on last-chapter advance.
- **Reading-direction override** — in-reader flip of rtl/ltr/vertical. v1 uses the manifest value; the page/scroll toggle is separate and in v1.

## Verification
- Code (A1–A3): `pnpm --filter interface-master check` must exit clean.
- Data (A4): `curl -sI <url>` returns 200 for each repointed URL.
- Manual (yours): A1 novel detail page, A2 COMPLETED status on AniList, A3 floored progress — require a running app + AniList auth.