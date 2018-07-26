const electron = require("electron");
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;

const simpleSpectrum = document.querySelector("#simpleSpectrum");

simpleSpectrum.addEventListener("click", () => {
	ipc.send("changeMode", "simpleSpectrum");
});

const simpleWaveform = document.querySelector("#simpleWaveform");

simpleWaveform.addEventListener("click", () => {
	ipc.send("changeMode", "simpleWaveform");
});

const centroid = document.querySelector("#spectralCentroid");

centroid.addEventListener("click", () => {
	ipc.send("changeMode", "spectralCentroid");
});

ipc.on("displayMidi", (event, arg) => {
	for (let i = 0; i < arg.length; i++){
		let btn = document.createElement("BUTTON");
		let text = document.createTextNode(arg[i]);
		btn.appendChild(text);
		btn.addEventListener("click", () => {
			ipc.send("selectMidiDevice", arg[i]);
		});                              
		document.querySelector("#midiDeviceButtons").appendChild(btn);       
	}
});