const electron = require("electron");
const ipc = electron.ipcRenderer;
const easymidi = require("easymidi");

let midiInputs = easymidi.getInputs();
let midiDevice;

let midiMappings = {
    controller: function(n) {
        return this[Object.keys(this)[n]];
    }
};

let controlNum = null;
let mapModeActive = false;

// initial export of default values
module.exports.controls = {};

ipc.send("listMidi", midiInputs);

ipc.on("selectMidiDevice", (event, arg) => {
	selectedMidiDevice = arg;
	midiDevice = new easymidi.Input(selectedMidiDevice);
	pressedButton();
	releasedButton();
	ccChange();
});

ipc.on("addMidiMapping", (event, arg) => {
	controlNum = arg;
	mapModeActive = true;
});

let setMidiMapping = (object, controlNum, note, param) => {
	object[note] = {};
	object[note].name = controlNum;
	object[note].value = param;
	mapModeActive = false; 
}

function updateMidi(object, note, param){
	// only update if there's a corresponding property to update in the first place
	if(object.hasOwnProperty(note)){
		object[note].value = param;
	}
}

function pressedButton() {
	midiDevice.on('noteon', (msg) => {
		if (mapModeActive){
			setMidiMapping(midiMappings, controlNum, msg.note, msg.velocity);
		} else {
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