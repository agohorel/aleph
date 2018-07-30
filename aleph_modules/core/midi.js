const electron = require("electron");
const ipc = electron.ipcRenderer;
const easymidi = require("easymidi");

let midiInputs = easymidi.getInputs();
let midiDevice;

let cc1 = 0, cc2 = 0, cc3 = 0, cc4 = 0, cc5 = 0, cc6 = 0, cc7 = 0, cc8 = 0;
let btn1 = 0, btn2 = 0, btn3 = 0, btn4 = 0, btn5 = 0, btn6 = 0, btn7 = 0, btn8 = 0;

// initial export of default values
module.exports.controls = {
	cc1, cc2, cc3, cc4, cc5, cc6, cc7, cc8,
	btn1, btn2, btn3, btn4, btn5, btn6, btn7, btn8
};

ipc.send("listMidi", midiInputs);

ipc.on("selectMidiDevice", (event, arg) => {
	selectedMidiDevice = arg;
	midiDevice = new easymidi.Input(selectedMidiDevice);
	// pressedButton();
	// releasedButton();
	// ccChange();
});

function pressedButton() {
	midiDevice.on('noteon', (msg) => {
		console.log(msg);
		switch(msg.note){
			case 9:
				btn1 = msg.velocity;
			break;
			case 10:
				btn2 = msg.velocity;		
			break;
			case 11:
				btn3 = msg.velocity;
			break;
			case 12:
				btn4 = msg.velocity;
			break;
			case 25:
				btn5 = msg.velocity;
			break;
			case 26:
				btn6 = msg.velocity;
			break;
			case 27:
				btn7 = msg.velocity;
			break;
			case 28:
				btn8 = msg.velocity;
			break;
		}
		// re-export new values on update
		module.exports.controls = {
			cc1, cc2, cc3, cc4, cc5, cc6, cc7, cc8,
			btn1, btn2, btn3, btn4, btn5, btn6, btn7, btn8
		};
	});
}

function releasedButton() {
	midiDevice.on('noteoff', (msg) => {
		switch(msg.note){
			case 9:
				btn1 = msg.velocity;
			break;
			case 10:
				btn2 = msg.velocity;		
			break;
			case 11:
				btn3 = msg.velocity;
			break;
			case 12:
				btn4 = msg.velocity;
			break;
			case 25:
				btn5 = msg.velocity;
			break;
			case 26:
				btn6 = msg.velocity;
			break;
			case 27:
				btn7 = msg.velocity;
			break;
			case 28:
				btn8 = msg.velocity;
			break;
		}
		module.exports.controls = {
			cc1, cc2, cc3, cc4, cc5, cc6, cc7, cc8,
			btn1, btn2, btn3, btn4, btn5, btn6, btn7, btn8
		};
	});
}

function ccChange() {
	midiDevice.on("cc", (msg) => {
		switch (msg.controller){
			case 21:
				cc1 = msg.value;
		    break;
		    case 22: 
		    	cc2 = msg.value;
		    break;
		    case 23:
		    	cc3 = msg.value;
	    	break;
	    	case 24:
	    		cc4 = msg.value;
			break;
			case 25:
				cc5 = msg.value;
			break;
			case 26:
				cc6 = msg.value;
			break;
			case 27:
				cc7 = msg.value;
			break;
			case 28:
				cc8 = msg.value;
			break;
		}
		module.exports.controls = {
			cc1, cc2, cc3, cc4, cc5, cc6, cc7, cc8,
			btn1, btn2, btn3, btn4, btn5, btn6, btn7, btn8
		};
	});
}

let midiMappings = {};

ipc.on("addMidiMapping", (event, arg) => {
	// listen for midi input
	midiDevice.on('noteon', (msg) => {	
		return mapping = msg.note;
	});

	midiMappings[arg] = mapping;
	console.log(midiMappings);
});