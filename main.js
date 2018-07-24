const {app, BrowserWindow, ipcMain} = require("electron");

// global reference to windows to prevent closing on js garbage collection
let editorWindow, displayWindow;

function createWindow() {
	editorWindow = new BrowserWindow({width: 1920, height: 1080});
	displayWindow = new BrowserWindow({width: 1920, height: 1080, autoHideMenuBar: true});

	editorWindow.loadFile("./aleph_modules/core/index.html");
	displayWindow.loadFile("./aleph_modules/core/displayWindow.html");
}

app.on("ready", createWindow);

ipcMain.on("changeMode", (event, arg) => {
	displayWindow.webContents.send("modeSelector", arg);
});