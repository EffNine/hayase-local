import { autoUpdater } from 'electron-updater'

autoUpdater.setFeedURL({ url: 'https://api.hayase.watch/files', provider: 'generic' })

export default class Updater {
  hasUpdate = false

  constructor () {
    autoUpdater.checkForUpdates()
    setInterval(() => {
      autoUpdater.checkForUpdates()
    }, 30 * 60 * 1000).unref()
  }

  install (forceRunAfter = false) {
    if (!this.hasUpdate) return false
    autoUpdater.quitAndInstall(false, forceRunAfter)
    return true
  }
}
