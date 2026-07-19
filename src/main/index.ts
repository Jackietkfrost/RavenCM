import { app, WebContents, RenderProcessGoneDetails } from 'electron'
import Constants from './utils/Constants'
import { createErrorWindow, createMainWindow } from './MainRunner'

let mainWindow
let errorWindow

app.on('ready', async () => {
  if (Constants.IS_DEV_ENV) {
    import('./index.dev')
  }

  // Disable special menus on macOS by uncommenting the following, if necessary
  /*
  if (Constants.IS_MAC) {
    systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true)
    systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true)
  }
  */

  try {
    mainWindow = await createMainWindow()
  } catch (err) {
    console.error('Failed to create main window on ready:', err)
  }
})

app.on('activate', async () => {
  if (!mainWindow) {
    try {
      mainWindow = await createMainWindow()
    } catch (err) {
      console.error('Failed to recreate main window on activate:', err)
    }
  }
})

app.on('window-all-closed', () => {
  mainWindow = null
  errorWindow = null

  if (!Constants.IS_MAC) {
    app.quit()
  }
})

app.on(
  'render-process-gone',
  async (event: Event, webContents: WebContents, details: RenderProcessGoneDetails) => {
    try {
      errorWindow = await createErrorWindow(errorWindow, mainWindow, details)
    } catch (err) {
      console.error('Failed to handle render process gone:', err)
    }
  }
)

process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err)
  try {
    errorWindow = await createErrorWindow(errorWindow, mainWindow)
  } catch (e) {
    console.error('Failed to create error window after uncaught exception:', e)
  }
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
