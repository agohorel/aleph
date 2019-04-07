const fs = require("fs");
const path = require("path");
const electron = require("electron");
const ipc = electron.ipcRenderer;
const easymidi = require("easymidi");

let midiDevices = [];
// separate array to track which devices has already been assigned an easymidi object
let mappedDevices = [];
let mappingsPath = path.resolve(__dirname, "../../mappings");

// initial export of default values
module.exports.controls = {};
module.exports.sketchCtrl = {};

// receive selected midi device from main process. assign device & listen for input.
ipc.on("selectMidiDevice", (event, arg) => {
	let selectedMidiDevice = arg;
	// check if selected device is new so we don't spawn multiple easymidi instances per device
	if (mappedDevices.indexOf(selectedMidiDevice) < 0){
		midiDevices.push(new easymidi.Input(selectedMidiDevice));
		midiDevices[midiDevices.length - 1].deviceName = arg;
		// push the name of the midi device associated w/ newly created easymidi object to prevent overwrites
		mappedDevices.push(selectedMidiDevice);
		pressedButton(midiDevices[midiDevices.length - 1], selectedMidiDevice);
		releasedButton(midiDevices[midiDevices.length - 1], selectedMidiDevice);
		ccChange(midiDevices[midiDevices.length - 1], selectedMidiDevice);
	}
});

let midiMap = {};
let midiMappings = [];
let controlID = null;

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
let forceMomentaryMode = false;

// receive trigger from main process to create new properties in the midiMap object
ipc.on("addMidiMapping", (event, arg) => {
	controlID = arg;
	mapModeStatuses.default = true;
});

ipc.on("removeMidiMapping", (event, arg) => {
	midiMappings.pop();
});

ipc.on("saveMidi", (event) => {
	// consolidate all mapping arrays into single array for easy saving.
	// we'll parse them out upon loading the midi controls by the "name" property on each individual control object.
	audioCtrlMappings.forEach((audioCtrlMap) => {
		midiMappings.push(audioCtrlMap);
	});

	sketchCtrlMappings.forEach((sketchCtrlMap) => {
		midiMappings.push(sketchCtrlMap);
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
	// if midi has already been loaded, empty out the controls arrays before reloading the midi mappings file.
	if (midiMappingHasBeenLoaded){
		midiMappings = [];
		audioCtrlMappings = [];
		sketchCtrlMappings = [];
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
			else {
				sketchCtrlMappings.push(obj[i]);
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

ipc.on("forceMomentary", (event, args) => {
	forceMomentaryMode = args;
	console.log(forceMomentaryMode);
});

function pressedButton(device, deviceName) {
	// listen for button presses
	device.on('noteon', (msg) => {
		console.log(msg);
		// if mapMode is on, assign the pressed button to midiMap
		if (mapModeStatuses.default){
			setMidiMapping(midiMap, midiMappings, controlID, msg.note, msg.velocity, "default", deviceName);
		}
		// set button mappings if sketchCtrls mapMode is active
		else if (mapModeStatuses.sketchCtrls && !mapModeStatuses.default && !mapModeStatuses.audioCtrls) {
			setMidiMapping(sketchCtrlMap, sketchCtrlMappings, sketchCtrlName, msg.note, msg.velocity, "sketchCtrls", deviceName);
		}
		// otherwise update the matching entry in midiMap
		else {
			// @TODO only update when necessary
			updateMidi(midiMap, midiMappings, msg.note, msg.velocity, deviceName);
			updateMidi(sketchCtrlMap, sketchCtrlMappings, msg.note, msg.velocity, deviceName);
		}

		// re-export new values on update
		module.exports.controls = midiMappings;
		module.exports.sketchCtrl = sketchCtrlMappings;
	});
}

function releasedButton(device, deviceName) {
	device.on('noteoff', (msg) => {
		// @TODO: 
		// only update/export when necessary
		if (forceMomentaryMode){
			updateMidi(midiMap, midiMappings, msg.note, 0, deviceName);
			updateMidi(sketchCtrlMap, sketchCtrlMappings, msg.note, 0, deviceName);
		} else {
			updateMidi(midiMap, midiMappings, msg.note, msg.velocity, deviceName);
			updateMidi(sketchCtrlMap, sketchCtrlMappings, msg.note, msg.velocity, deviceName);
		}
	
		module.exports.controls = midiMappings;
		module.exports.sketchCtrl = sketchCtrlMappings;
	});
}

function ccChange(device, deviceName) {
	device.on("cc", (msg) => {		
		if (mapModeStatuses.default && !mapModeStatuses.audioCtrls && !mapModeStatuses.sketchCtrls){
			setMidiMapping(midiMap, midiMappings, controlID, msg.controller, msg.value, "default", deviceName);
		}
		else if (mapModeStatuses.audioCtrls && !mapModeStatuses.default && !mapModeStatuses.sketchCtrls) {
			setMidiMapping(audioCtrlMap, audioCtrlMappings, audioCtrlNum, msg.controller, msg.value, "audioCtrls", deviceName);
		}
		else {
			updateMidi(midiMap, midiMappings, msg.controller, msg.value, deviceName);
			// @TODO only update and ipc send audioCtrlMappings when necessary
			updateMidi(audioCtrlMap, audioCtrlMappings, msg.controller, msg.value, deviceName);
			ipc.send("audioCtrlChanged", audioCtrlMappings);
		}

		module.exports.controls = midiMappings;
	});
}

function setMidiMapping(object, array, controlID, note, param, mapMode, deviceName) {
	for (let i = 0; i < array.length; i++){
		// look for matching controlID/name property
		if (array[i].name === controlID){
			// remove matching item (duplicate)
			array.splice(i, 1);
		}
	}

	object[note] = {};
	object[note].note = note;
	object[note].name = controlID;
	object[note].value = param;
	object[note].deviceName = deviceName;
	mapModeStatuses[mapMode] = false; 

	array.push(object[note]);

	// sort array by controlID to ensure correct order
	array.sort((a, b) => {
		let textA = a.name.toUpperCase();
		let textB = b.name.toUpperCase();
		return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
	});
	console.log(array);
}

function updateMidi(object, array, note, param, deviceName){ 
	for (let i = 0; i < array.length; i++){
		// check which device the signal is coming from
		if (array[i].deviceName === deviceName){
			// only update if there's a corresponding property to update already
			if (array[i].note === note){
				array[i].value = param;
			}
		}
	}
}