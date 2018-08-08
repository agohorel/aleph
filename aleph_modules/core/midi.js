const electron = require("electron");
const ipc = electron.ipcRenderer;
const easymidi = require("easymidi");

let midiDevice;

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

// initialise midiMappings object with helper function
let midiMappings = {
	// this function emulates array-like index addressing
	// ex. midiMappings.controller(1) 
    controller: function(n) {
        return this[Object.keys(this)[n]];
    }
};

let controlNum = null;
let mapModeActive = false;

// receive trigger from main process to create new properties in the midiMappings object
ipc.on("addMidiMapping", (event, arg) => {
	controlNum = arg;
	mapModeActive = true;
});

function pressedButton() {
	// listen for button presses
	midiDevice.on('noteon', (msg) => {
		// if mapMode is on, assign the pressed button to midiMappings
		if (mapModeActive){
			setMidiMapping(midiMappings, controlNum, msg.note, msg.velocity);
		} 
		// otherwise update the matching entry in midiMappings
		else {
			updateMidi(midiMappings, msg.note, msg.velocity);
		}

		// re-export new values on update
		module.exports.controls = midiMappings;
	});
}

function releasedButton() {
	midiDevice.on('noteoff', (msg) => {
		updateMidi(midiMappings, msg.note, msg.velocity);		
		module.exports.controls = midiMappings;
	});
}

function ccChange() {
	midiDevice.on("cc", (msg) => {		
		if (mapModeActive){
			setMidiMapping(midiMappings, controlNum, msg.controller, msg.value);
		} else {
			updateMidi(midiMappings, msg.controller, msg.value);
		}

		module.exports.controls = midiMappings;
	});
}

function setMidiMapping(object, controlNum, note, param) {
	// check for matches/overwrites 
	Object.values(object).forEach((obj) => {
		Object.keys(obj).forEach((key) => {
		  if (obj[key] === controlNum) {
		    console.log("found a match", obj);
		    obj.name = undefined;	    
		  }		  
		});
	});

	object[note] = {};
	object[note].name = controlNum;
	object[note].value = param;
	mapModeActive = false; 

	console.log(midiMappings);
}

function updateMidi(object, note, param){
	// only update if there's a corresponding property to update in the first place
	if(object.hasOwnProperty(note)){
		object[note].value = param;
	}
}