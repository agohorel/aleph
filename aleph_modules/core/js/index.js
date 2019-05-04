const electron = require("electron");
const BrowserWindow = electron.remote.BrowserWindow;
const {dialog} = electron.remote;
const ipc = electron.ipcRenderer;
const path = require("path");
const fs = require("fs");
const utils = require(path.resolve(__dirname, "../js/utils.js"));
const assetsPath = path.resolve(__dirname, "../../assets/");
const sketchesPath = path.resolve(__dirname, "../../sketches/");
const midi = require(path.resolve(__dirname, "../js/midi.js"));


/////////////////////////
// DISPLAY SETTINGS STUFF
/////////////////////////

const applyDisplaySettings = document.querySelector("#applyDisplaySettings");
const displayWidth = document.querySelector("#displayWindowWidth");
const displayHeight = document.querySelector("#displayWindowHeight");
const pixelDensity = document.querySelector("#pixelDensity");
const antiAliasing = document.querySelector("#antiAliasing");

// send display size params to main process & unlock p5 sketch & midi device select buttons
applyDisplaySettings.addEventListener("click", function (e) {
	// validate display settings
	validateInputRanges(displayWidth);
	validateInputRanges(displayHeight);
	validateInputRanges(pixelDensity);
	validateInputRanges(antiAliasing);

	let displayParams = [Number(displayWidth.value), Number(displayHeight.value), Number(pixelDensity.value), Number(antiAliasing.value)];
	let sketchBtns = document.querySelectorAll(".sketchSelectButton");
	let midiBtns = document.querySelectorAll(".midiDeviceButtons");
	let addCtrlBtn = document.querySelector("#addMidiMap");
	let removeCtrlBtn = document.querySelector("#removeMidiMap");
	let lockMappingBtn = document.querySelector("#lockMidiMap");
	let saveBtn = document.querySelector("#saveMidi");
	let loadBtn = document.querySelector("#loadMidi");
	let audioParamWrapper = document.querySelector("#wrapper");
	let forceMomentaryBtn = document.getElementById("forceMomentary");

	sketchBtns.forEach((btn) => { btn.disabled = false; });
	midiBtns.forEach((btn) => { btn.disabled = false; });
	addCtrlBtn.disabled = false;
	removeCtrlBtn.disabled = false;
	lockMappingBtn.disabled = false;
	saveBtn.disabled = false;
	loadBtn.disabled = false;
	forceMomentaryBtn.disabled = false;
	audioParamWrapper.style.pointerEvents = "all";

	ipc.send("applyDisplaySettings", displayParams);
});

function validateInputRanges(elt) {
	if (Number(elt.value) > Number(elt.max)) {
		elt.value = elt.max;
	}
	if (Number(elt.value) < Number(elt.min)) {
		elt.value = elt.min;
	}
}




////////////////////////////////////
// AUDIO CONTROLS MIDI MAPPING STUFF
////////////////////////////////////

window.onload = () => {
	let audioCtrlsMapBtns = document.querySelectorAll(".audioCtrlsMapBtn");

	audioCtrlsMapBtns.forEach((button) => {
		button.addEventListener("click", () => {
			midi.listenForAudioCtrlMapping(button.parentElement.id);
		});
	});
}



///////////////////////
// ASSET IMPORTER STUFF
///////////////////////

const objBtn = document.querySelector("#objBtn");
const texturesBtn = document.querySelector("#texturesBtn");
const fontsBtn = document.querySelector("#fontsBtn");
const shadersBtn = document.querySelector("#shadersBtn");

objBtn.addEventListener("click", () => {
	utils.importFileDialog("models");
});

texturesBtn.addEventListener("click", () => {
	utils.importFileDialog("textures");
});

fontsBtn.addEventListener("click", () => {
	utils.importFileDialog("fonts");
});

shadersBtn.addEventListener("click", () => {
	utils.importFileDialog("shaders");
});



/////////////////////////
// AVAILABLE ASSETS STUFF
/////////////////////////

const assetFolders = fs.readdirSync(assetsPath);
const assetsDisplay = document.querySelector("#availableAssets");
const listAssetsBtn = document.querySelector("#availableAssetsBtn");
let listAssetsBool = false;
utils.scanAssets(assetFolders, assetsDisplay);

listAssetsBtn.addEventListener("click", () => {
	if (listAssetsBool === false) {
		assetsDisplay.style.display = "block";
		listAssetsBtn.innerText = "Hide";
		listAssetsBool = true;
	} else {
		assetsDisplay.style.display = "none";
		listAssetsBtn.innerText = "Show";
		listAssetsBool = false;
	}
});



/////////////////////////
// SKETCH SELECTION STUFF
/////////////////////////

let sketchSelectModeActive = true;

//read and display available p5 sketches
fs.readdir(sketchesPath, (err, files) => {
  if (err){
  	console.log(err);
  } else {
  	  files.forEach(file => {
  	  	utils.makeDomElement("BUTTON", file.substring(0, file.lastIndexOf(".")), ["sketchSelectButton", "btn"], "#sketchSelectorButtons", true);	  
	  });
  }
});

// highlight selected mode & send mode to p5 via main process
sketchSelectorButtons.addEventListener("click", function(e) {
	if (e.target.className.includes("sketchSelectButton")){
		utils.highlightSelectedItem(".sketchSelectButton", e.target);
		// only send ipc call to switch p5 sketch if mapping mode is not active
		if (sketchSelectModeActive) {
			ipc.send("changeSketch", e.target.id);
		} 
		// otherwise forward selected sketches name to main process
		else {
			ipc.send("sketchMidiMapActive", e.target.id);
			// reset sketchSelectModeActive back to default 
			sketchSelectModeActive = true;
		}
	}
});

ipc.on("sketchChanged", (event, args) => {
	let selectedSketchBtn = document.getElementById(args);
	utils.highlightSelectedItem(".sketchSelectButton", selectedSketchBtn);
});

const new2DSketch = document.querySelector("#new2DSketch");
const new3DSketch = document.querySelector("#new3DSketch");

new2DSketch.addEventListener("click", () => {
	utils.newSketchDialog("2D", sketchesPath);
});

new3DSketch.addEventListener("click", () => {
	utils.newSketchDialog("3D", sketchesPath);
});



//////////////////////////////
// MIDI DEVICE SELECTION STUFF
//////////////////////////////

const midiDeviceButtons = document.querySelector("#midiDeviceButtons");

// highlight selected midi device & send to main process
midiDeviceButtons.addEventListener("click", function(e) {
	if (e.target.className.includes("midiDeviceButtons")){
		utils.highlightSelectedItem(".midiDeviceButtons", e.target);
		midi.selectMidiDevice(e.target.innerText);
	}	
});



//////////////////////
// MIDI MAPPING STUFF
//////////////////////

const addMidiMap = document.querySelector("#addMidiMap");
const removeMidiMap = document.querySelector("#removeMidiMap");
const lockMidi = document.querySelector("#lockMidiMap");
const midiMappingButtons = document.querySelector("#midiMapIcons");
const saveMidi = document.querySelector("#saveMidi");
const loadMidi = document.querySelector("#loadMidi");
const forceMomentary = document.getElementById("forceMomentary");
let controlCount = -1;

// create new midi control mappings
addMidiMap.addEventListener("click", () => {	
	controlCount++;
	utils.makeDomElement("BUTTON", controlCount, ["midiMapping", "btn"], "#midiMapIcons", false);
});

removeMidiMap.addEventListener("click", () => {
	if (controlCount >= 0) {
		midi.removeMidiEntry();
		// decrement controlCount to account for entry we're deleting
		controlCount--;
		// find the midi entry DOM elements
		let midiEntries = document.querySelectorAll(".midiMapping");
		// remove the last midi entry button
		midiEntries[midiEntries.length - 1].parentNode.removeChild(midiEntries[midiEntries.length - 1]);
	}
});

midiMappingButtons.addEventListener("click", function(e) {
	if (e.target.className.includes("midiMapping")){
		utils.highlightSelectedItem(".midiMapping", e.target);
		midi.addMidiEntry(`controller_${e.target.id}`);
	}	
});

// toggle midi control mapping 
lockMidi.addEventListener("click", () => {
	document.querySelectorAll(".midiMapping").forEach((btn) => { 
		if (btn.disabled){
			btn.disabled = false;
			lockMidi.innerText = "Lock Midi Assignments";
		} else {
			btn.classList.remove("active");
			btn.disabled = true;
			lockMidi.innerText = "Unlock Midi Assignments";
		}
	});
});

// save midi mappings
saveMidi.addEventListener("click", () => {
	midi.save();
});

ipc.on("midiSaved", (event) => {
	flashButton(document.getElementById("saveMidi"));
});

// load midi mappings
loadMidi.addEventListener("click", () => {
	midi.load();
});

function flashButton(buttonElement){
	buttonElement.classList.toggle("doneLoading");
	setTimeout(() => {
		buttonElement.classList.toggle("doneLoading");
	}, 250);
}

ipc.on("midiLoaded", (event) => {
	flashButton(document.getElementById("loadMidi"));
});

forceMomentaryEnabled = false;

forceMomentary.addEventListener("click", () => {
	if (forceMomentaryEnabled){
		forceMomentary.innerText = "Force Momentary: Off";
		ipc.send("forceMomentary", false);
	} else {
		forceMomentary.innerText = "Force Momentary: On";
		ipc.send("forceMomentary", true);
	}
	forceMomentaryEnabled = !forceMomentaryEnabled;
});

// map sketches to midi 
const sketchMidiMapBtn = document.getElementById("sketchMidiMapBtn");

sketchMidiMapBtn.addEventListener("click", () => {
	sketchSelectModeActive = false;
});