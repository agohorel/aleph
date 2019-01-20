const fs = require("fs");
const path = require("path");
const electron = require("electron");
const ipc = electron.ipcRenderer;
const easymidi = require("easymidi");

let midiDevice;
let mappingsPath = path.resolve(__dirname, "../../mappings");

// initial export of default values
module.exports.controls = {};

// receive selected midi device from main process. assign device & listen for input.
ipc.on("selectMidiDevice", (event, arg) => {
	selectedMidiDevice = arg;
	midiDevice = new easymidi.Input(selectedMidiDevice);
	pressedButton();
	releasedButton();
	ccChange();
});

let midiMap = {};
let midiMappings = [];

let controlNum = null;
let mapModeActive = false;

// receive trigger from main process to create new properties in the midiMap object
ipc.on("addMidiMapping", (event, arg) => {
	controlNum = arg;
	mapModeActive = true;
});

ipc.on("removeMidiMapping", (event, arg) => {
	midiMappings.pop();
});

ipc.on("saveMidi", (event) => {
	fs.writeFile(path.join(mappingsPath, "midiMappings.json"), JSON.stringify(midiMappings, null, 2), (err) => {
		if (err) throw err;
	});
	ipc.send("midiSaved");
});

ipc.on("loadMidi", (event) => {
	fs.readFile(path.join(mappingsPath, "midiMappings.json"), "utf-8", (err, data) => {
		if (err) throw err;
		let obj = JSON.parse(data);
	
		for (let i = 0; i < obj.length; i++){
			midiMappings.push(obj[i]);
		}
	});
	
	module.exports.controls = midiMappings;
	console.log(midiMappings);
	ipc.send("midiLoaded");
});

function pressedButton() {
	// listen for button presses
	midiDevice.on('noteon', (msg) => {
		// if mapMode is on, assign the pressed button to midiMap
		if (mapModeActive){
			setMidiMapping(midiMap, midiMappings, controlNum, msg.note, msg.velocity);
		}
		// otherwise update the matching entry in midiMap
		else {
			updateMidi(midiMap, midiMappings, msg.note, msg.velocity);
		}

		// re-export new values on update
		module.exports.controls = midiMappings;
	});
}

function releasedButton() {
	midiDevice.on('noteoff', (msg) => {
		updateMidi(midiMap, midiMappings, msg.note, msg.velocity);		
		module.exports.controls = midiMappings;
	});
}

function ccChange() {
	midiDevice.on("cc", (msg) => {		
		if (mapModeActive){
			setMidiMapping(midiMap, midiMappings, controlNum, msg.controller, msg.value);
		} else {
			updateMidi(midiMap, midiMappings, msg.controller, msg.value);
		}

		module.exports.controls = midiMappings;
	});
}

function setMidiMapping(object, array, controlNum, note, param) {
	// loop through controls array
	for (let i = 0; i < array.length; i++){
		// look for matching controlNum/name property
		if (array[i].name === controlNum){
			console.log(`${controlNum} found a match at index ${i}: ${array[i].name}`);
			// remove matching item (duplicate)
			array.splice(i, 1);
		}
	}

	object[note] = {};
	object[note].note = note;
	object[note].name = controlNum;
	object[note].value = param;
	mapModeActive = false; 

	array.push(object[note]);

	// sort array by controlNum to ensure correct order
	array.sort((a, b) => {
		let textA = a.name.toUpperCase();
		let textB = b.name.toUpperCase();
		return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
	});
	console.log(array);
}

function updateMidi(object, array, note, param){ 
	for (let i = 0; i < array.length; i++){
		// only update if there's a corresponding property to update
		if (array[i].note === note)
			array[i].value = param;
		}
}