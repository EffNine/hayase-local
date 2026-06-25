import path from 'path'

import { app, type BrowserWindow } from 'electron'

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('hayase-lite', process.execPath, [path.resolve(process.argv[1]!)])
  }
} else {
  app.setAsDefaultProtocolClient('hayase-lite')
}

export default class Protocol {
  window
  constructor (window: BrowserWindow) {
    this.window = window

    app.on('open-url', (event, url) => {
      event.preventDefault()
      this.handleProtocol(url)
    })
  }

  navigateTarget () {
    if (process.argv.length >= 2 && !process.defaultApp) {
      for (const line of process.argv) {
        this.handleProtocol(line)
      }
    }
  }

  _parseProtocol (text: string) {
    let url: URL
    try {
      url = new URL(text)
    } catch {
      return null
    }

    if (url.protocol !== 'hayase-lite:') return null

    const value = `${url.pathname.replace(/^\//, '')}${url.search}${url.hash}`

    return {
      target: url.hostname,
      value
    }
  }

  handleProtocol (text: string) {
    const parsed = this._parseProtocol(text)
    if (!parsed) return
    if (parsed.target === 'devtools') this.window.webContents.openDevTools({ mode: 'detach' })

    this.window.webContents.send('navigate', parsed)
  }
}
