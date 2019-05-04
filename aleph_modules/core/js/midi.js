const fs = require("fs");
const path = require("path");
const electron = require("electron");
const ipc = electron.ipcRenderer;
const easymidi = require("easymidi");
const utils = require(path.resolve(__dirname, "../js/utils.js"));
const knobs = require(path.resolve(__dirname, "../js/gsuiJS.js"));

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
let midiDevices = [];
let mappedDevices = []; // track which devices have already been assigned an easymidi object
let mappingsPath = path.resolve(__dirname, "../../mappings");

// initial export of default values
module.exports.controls = {};
module.exports.sketchCtrl = {};

// list midi devices
let midiInputs = easymidi.getInputs();

for (let i = 0; i < midiInputs.length; i++) {
	utils.makeDomElement("BUTTON", midiInputs[i], ["midiDeviceButtons", "btn"], "#midiDeviceButtons", false);
}

// receive selected midi device from main process. assign device & listen for input.
exports.selectMidiDevice = (deviceName) => {
	// check if selected device is new so we don't spawn multiple easymidi instances per device
	if (mappedDevices.indexOf(deviceName) < 0) {
		midiDevices.push(new easymidi.Input(deviceName));
		midiDevices[midiDevices.length - 1].deviceName = deviceName;
		// push the name of the midi device associated w/ newly created easymidi object to prevent overwrites
		mappedDevices.push(deviceName);
		pressedButton(midiDevices[midiDevices.length - 1], deviceName);
		releasedButton(midiDevices[midiDevices.length - 1], deviceName);
		ccChange(midiDevices[midiDevices.length - 1], deviceName);
	}
}

module.exports.addMidiEntry = (controlCount) => {
	controlID = controlCount;
	mapModeStatuses.default = true;
}

module.exports.removeMidiEntry = () => {
	midiMappings.pop();
}

module.exports.save = () => {
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

	// open save dialog 
	utils.saveMidiDialog(mappingsPath, uniques);

	midiMappingHasBeenLoaded = true;
}

module.exports.load = () => {
	// if midi has already been loaded, empty out the controls arrays before reloading the midi mappings file.
	if (midiMappingHasBeenLoaded) {
		midiMappings = [];
		audioCtrlMappings = [];
		sketchCtrlMappings = [];
	}

	// open load dialog
	utils.loadMidiDialog(mappingsPath, midiMappings, audioCtrlMappings, sketchCtrlMappings);

	// note: no need to export audioCtrlMappings because they don't come into play w/ actually writing sketches.
	// the main process will handle routing the audioCtrls to the p5_handler file.
	module.exports.controls = midiMappings;

	midiMappingHasBeenLoaded = true;
}

module.exports.listenForAudioCtrlMapping = (btnID) => {
	audioCtrlNum = btnID;
	mapModeStatuses.audioCtrls = true;
}

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

		ipc.send("updateMidi", midiMappings);
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

		ipc.send("updateMidi", midiMappings);
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
			knobs.updateKnobs(audioCtrlMappings);
		}

		module.exports.controls = midiMappings;
		console.log(midiMappings);

		ipc.send("updateMidi", midiMappings);
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