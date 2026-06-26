// Dummy Manga Source — Reference Example
// Copy this file, replace the fetch logic with your target manga site's API/HTML.
// The app sends a MangaQuery; you return chapter lists and page arrays.

export default new class DummyManga {
  // Health check — called when the user tests the source in settings.
  async test () {
    return true
  }

  // List available chapters for a title.
  // query: { titles, anilistId, malId, language, fetch, media }
  async chapters (query) {
    if (!query?.titles?.length) return []

    return [
      { chapter: 1, title: 'Chapter 1' },
      { chapter: 2, title: 'Chapter 2' },
      { chapter: 3, title: 'Chapter 3' }
    ]
  }

  // Fetch one chapter's pages.
  // query: { titles, anilistId, malId, chapter, language, fetch, media }
  async chapter (query) {
    if (!query?.titles?.length) return undefined

    return {
      chapter: query.chapter,
      title: `Chapter ${query.chapter}`,
      language: query.language || 'en',
      pages: [
        'https://placehold.co/800x1200/png?text=Page+1',
        'https://placehold.co/800x1200/png?text=Page+2',
        'https://placehold.co/800x1200/png?text=Page+3'
      ]
    }
  }
}