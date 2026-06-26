// Dummy Subtitle Source — Reference Example
// Copy this file, replace the fetch logic with your target subtitle site's API/HTML.
// The app sends a query (without resolution/exclusions); you return subtitle URLs.

export default new class DummySubtitle {
  // Health check — called when the user tests the source in settings.
  async test () {
    return true
  }

  // Single episode subtitles.
  // query: { titles, episode, anilistId, fetch, ... }
  async single (query) {
    if (!query?.titles?.length) return []

    // Return an array of { url, language } objects.
    return [
      { url: 'https://example.com/subtitle.vtt', language: 'en' }
    ]
  }
}