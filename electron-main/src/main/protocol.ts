import path from 'path'

import { app, shell, type BrowserWindow } from 'electron'

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('hayase-lite', process.execPath, [path.resolve(process.argv[1]!)])
  }
} else {
  app.setAsDefaultProtocolClient('hayase-lite')
}

export default class Protocol {
  protocolRx = /hayase-lite:\/\/([a-z0-9]+)\/(.*)/i

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
    const match = text.match(this.protocolRx)
    if (!match) return null
    return {
      target: match[1]!,
      value: match[2]
    }
  }

  handleProtocol (text: string) {
    const parsed = this._parseProtocol(text)
    if (!parsed) return
    if (parsed.target === 'devtools') this.window.webContents.openDevTools({ mode: 'detach' })

    this.window.webContents.send('navigate', parsed)
  }
}
