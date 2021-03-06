const electron = require("electron");
const { app, BrowserWindow, ipcMain, dialog } = electron;
const electronDebug = require("electron-debug");
// const path = require("path");
const { setIconByOS } = require("./aleph_modules/core/js/utils.js");

// global reference to windows to prevent closing on js garbage collection
let editorWindow, splash;
let lastMidi = {}; // stores the last state of the midi object to use when refreshing displayWindows
let displays = []; // stores p5 display windows
let selectedDisplays = []; // stores references to display windows we want to send p5 sketch program changes to
let lastSketch; // stores the last selected sketch, QoL for having to ctrl+r a lot while developing sketches
let lastSketchFolderPath;

electronDebug({
  enabled: true,
  showDevTools: false,
  devToolsMode: "bottom",
});

function createSplashScreen() {
  splash = new BrowserWindow({
    width: 512,
    height: 512,
    transparent: true,
    frame: false,
  });
  splash.loadFile("./aleph_modules/core/html/splash.html");
}

app.on("ready", () => {
  createSplashScreen();
  createEditorWindow();
});

// quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("changeSketch", (event, sketchName) => {
  sendToSelectedDisplayWindows("sketchSelector", sketchName);
  lastSketch = sketchName;
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

ipcMain.on("applyDisplaySettings", (event, displayParams) => {
  createDisplayWindow(displayParams);
});

ipcMain.on("devModeToggle", (event, devmodeBool) => {
  sendToDisplayWindow("devModeToggle", devmodeBool);
});

ipcMain.on("antiAliasingToggle", (event, aaBool) => {
  sendToSelectedDisplayWindows("antiAliasingToggle", aaBool);
});

ipcMain.on("saveMidi", (event) => {
  sendToEditorWindow("saveMidi");
});

ipcMain.on("loadMidi", (event) => {
  sendToEditorWindow("loadMidi");
});

ipcMain.on("midiLoaded", (event) => {
  sendToEditorWindow("midiLoaded");
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

ipcMain.on("displayOutputChanged", (event, displayId) => {
  sendToEditorWindow("displayOutputChanged", displayId);
});

ipcMain.on("forceMomentary", (event, args) => {
  sendToEditorWindow("forceMomentary", args);
});

ipcMain.on("updateMidi", (event, args) => {
  sendToDisplayWindow("updateMidi", args);
  lastMidi = args;
});

ipcMain.on("p5Init", (event, args) => {
  sendToDisplayWindow("p5Init", {
    midi: lastMidi,
    sketch: lastSketch,
    sketchFolder: lastSketchFolderPath,
  });
});

ipcMain.on("sketchChangedWithMidi", (event, args) => {
  sendToSelectedDisplayWindows("sketchChangedWithMidi", args);
});

ipcMain.on("updateAudio", (event, args) => {
  sendToDisplayWindow("updateAudio", args);
});

ipcMain.on("audioDeviceSelected", (event, args) => {
  sendToEditorWindow("audioDeviceSelected", args);
});

ipcMain.on("updatePixelDensity", (event, pixelDensity) => {
  sendToSelectedDisplayWindows("updatePixelDensity", pixelDensity);
});

ipcMain.on("selectedDisplayWindow", (event, displayId) => {
  if (displayId === "ALL" || displayId === "All") {
    selectedDisplays = displays;
  } else {
    selectedDisplays = displays.filter(
      (display) => display.index === Number(displayId)
    );
  }
});

ipcMain.on("sketchFolderSelected", (event, pathToSketchFolder) => {
  sendToSelectedDisplayWindows("sketchFolderSelected", pathToSketchFolder);
  lastSketchFolderPath = pathToSketchFolder;
});

function sendToEditorWindow(channel, args) {
  // check if editorWindow exists before making IPC calls
  if (editorWindow) {
    editorWindow.webContents.send(channel, args);
  }
}

function sendToDisplayWindow(channel, args) {
  // check for displays
  if (displays.length) {
    displays.forEach((display) => {
      // skip over destroyed displays
      if (!display.displayWindow.isDestroyed()) {
        display.displayWindow.webContents.send(channel, args);
      }
    });
  }
}

function sendToSelectedDisplayWindows(channel, args) {
  if (selectedDisplays) {
    selectedDisplays.forEach((display) => {
      if (!display.displayWindow.isDestroyed()) {
        display.displayWindow.webContents.send(channel, args);
      }
    });
  }
}

function createEditorWindow() {
  // get system resolution
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
  editorWindow = new BrowserWindow({
    width,
    height,
    show: false,
    icon: setIconByOS(),
  });
  require("./aleph_modules/core/js/menu.js");
  editorWindow.loadFile("./aleph_modules/core/html/editorWindow.html");

  // show window only when file has loaded to prevent flash
  editorWindow.once("ready-to-show", () => {
    splash.destroy();

    splash.on("closed", () => {
      splash = null;
    });
    // check OS and use maximize or show
    if (process.platform === "darwin") {
      editorWindow.show();
    } else {
      editorWindow.maximize();
    }
  });

  // show confirm dialog when attempting to close editorWindow
  editorWindow.on("close", (e) => {
    let choice = dialog.showMessageBox(editorWindow, {
      type: "question",
      buttons: ["Yes", "No"],
      title: "Confirm",
      message: "Are you sure you want to quit?",
    });
    if (choice == 1) {
      e.preventDefault();
    }
  });

  // dereference windows on close
  editorWindow.on("closed", () => {
    editorWindow = null;
  });
}

function createDisplayWindow(displayParams) {
  let displayWindow = new BrowserWindow({
    width: displayParams.width,
    height: displayParams.height,
    icon: setIconByOS(),
  });

  displayWindow.loadFile("./aleph_modules/core/html/displayWindow.html");

  // remove menu
  displayWindow.setMenu(null);

  displays.push({
    displayWindow,
    index: displayParams.index,
  });

  selectedDisplays = displays;

  // wait for the window to exist before trying to ipc to it
  setTimeout(() => {
    if (displayWindow) {
      displayWindow.webContents.send("applyDisplaySettings", displayParams);
    }
  }, 1000);

  displayWindow.on("close", () => {
    sendToEditorWindow("removeDisplay", displayParams.index);
    displayWindow = null;
    displays.splice(displayParams.index, 1);
  });
}
