const fs = require("fs");
const path = require("path");
const electron = require("electron");
const ipc = electron.ipcRenderer;
const easymidi = require("easymidi");

let midiDevice;
let mappingsPath = path.resolve(__dirname, "../../mappings");

// initial export of default values
module.exports.controls = {};
module.exports.sketchCtrl = {};

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

let audioCtrlMap = {};
let audioCtrlMappings = [];
let audioCtrlNum = null;

let sketchCtrlMap = {};
let sketchCtrlMappings = [];
let sketchCtrlName;

let midiMappingHasBeenLoaded = false;
let mapModeStatuses = {
	default: false,
	audioCtrls: false,
	sketchCtrls: false
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
	midiMappingHasBeenLoaded = true;
});

ipc.on("loadMidi", (event) => {
	// if midi has already been loaded, make sure to empty out the controls arrays before reloading the midi mappings file.
	if (midiMappingHasBeenLoaded){
		midiMappings = [];
		audioCtrlMappings = [];
	}

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
	// the main process will handle routing the audioCtrls to the p5_handler file.
	module.exports.controls = midiMappings;
	ipc.send("midiLoaded");
	midiMappingHasBeenLoaded = true;
});

ipc.on("audioCtrlMapBtnPressed", (event, args) => {
	audioCtrlNum = args;
	mapModeStatuses.audioCtrls = true;
});

ipc.on("sketchMidiMapActive", (event, args) => {
	sketchCtrlName = args;
	mapModeStatuses.sketchCtrls = true;
});

function pressedButton() {
	// listen for button presses
	midiDevice.on('noteon', (msg) => {
		// if mapMode is on, assign the pressed button to midiMap
		if (mapModeStatuses.default){
			setMidiMapping(midiMap, midiMappings, controlNum, msg.note, msg.velocity, "default");
		}
		// set button mappings if sketchCtrls mapMode is active
		else if (mapModeStatuses.sketchCtrls && !mapModeStatuses.default && !mapModeStatuses.audioCtrls) {
			setMidiMapping(sketchCtrlMap, sketchCtrlMappings, sketchCtrlName, msg.note, msg.velocity, "sketchCtrls");
		}
		// otherwise update the matching entry in midiMap
		else {
			// @TODO only update when necessary
			updateMidi(midiMap, midiMappings, msg.note, msg.velocity);
			updateMidi(sketchCtrlMap, sketchCtrlMappings, msg.note, msg.velocity);
		}

		// re-export new values on update
		module.exports.controls = midiMappings;
		module.exports.sketchCtrl = sketchCtrlMappings;
	});
}

function releasedButton() {
	midiDevice.on('noteoff', (msg) => {
		// @TODO only update when necessary
		updateMidi(midiMap, midiMappings, msg.note, msg.velocity);	
		updateMidi(sketchCtrlMap, sketchCtrlMappings, msg.note, msg.velocity);	
		module.exports.controls = midiMappings;
		module.exports.sketchCtrl = sketchCtrlMappings;
	});
}

function ccChange() {
	midiDevice.on("cc", (msg) => {		
		if (mapModeStatuses.default && !mapModeStatuses.audioCtrls && !mapModeStatuses.sketchCtrls){
			setMidiMapping(midiMap, midiMappings, controlNum, msg.controller, msg.value, "default");
		}
		else if (mapModeStatuses.audioCtrls && !mapModeStatuses.default && !mapModeStatuses.sketchCtrls) {
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