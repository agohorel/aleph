const electron = require("electron");
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;
const fs = require('fs');


// MODE SELECTION STUFF

const modeSelectButtons = document.querySelector("#modeSelectorButtons");

fs.readdir("./aleph_modules/modes", (err, files) => {
  if (err){
  	console.log(err);
  } else {
  	  files.forEach(file => {
  	  	makeDomElement("BUTTON", file.substring(0, file.length-3), "modeSelectButton", "#modeSelectorButtons");	  
	  });
  }
});

modeSelectorButtons.addEventListener("click", function(e) {
	if (e.target.className === "modeSelectButton"){
		highlightSelectedItem(".modeSelectButton", e.target);
		ipc.send("changeMode", e.target.id);
	}
});

// MIDI DEVICE SELECTION STUFF

const midiDeviceButtons = document.querySelector("#midiDeviceButtons");

ipc.on("displayMidi", (event, arg) => {
	for (let i = 0; i < arg.length; i++){
		makeDomElement("BUTTON", arg[i], "midiDeviceButtons","#midiDeviceButtons");                                    
	}
});

midiDeviceButtons.addEventListener("click", function(e) {
	if (e.target.className === "midiDeviceButtons"){
		highlightSelectedItem(".midiDeviceButtons", e.target);
		ipc.send("selectMidiDevice", e.target.innerText);
	}	
});

// MIDI MAPPING STUFF

const addMidiMap = document.querySelector("#addMidiMap");
const midiMappingButtons = document.querySelector("#midiMapIcons");
let controlCount = 0;

addMidiMap.addEventListener("click", () => {	
	controlCount++;
	makeDomElement("BUTTON", controlCount, "midiMapping", "#midiMapIcons");
});

midiMappingButtons.addEventListener("click", function(e) {
	if (e.target.className === "midiMapping"){
		highlightSelectedItem(".midiMapping", e.target);
		ipc.send("addMidiMapping", `controller${e.target.id}`);
	}	
});

// UTILITY FUNCTIONS

function makeDomElement(type, text, className, destParent) {
	let element = document.createElement(type);
	let displayText = document.createTextNode(text);
	element.appendChild(displayText);
	element.classList.add(className);
	element.id = text;
	document.querySelector(destParent).appendChild(element);
}

function highlightSelectedItem(className, target) {
	let selectedClass = document.querySelectorAll(className);
	Array.from(selectedClass).forEach(item => item.classList.toggle("active", ""));
	target.classList.add("active");
}