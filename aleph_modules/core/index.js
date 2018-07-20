const electron = require("electron");
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;

const simpleSpectrum = document.querySelector("#simpleSpectrum");

simpleSpectrum.addEventListener("click", () => {
	ipc.send("send", "simpleSpectrum");
});

const simpleWaveform = document.querySelector("#simpleWaveform");

simpleWaveform.addEventListener("click", () => {
	ipc.send("send", "simpleWaveform");
});

const centroid = document.querySelector("#spectralCentroid");

centroid.addEventListener("click", () => {
	ipc.send("send", "spectralCentroid");
});