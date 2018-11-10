const {app, BrowserWindow, ipcMain} = require("electron");

const electronDebug = require('electron-debug');

electronDebug({
	enabled: true,
	showDevTools: false,
	devToolsMode: "bottom"
});

// global reference to windows to prevent closing on js garbage collection
let editorWindow, displayWindow;

function createWindow() {
	splash = new BrowserWindow({width: 512, height: 512, transparent: true, frame: false});
	splash.loadFile("./aleph_modules/core/html/splash.html");

	// artificial timeout to show splash screen 
	setTimeout(() => {
		editorWindow = new BrowserWindow({
			width: 1920, 
			height: 1080, 
			show: false, 
			icon: "./aleph_modules/assets/icons/win/logo.ico"});
		editorWindow.loadFile("./aleph_modules/core/html/index.html");

		// show window only when file has loaded to prevent flash
		editorWindow.once("ready-to-show", () => {
			splash.destroy();
			editorWindow.maximize();
		});

		// dereference windows on close
		editorWindow.on("closed", () => {
		      editorWindow = null;
		});

	}, 1500);

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

ipcMain.on("changeSketch", (event, args) => {
	displayWindow.webContents.send("sketchSelector", args);
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
	displayWindow = new BrowserWindow({width: args[0], 
									   height: args[1],
									   icon: "./aleph_modules/assets/icons/win/logo.ico"});
	displayWindow.setMenu(null);
	displayWindow.webContents.send("applyDisplaySettings", args);
 	displayWindow.loadFile("./aleph_modules/core/html/displayWindow.html");
	
	displayWindow.on("closed", () => {
		displayWindow = null;
	});		
});

ipcMain.on("saveMidi", (event) => {
	displayWindow.webContents.send("saveMidi");
});

ipcMain.on("loadMidi", (event) => {
	displayWindow.webContents.send("loadMidi");
});

ipcMain.on("midiLoaded", (event) => {
	editorWindow.webContents.send("midiLoaded");
});

ipcMain.on("midiSaved", (event) => {
	editorWindow.webContents.send("midiSaved");
});

ipcMain.on("knobChanged", (event, args) => {
	displayWindow.webContents.send("knobChanged", args);
});