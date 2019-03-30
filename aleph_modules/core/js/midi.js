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
let audioCtrlMap = {};
let audioCtrlMappings = [];
let controlNum = null;
let audioCtrlNum = null;
let mapModeStatuses = {
	default: false,
	audioCtrls: false
};

// receive trigger from main process to create new properties in the midiMap object
ipc.on("addMidiMapping", (event, arg) => {
	controlNum = arg;
	mapModeStatuses.default = true;
});

ipc.on("removeMidiMapping", (event, arg) => {
	midiMappings.pop();
});

ipc.on("saveMidi", (event) => {
	// consolidate midiMappings and audioCtrlsMappings arrays into single array for easy saving.
	// we'll parse them out upon loading the midi controls by the "name" property on each individual control object.
	audioCtrlMappings.forEach((audioCtrlMapping) => {
		midiMappings.push(audioCtrlMapping);
	});

	// remove duplicates if overwriting a file
	let uniques = [...new Set(midiMappings)];

	fs.writeFile(path.join(mappingsPath, "midiMappings.json"), JSON.stringify(uniques, null, 2), (err) => {
		if (err) throw err;
	});

	ipc.send("midiSaved");
});

ipc.on("loadMidi", (event) => {
	fs.readFile(path.join(mappingsPath, "midiMappings.json"), "utf-8", (err, data) => {
		if (err) throw err;
		let obj = JSON.parse(data);
			
		// loop through entire mappings object
		for (let i = 0; i < obj.length; i++){
			// check if we're dealing w/ the "default" midi controls, or the "audioCtrls" (i.e. the UI knobs)
			if (obj[i].name.indexOf("controller") > -1){
				midiMappings.push(obj[i]);
			}
			else if (obj[i].name.indexOf("knob") > -1){
				audioCtrlMappings.push(obj[i]);
			}
		}
	});
	
	// note: no need to export audioCtrlMappings because they don't come into play w/ actually writing sketches.
	// the main process will handing routing the audioCtrls to the p5_handler file.
	module.exports.controls = midiMappings;
	ipc.send("midiLoaded");
});

ipc.on("audioCtrlMapBtnPressed", (event, args) => {
	audioCtrlNum = args;
	mapModeStatuses.audioCtrls = true;
});

function pressedButton() {
	// listen for button presses
	midiDevice.on('noteon', (msg) => {
		// if mapMode is on, assign the pressed button to midiMap
		if (mapModeStatuses.default){
			setMidiMapping(midiMap, midiMappings, controlNum, msg.note, msg.velocity, "default");
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
		if (mapModeStatuses.default === true && mapModeStatuses.audioCtrls === false){
			setMidiMapping(midiMap, midiMappings, controlNum, msg.controller, msg.value, "default");
		}
		// if audioCtrlMapMode is on, send the pressed button's value back to the main process
		else if (mapModeStatuses.audioCtrls && mapModeStatuses.default === false) {
			setMidiMapping(audioCtrlMap, audioCtrlMappings, audioCtrlNum, msg.controller, msg.value, "audioCtrls");
		} 
		else {
			updateMidi(midiMap, midiMappings, msg.controller, msg.value);
			// @TODO only update and ipc send audioCtrlMappings when necessary
			updateMidi(audioCtrlMap, audioCtrlMappings, msg.controller, msg.value);
			ipc.send("audioCtrlChanged", audioCtrlMappings);
		}

		module.exports.controls = midiMappings;
	});
}

function setMidiMapping(object, array, controlNum, note, param, mapMode) {
	// loop through controls array
	for (let i = 0; i < array.length; i++){
		// look for matching controlNum/name property
		if (array[i].name === controlNum){
			// console.log(`${controlNum} found a match at index ${i}: ${array[i].name}`);
			// remove matching item (duplicate)
			array.splice(i, 1);
		}
	}

	object[note] = {};
	object[note].note = note;
	object[note].name = controlNum;
	object[note].value = param;
	mapModeStatuses[mapMode] = false; 

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