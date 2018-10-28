const fs = require("fs");
const electron = require("electron");
const ipc = electron.ipcRenderer;
const easymidi = require("easymidi");

let midiDevice;
let appPath = process.cwd();

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

// initialise midiMap object with helper function
// let midiMap = {
// 	// this function emulates array-like index addressing
// 	// ex. midiMap.controller(1) 
//     controller: function(n) {
//         return this[Object.keys(this)[n-1]];
//     }
// };

let midiMap = {};
let midiMappings = [];

let controlNum = null;
let mapModeActive = false;

// receive trigger from main process to create new properties in the midiMap object
ipc.on("addMidiMapping", (event, arg) => {
	controlNum = arg;
	mapModeActive = true;
});

ipc.on("saveMidi", (event) => {
	fs.writeFile('midiMappings.json', JSON.stringify(midiMap, null, 2), (err) => {
		if (err) throw err;
	});
	ipc.send("midiSaved");
});

ipc.on("loadMidi", (event) => {
	fs.readFile(`${appPath}/midiMap.json`, "utf-8", (err, data) => {
		if (err) throw err;
		let obj = JSON.parse(data);
		Object.keys(obj).forEach((key) => {
			midiMap[key] = obj[key];
		});
	});
	console.log(midiMap);
	module.exports.controls = midiMappings;
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
	// check for matches/overwrites 
	// for (let key in object) {
	//     if (object[key].name === controlNum){
	// 		delete object[key];
	//     }
	// }

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
	console.log(array);
}

function updateMidi(object, array, note, param){
	// only update if there's a corresponding property to update in the first place
	for (let i = 0; i < array.length; i++){
		if (array[i].note === note)
			array[i].value = param;
			console.log(array[i]);
		}

	// if(object.hasOwnProperty(note)){
	// 	object[note].value = param;
	// }
}