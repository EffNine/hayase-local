// Dummy Torrent Source — Reference Example
// Copy this file, replace the fetch logic with your target site's API/HTML.
// The app sends an AnimeQuery; you return TorrentResult[].

export default new class DummyTorrent {
  // Health check — called when the user tests the source in settings.
  async test () {
    return true
  }

  // Single episode search.
  // query: { titles, episode, anilistId, resolution, exclusions, fetch, ... }
  async single (query) {
    if (!query?.titles?.length) return []

    const title = query.titles[0]
    const episode = query.episode

    return [{
      title: `${title} - ${String(episode).padStart(2, '0')} [Placeholder]`,
      link: `magnet:?xt=urn:btih:0000000000000000000000000000000000000000&dn=${encodeURIComponent(title)}`,
      hash: '0000000000000000000000000000000000000000',
      seeders: 0,
      leechers: 0,
      downloads: 0,
      size: 0,
      date: new Date(),
      type: 'alt',
      accuracy: 'low'
    }]
  }

  // Batch (whole season/cour) search.
  batch = this.single

  // Movie search.
  movie = this.single
}