const electron = require("electron")
const childProcess = require("child_process")
const path = require("path")
const url = require("url")
const fs = require("fs")

const WINDOW_WIDTH = 1024
const WINDOW_HEIGHT = 768

let _mainWindow
let _currentFilePath

function error(msg) {
    dialog.showErrorBox("Error", `${msg}. Exiting.`)
    process.exit(1)
}

function openFile(filePath, internalTarget) {
    if (!fs.existsSync(filePath)) {
        error(`Unknown file: "${filePath}"`)
    } else if (!fs.lstatSync(filePath).isFile()) {
        error("Given path leads to directory")
    } else {
        _currentFilePath = filePath
        const isMarkdownFile = [".md", ".markdown"].some(ending => filePath.endsWith(ending))
        _mainWindow.webContents.send("fileOpen", filePath, isMarkdownFile, internalTarget)
    }
}

const extractFilePath = args => args.find(
    arg =>
        !arg.includes("electron") &&
        !arg.startsWith("-") &&
        arg != "." &&
        arg != process.execPath)

const extractInternalTarget = args => args.find(arg => arg.startsWith("#"))

function createChildWindow(filePath, internalTarget) {
    const processName = process.argv[0]
    const args = processName.includes("electron") ? [".", filePath] : [filePath]
    if (internalTarget !== undefined) {
        args.push(internalTarget)
    }
    childProcess.spawn(processName, args)
}

function createWindow() {
    _mainWindow = new electron.BrowserWindow({
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT
    })
    _mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true
        })
    )
    _mainWindow.on("closed", () => {
        _mainWindow = null
    })

    electron.Menu.setApplicationMenu(
        electron.Menu.buildFromTemplate([
            {
                label: "File",
                submenu: [
                    {
                        label: "Open",
                        accelerator: "CmdOrCtrl+O",
                        click: () => {
                            electron.dialog.showOpenDialog(
                                {
                                    properties: ["openFile"],
                                    filters: [{ name: "Markdown", extensions: ["md", "markdown"] }]
                                },
                                filePaths => {
                                    if (filePaths) {
                                        openFile(filePaths[0])
                                    }
                                }
                            )
                        }
                    },
                    {
                        label: "Quit",
                        accelerator: process.platform === "darwin" ? "Cmd+Q" : "Alt+F4",
                        click: () => _mainWindow.close()
                    }
                ]
            },
            {
                label: "View",
                submenu: [
                    {
                        label: "Refresh",
                        accelerator: "F5",
                        click: () => _mainWindow.reload()
                    }
                ]
            },
            {
                label: "Tools",
                submenu: [
                    {
                        label: "Developer tools",
                        accelerator: "F10",
                        click: () => _mainWindow.webContents.openDevTools()
                    }
                ]
            }
        ])
    )
}

electron.app.on("ready", createWindow)

electron.app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        electron.app.quit()
    }
})

electron.app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (_mainWindow === null) {
        createWindow()
    }
})

electron.ipcMain.on("finishLoad", () => {
    const args = process.argv
    console.log(args)

    const filePath = _currentFilePath === undefined ? extractFilePath(args) : _currentFilePath
    const internalTarget = extractInternalTarget(args)
    if (filePath !== undefined) {
        openFile(filePath, internalTarget)
    } else {
        openFile(path.join(__dirname, "README.md"), internalTarget)
    }
})

electron.ipcMain.on("openFile", (event, filePath) => {
    createChildWindow(filePath)
})

electron.ipcMain.on("openInternal", (event, target) => {
    createChildWindow(_currentFilePath, target)
})
