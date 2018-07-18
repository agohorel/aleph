const {app, BrowserWindow} = require("electron");

function createWindow() {
	win = new BrowserWindow({width: 1920, height: 1080});

	win.loadFile("./aleph_modules/core/index.html");
}

app.on("ready", createWindow);