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

const midiDeviceDisplay = document.querySelector("#midiDeviceList");

ipc.on("displayMidi", (event, arg) => {
	midiDeviceList.innerText = arg;
});