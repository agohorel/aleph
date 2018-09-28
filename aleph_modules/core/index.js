const electron = require("electron");
const BrowserWindow = electron.remote.BrowserWindow;
const {dialog} = electron.remote;
const ipc = electron.ipcRenderer;
const fs = require('fs');

// SKETCH SELECTION STUFF

const sketchSelectButtons = document.querySelector("#sketchSelectorButtons");

//read and display available p5 sketches
fs.readdir("./aleph_modules/sketches", (err, files) => {
  if (err){
  	console.log(err);
  } else {
  	  files.forEach(file => {
  	  	makeDomElement("BUTTON", file.substring(0, file.length-3), ["sketchSelectButton", "btn"], "#sketchSelectorButtons", true);	  
	  });
  }
});

// highlight selected mode & send mode to p5 via main process
sketchSelectorButtons.addEventListener("click", function(e) {
	if (e.target.className.includes("sketchSelectButton")){
		highlightSelectedItem(".sketchSelectButton", e.target);
		ipc.send("changeSketch", e.target.id);
	}
});

// MIDI DEVICE SELECTION STUFF

const midiDeviceButtons = document.querySelector("#midiDeviceButtons");

// display available midi devices once they have been sent from main process
ipc.on("displayMidi", (event, arg) => {
	for (let i = 0; i < arg.length; i++){
		makeDomElement("BUTTON", arg[i], ["midiDeviceButtons", "btn"],"#midiDeviceButtons", true);                                    
	}
});

// highlight selected midi device & send to main process
midiDeviceButtons.addEventListener("click", function(e) {
	if (e.target.className.includes("midiDeviceButtons")){
		highlightSelectedItem(".midiDeviceButtons", e.target);
		ipc.send("selectMidiDevice", e.target.innerText);
	}	
});

// MIDI MAPPING STUFF

const addMidiMap = document.querySelector("#addMidiMap");
const lockMidi = document.querySelector("#lockMidiMap");
const midiMappingButtons = document.querySelector("#midiMapIcons");
const saveMidi = document.querySelector("#saveMidi");
const loadMidi = document.querySelector("#loadMidi");
let controlCount = 0;

// create new midi control mappings
addMidiMap.addEventListener("click", () => {	
	controlCount++;
	makeDomElement("BUTTON", controlCount, ["midiMapping", "btn"], "#midiMapIcons", false);
});

// highlight selected midi control mapping slot & send controller id to main process
midiMappingButtons.addEventListener("click", function(e) {
	if (e.target.className.includes("midiMapping")){
		highlightSelectedItem(".midiMapping", e.target);
		ipc.send("addMidiMapping", `controller_${e.target.id}`);
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
	ipc.send("saveMidi");
});

ipc.on("midiSaved", (event) => {
	let saveBtn = document.querySelector("#saveMidi");
	saveBtn.classList.toggle("doneLoading");
	setTimeout(() => {
		saveBtn.classList.toggle("doneLoading");
	}, 250);
});

// load midi mappings
loadMidi.addEventListener("click", () => {
	ipc.send("loadMidi");
});

ipc.on("midiLoaded", (event) => {
	let loadBtn = document.querySelector("#loadMidi");
	loadBtn.classList.toggle("doneLoading");
	setTimeout(() => {
		loadBtn.classList.toggle("doneLoading");
	}, 250);
});


// DISPLAY SETTINGS STUFF

const applyDisplaySettings = document.querySelector("#applyDisplaySettings");
const displayWidth = document.querySelector("#displayWindowWidth");
const displayHeight = document.querySelector("#displayWindowHeight");

// send display size params to main process & unlock p5 sketch & midi device select buttons
applyDisplaySettings.addEventListener("click", function(e){
	let displayDimensions = [Number(displayWidth.value), Number(displayHeight.value)];
	let sketchBtns = document.querySelectorAll(".sketchSelectButton");
	let midiBtns = document.querySelectorAll(".midiDeviceButtons");
	let addCtrlBtn = document.querySelector("#addMidiMap");
	let lockMappingBtn = document.querySelector("#lockMidiMap");
	let saveBtn = document.querySelector("#saveMidi");
	let loadBtn = document.querySelector("#loadMidi");

	sketchBtns.forEach((btn) => { btn.disabled = false; });
	midiBtns.forEach((btn) => { btn.disabled = false; });
	addCtrlBtn.disabled = false;
	lockMappingBtn.disabled = false;
	saveBtn.disabled = false;
	loadBtn.disabled = false;

	ipc.send("applyDisplaySettings", displayDimensions);
});

// ASSET IMPORTER STUFF

const objBtn = document.querySelector("#objBtn");
const texturesBtn = document.querySelector("#texturesBtn");

objBtn.addEventListener("click", () => {
	importFileDialog("models");
});

texturesBtn.addEventListener("click", () => {
	importFileDialog("textures");
});

// AVAILABLE ASSETS STUFF

const p = document.querySelector("#availableAssets");
let assetFolders = fs.readdirSync("./aleph_modules/assets");
let assetList = "";

assetFolders.forEach(folder => {
	assetList += `${folder}\n`.toUpperCase();
	let assets = fs.readdirSync(`./aleph_modules/assets/${folder}`);

	assets.forEach(asset => {
		assetList += `|__assets.${folder}.${asset.substring(0, asset.length-4)}\n`;
	});
	assetList += "\n";
});

p.innerText = assetList;	

const listAssetsBtn = document.querySelector("#availableAssetsBtn");
let listAssetsBool = false;

listAssetsBtn.addEventListener("click", () => {
	if (listAssetsBool === false){
		p.style.display = "block";
		listAssetsBtn.innerText = "Hide";
		listAssetsBool = true;	
	} else {
		p.style.display = "none";
		listAssetsBtn.innerText = "Show";
		listAssetsBool = false;
	}
});

// UTILITY FUNCTIONS

function makeDomElement(type, text, className, destParent, boolean) {
	let element = document.createElement(type);
	let displayText = document.createTextNode(text);
	element.appendChild(displayText);

	for (let i = 0; i < className.length; i++){
		element.classList.add(className[i]);
	}
	
	element.id = text;
	element.disabled = boolean;
	document.querySelector(destParent).appendChild(element);
}

function highlightSelectedItem(className, target) {
	let selectedClass = document.querySelectorAll(className);
	Array.from(selectedClass).forEach(item => item.classList.toggle("active", ""));
	target.classList.add("active");
}

let duplicatorIndex = 1;

function duplicate(id) {	
	let original = document.getElementById(id);
    let clone = original.cloneNode(true);
    clone.id = original.id + duplicatorIndex++;
    original.parentNode.appendChild(clone);
}

function importFileDialog(typeOfImport){
	dialog.showOpenDialog({
		filters: [applyImportFilter(typeOfImport)],
		properties: ["openFile", "multiSelections"]
	}, (files) => {
		copyImportedFiles(files, `./aleph_modules/assets/${typeOfImport}`);
	});
}

function applyImportFilter(typeOfImport){
	let filter = {};
	if (typeOfImport === "3d" || typeOfImport === "obj" || typeOfImport === "models"){
		filter.name = typeOfImport;
		filter.extensions = ["obj"];
		return filter;
	}
	else if (typeOfImport === "textures" || typeOfImport === "images"){
		filter.name = "Image";
		filter.extensions = ["jpg", "png", "gif", "tif", "bmp"];
		return filter;
	}
}

function copySelectedFiles(selectedFiles, destination){
	for (let i = 0; i < selectedFiles.length; i++){
		// strip filename off path
		let filename = selectedFiles[i].replace(/^.*[\\\/]/, '');
		fs.copyFile(selectedFiles[i], `${destination}/${filename}`, (err) => {
			if (err) throw err;
			console.log(`${selectedFiles[i]} copied to ${destination}/${filename}`);
		});
	}
}