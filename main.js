const electron = require("electron");
const {app, BrowserWindow, ipcMain, globalShortcut, dialog} = electron;
const electronDebug = require("electron-debug");
const path = require("path");

electronDebug({
	enabled: true,
	showDevTools: false,
	devToolsMode: "bottom"
});

// global reference to windows to prevent closing on js garbage collection
let editorWindow, displayWindow, splash;

function createWindow() {
	splash = new BrowserWindow({width: 512, height: 512, transparent: true, frame: false});
	splash.loadFile("./aleph_modules/core/html/splash.html");

	// timeout editorWindow load to show splash screen 
	setTimeout(() => {
		// get system resolution
	 	const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
		editorWindow = new BrowserWindow({
			width, 
			height, 
			show: false, 
			icon: setIconByOS()});
		require('./aleph_modules/core/js/menu.js');	
		editorWindow.loadFile("./aleph_modules/core/html/editorWindow.html");

		// show window only when file has loaded to prevent flash
		editorWindow.once("ready-to-show", () => {
			splash.on("closed", () => {
				splash = null;
			});

			splash.destroy();

			// check OS and use maximize or show
			if (process.platform === "darwin"){
				editorWindow.show();
			}

			else {editorWindow.maximize();}
		});

		// show confirm dialog when attempting to close editorWindow
		editorWindow.on("close", (e) => {
			let choice = dialog.showMessageBox(editorWindow,
				{
					type: 'question',
					buttons: ['Yes', 'No'],
					title: 'Confirm',
					message: 'Are you sure you want to quit?'
				});
			if (choice == 1) {
				e.preventDefault();
			}
		});

		// dereference windows on close
		editorWindow.on("closed", () => {
		      editorWindow = null;
		});

	}, 1500);

}

app.on('ready', () => {
	createWindow();

	let isFullScreen = false;
	// toggle fullscreen hotkey
	globalShortcut.register('CommandOrControl+Shift+F', () => {
		isFullScreen = !isFullScreen;
		displayWindow.setFullScreen(isFullScreen);
	});
});

// quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
	  app.quit();
	}		
});

ipcMain.on("changeSketch", (event, args) => {
	sendToDisplayWindow("sketchSelector", args);
});

ipcMain.on("listMidi", (event, args) => {
	sendToEditorWindow("displayMidi", args);
});

ipcMain.on("selectMidiDevice", (event, args) => {
	sendToDisplayWindow("selectMidiDevice", args);
});

ipcMain.on("addMidiMapping", (event, args) => {
	sendToEditorWindow("addMidiMapping", args);
});

ipcMain.on("removeMidiMapping", (event, args) => {
	sendToEditorWindow("removeMidiMapping", args);
});

ipcMain.on("applyDisplaySettings", (event, args) => {
	displayWindow = new BrowserWindow({width: args[0], 
									   height: args[1],
									   icon: setIconByOS()});
	displayWindow.setMenu(null);
	
	// TODO: make this a promise 
	// delay is there just to wait for the window to exist before trying to ipc to it 
	setTimeout(() => displayWindow.webContents.send("applyDisplaySettings", args), 1000);

 	displayWindow.loadFile("./aleph_modules/core/html/displayWindow.html");
	
	displayWindow.on("closed", () => {
		displayWindow = null;
	});		
});

ipcMain.on("saveMidi", (event) => {
	sendToEditorWindow("saveMidi");
});

ipcMain.on("loadMidi", (event) => {
	sendToEditorWindow("loadMidi");
});

ipcMain.on("midiLoaded", (event) => {
	sendToEditorWindow("midiLoaded");
	// sendToDisplayWindow("midiLoaded");
});

ipcMain.on("midiSaved", (event) => {
	sendToEditorWindow("midiSaved");
	sendToDisplayWindow("midiSaved");
});

ipcMain.on("audioCtrlMapBtnPressed", (event, args) => {
	sendToDisplayWindow("audioCtrlMapBtnPressed", args);
});

ipcMain.on("audioCtrlChanged", (event, args) => {
	sendToEditorWindow("audioCtrlChanged", args);
});

ipcMain.on("knobChanged", (event, args) => {
	sendToEditorWindow("knobChanged", args);
});

ipcMain.on("sketchChanged", (event, args) => {
	sendToEditorWindow("sketchChanged", args);
});

ipcMain.on("forceMomentary", (event, args) => {
	sendToDisplayWindow("forceMomentary", args);
});

// variable to store the last state of the midi object so we can quickly send it to the 
// displayWindow right as it's loading so refreshing a sketch doesn't bork the midi workflow
let lastMidi = {};

ipcMain.on("updateMidi", (event, args) => {
	sendToDisplayWindow("updateMidi", args);
	lastMidi = args;
});

ipcMain.on("p5MidiInit", (event, args) => {
	sendToDisplayWindow("p5MidiInit", lastMidi);
});

ipcMain.on("sketchChangedWithMidi", (event, args) => {
	sendToDisplayWindow("sketchChangedWithMidi", args);
});

ipcMain.on("updateAudio", (event, args) => {
	sendToDisplayWindow("updateAudio", args);
})

function sendToEditorWindow(channel, args){
	// check if editorWindow exists before making IPC calls
	if (editorWindow){
		editorWindow.webContents.send(channel, args);
	}
}

function sendToDisplayWindow(channel, args) {
	// check if editorWindow exists before making IPC calls
	if (displayWindow) {
		displayWindow.webContents.send(channel, args);
	}
}

function setIconByOS(){
	if (process.platform === "darwin"){
		console.log("detected mac host");
		return path.join(__dirname, "aleph_modules/assets/icons/mac/logo.icns");
	}
	else if (process.platform === "linux"){
		console.log("detected linux host");
		return path.join(__dirname, "aleph_modules/assets/icons/png/64x64.png")
	}
	else if (process.platform === "win32"){
		console.log("detected windows host");
		return path.join(__dirname, "aleph_modules/assets/icons/win/logo.ico");
	}
}