// Dummy NZB Source — Reference Example
// Copy this file, replace the fetch logic with your target Usenet indexer's API.
// The app sends an NZBQuery; you return an NZB string (or undefined).

export default new class DummyNZB {
  // Health check — called when the user tests the source in settings.
  async test () {
    return true
  }

  // Single file NZB.
  // query: { titles, episode, hash, file, name, fetch, ... }
  async single (query) {
    if (!query?.titles?.length) return undefined

    // Return an NZB XML string, or undefined if nothing found.
    return undefined
  }

  // Batch NZB (multiple files).
  // query: { titles, episode, hash, files, name, fetch, ... }
  async batch (query) {
    if (!query?.titles?.length) return undefined

    return undefined
  }
}