const {app, BrowserWindow, ipcMain} = require("electron");

// global reference to windows to prevent closing on js garbage collection
let editorWindow, displayWindow;

function createWindow() {
	editorWindow = new BrowserWindow({width: 1920, height: 1080, show: false});
	editorWindow.loadFile("./aleph_modules/core/index.html");

	// show window only when file has loaded to prevent flash
	editorWindow.once("ready-to-show", () => {
		editorWindow.maximize();
	});

	// dereference windows on close
	editorWindow.on("closed", () => {
	      editorWindow = null;
	});
}

app.on("ready", createWindow);

// quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
	  app.quit();
	}		
});

ipcMain.on("changeMode", (event, args) => {
	displayWindow.webContents.send("modeSelector", args);
});

ipcMain.on("listMidi", (event, args) => {
	editorWindow.webContents.send("displayMidi", args);
});

ipcMain.on("selectMidiDevice", (event, args) => {
	displayWindow.webContents.send("selectMidiDevice", args);
});

ipcMain.on("addMidiMapping", (event, args) => {
	displayWindow.webContents.send("addMidiMapping", args);
});

ipcMain.on("applyDisplaySettings", (event, args) => {
	displayWindow = new BrowserWindow({width: args[0], height: args[1], autoHideMenuBar: true});
	displayWindow.webContents.send("applyDisplaySettings", args);
 	displayWindow.loadFile("./aleph_modules/core/displayWindow.html");
	
	displayWindow.on("closed", () => {
		displayWindow = null;
	});		
});