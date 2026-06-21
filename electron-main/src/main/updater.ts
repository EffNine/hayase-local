// Auto-updater disabled for Hayase-lite (personal use)
// To re-enable, set a feed URL and uncomment the check below:
// autoUpdater.setFeedURL({ url: 'https://your-update-server/files', provider: 'generic' })
// autoUpdater.checkForUpdates()

export default class Updater {
  hasUpdate = false

  constructor () {
    // Auto-update disabled
  }

  install (_forceRunAfter = false) {
    return false
  }
}
