// Dummy Novel Source — Reference Example
// Copy this file, replace the fetch logic with your target novel site's API/HTML.
// The app sends a NovelQuery; you return chapter lists and HTML text.

export default new class DummyNovel {
  // Health check — called when the user tests the source in settings.
  async test () {
    return true
  }

  // List available chapters for a title.
  // query: { titles, anilistId, malId, language, fetch, media }
  async chapters (query) {
    if (!query?.titles?.length) return []

    return [
      { chapter: 1, title: 'Prologue' },
      { chapter: 2, title: 'Chapter 1' },
      { chapter: 3, title: 'Chapter 2' }
    ]
  }

  // Fetch one chapter's text content.
  // query: { titles, anilistId, malId, chapter, language, fetch, media }
  async chapter (query) {
    if (!query?.titles?.length) return undefined

    return {
      chapter: query.chapter,
      title: `Chapter ${query.chapter}`,
      language: query.language || 'en',
      html: '<p>This is a placeholder chapter. Replace this with your source\'s text content.</p><p>The reader will sanitize this HTML with DOMPurify before rendering.</p>'
    }
  }
}