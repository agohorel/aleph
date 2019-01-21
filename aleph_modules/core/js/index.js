const electron = require("electron");
const BrowserWindow = electron.remote.BrowserWindow;
const {dialog} = electron.remote;
const ipc = electron.ipcRenderer;
const path = require("path");
const fs = require("fs");

const assetsPath = path.resolve(__dirname, "../../assets/");
const sketchesPath = path.resolve(__dirname, "../../sketches/");

// SKETCH SELECTION STUFF

const sketchSelectButtons = document.querySelector("#sketchSelectorButtons");

//read and display available p5 sketches
fs.readdir(sketchesPath, (err, files) => {
  if (err){
  	console.log(err);
  } else {
  	  files.forEach(file => {
  	  	makeDomElement("BUTTON", file.substring(0, file.lastIndexOf(".")), ["sketchSelectButton", "btn"], "#sketchSelectorButtons", true);	  
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

const new2DSketch = document.querySelector("#new2DSketch");
const new3DSketch = document.querySelector("#new3DSketch");

new2DSketch.addEventListener("click", () => {
	newSketchDialog("2D");
});

new3DSketch.addEventListener("click", () => {
	newSketchDialog("3D");
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

// AUDIO CONTROLS MIDI MAPPING STUFF

// @TODO async/await
// delay to wait for dom elements to exist
setTimeout(() => {
	let audioCtrlsMapBtns = document.querySelectorAll(".audioCtrlsMapBtn");
	console.log(audioCtrlsMapBtns);

	audioCtrlsMapBtns.forEach((button) => {
		button.addEventListener("click", () => {
			console.log(`clicked ${button.id}`);
			console.log(`button's parent knob: ${button.parentElement.id}`);
			ipc.send("audioCtrlMapBtnPressed", button.parentElement.id);
		}); 
	});

}, 125);

// MIDI MAPPING STUFF

const addMidiMap = document.querySelector("#addMidiMap");
const removeMidiMap = document.querySelector("#removeMidiMap");
const lockMidi = document.querySelector("#lockMidiMap");
const midiMappingButtons = document.querySelector("#midiMapIcons");
const saveMidi = document.querySelector("#saveMidi");
const loadMidi = document.querySelector("#loadMidi");
let controlCount = -1;

// create new midi control mappings
addMidiMap.addEventListener("click", () => {	
	controlCount++;
	makeDomElement("BUTTON", controlCount, ["midiMapping", "btn"], "#midiMapIcons", false);
});

removeMidiMap.addEventListener("click", () => {
	// send button id to main to pass off to midi.js
	ipc.send("removeMidiMapping", controlCount);
	// decrement controlCount to account for entry we're deleting
	controlCount--;
	// find the midi entry DOM elements
	let midiEntries = document.querySelectorAll(".midiMapping");
	// remove the last midi entry button
	midiEntries[midiEntries.length-1].parentNode.removeChild(midiEntries[midiEntries.length-1]);
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
const pixelDensity = document.querySelector("#pixelDensity");
const antiAliasing = document.querySelector("#antiAliasing");

// send display size params to main process & unlock p5 sketch & midi device select buttons
applyDisplaySettings.addEventListener("click", function(e){
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

	sketchBtns.forEach((btn) => { btn.disabled = false; });
	midiBtns.forEach((btn) => { btn.disabled = false; });
	addCtrlBtn.disabled = false;
	removeCtrlBtn.disabled = false;
	lockMappingBtn.disabled = false;
	saveBtn.disabled = false;
	loadBtn.disabled = false;
	audioParamWrapper.style.pointerEvents = "all";

	ipc.send("applyDisplaySettings", displayParams);
});

function validateInputRanges(elt){
	if (Number(elt.value) > Number(elt.max)){
		elt.value = elt.max;
	}
	if (Number(elt.value) < Number(elt.min)) {
		elt.value = elt.min;
	}
}

// ASSET IMPORTER STUFF

const objBtn = document.querySelector("#objBtn");
const texturesBtn = document.querySelector("#texturesBtn");
const fontsBtn = document.querySelector("#fontsBtn");
const shadersBtn = document.querySelector("#shadersBtn");

objBtn.addEventListener("click", () => {
	importFileDialog("models");
});

texturesBtn.addEventListener("click", () => {
	importFileDialog("textures");
});

fontsBtn.addEventListener("click", () => {
	importFileDialog("fonts");
});

shadersBtn.addEventListener("click", () => {
	importFileDialog("shaders");
});


// AVAILABLE ASSETS STUFF

const p = document.querySelector("#availableAssets");
let assetFolders = fs.readdirSync(assetsPath);

function scanAssets(){
	let assetList = "";
	assetFolders.forEach(folder => {
		// filter out aleph system icons
		if (folder !== "icons"){
			assetList += `${folder}\n`.toUpperCase();
			let assets = fs.readdirSync(path.join(assetsPath, folder)); 

			assets.forEach(asset => {
				// filter out font licenses
				if (!asset.toUpperCase().includes("LICENSE")){
					assetList += `|__assets.${folder}.${asset.substring(0, asset.lastIndexOf(".")) || asset}\n`;
				}
			});
			assetList += "\n";
		} 
	});

	p.innerText = assetList;	
}

scanAssets();

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

function importFileDialog(filetype){
	dialog.showOpenDialog({
		filters: [applyFiletypeFilter(filetype)],
		properties: ["openFile", "multiSelections"]
	}, (files) => {
		if (files === undefined) return;
		copySelectedFiles(files, path.resolve(assetsPath, filetype));
	});
}

function applyFiletypeFilter(filetype){
	let filter = {};
	if (filetype === "3d" || filetype === "obj" || filetype === "models"){
		filter.name = filetype;
		filter.extensions = ["obj"];
		return filter;
	}
	else if (filetype === "textures" || filetype === "images"){
		filter.name = "Image";
		filter.extensions = ["jpg", "png", "gif", "tif", "bmp"];
		return filter;
	}
	else if (filetype === "js"){
		filter.name = "Javascript";
		filter.extensions = ["js"];
		return filter;
	}
	else if (filetype === "fonts"){
		filter.name = "Fonts";
		filter.extensions = ["ttf", "otf"];
		return filter;
	}
	else if (filetype === "shaders"){
		filter.name = "Shaders";
		filter.extensions = ["frag", "vert"];
		return filter;
	}
}

function copySelectedFiles(selectedFiles, destination){
	for (let i = 0; i < selectedFiles.length; i++){
		// strip filename off path
		let filename = path.parse(selectedFiles[i]).base.replace(/[- ]/g, "_");
		fs.copyFile(selectedFiles[i], path.join(destination, filename), (err) => {
			if (err) throw err;
			console.log(`${selectedFiles[i]} copied to ${path.join(destination, filename)}`);
			scanAssets();
		});
	}
}

function newSketchDialog(type){
		dialog.showSaveDialog({
		defaultPath: sketchesPath,
		title: "Save New Sketch As",
		filters: [applyFiletypeFilter("js")]
	}, (sketchPath) => {
		if (sketchPath === undefined) return;
		let sketchName = path.parse(sketchPath).base;
		copySketchTemplate(sketchName, type);
	});
}

function copySketchTemplate(name, type){
	let srcPath;
	if (type === "2D"){
		srcPath = path.resolve(__dirname, "../js/2D_template.js");
	}

	if (type === "3D"){
		srcPath = path.resolve(__dirname, "../js/3D_template.js");;
	}

	fs.copyFile(srcPath, path.join(sketchesPath, name), (err) => {
		if (err) throw err;
		console.log(`created new sketch "${name}"`);
		appendNewSketchBtn(name.substring(0, name.lastIndexOf(".")));
	});
}

function appendNewSketchBtn(newSketch){
	let bool = true;
	let sketchBtn = document.querySelector(".sketchSelectButton");
	// if existing buttons are disabled, bool = true (btn is created in disabled state)
	if (sketchBtn.disabled === true) {bool = true;} else {bool = false;}
	makeDomElement("BUTTON", newSketch, ["sketchSelectButton", "btn"], "#sketchSelectorButtons", bool);	
}