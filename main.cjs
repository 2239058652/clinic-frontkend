const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true
        }
    })

    const isDev = !app.isPackaged

    win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
        console.error('did-fail-load:', errorCode, errorDescription, validatedURL)
    })

    win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
        console.log('renderer console:', { level, message, line, sourceId })
    })

    if (isDev) {
        win.loadURL('http://localhost:3000')
    } else {
        win.loadFile(path.join(__dirname, 'dist', 'index.html'))
    }

    win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
