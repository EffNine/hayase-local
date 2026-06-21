import { app } from 'electron'

import App from './app.ts'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let main: App | undefined

function createWindow () {
  main = new App()
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
// Menu.setApplicationMenu(null) // performance, but no keyboard shortcuts, sucks
  app.on('ready', createWindow)

  app.on('activate', () => {
    if (main == null) createWindow()
  })

  // ponytail: removed optimizer.watchWindowShortcuts, add back if window shortcut customization is needed
}
