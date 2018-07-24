const easymidi = require("easymidi");

let midiInputs = easymidi.getInputs();
console.log(midiInputs);

let midiDevice = new easymidi.Input("Launch Control 1");
let knob1 = 0, knob2 = 0, knob3 = 0, knob4 = 0, knob5 = 0, knob6 = 0, knob7 = 0, knob8 = 0;

// type: noteon
// channel 8
// note: 9-12, 25-28
midiDevice.on('noteon', (msg) => {
  noteObj = msg;
  return noteObj;
});

// type: CC 
// channel 8
// controller: 21-28, 41-48
midiDevice.on("cc", (msg) => {
	switch (msg.controller){
		case 21:
			knob1 = msg.value;
	    break;
	    case 22: 
	    	knob2 = msg.value;
	    break;
	    case 23:
	    	knob3 = msg.value;
    	break;
    	case 24:
    		knob4 = msg.value;
		break;
		case 25:
			knob5 = msg.value;
		break;
		case 26:
			knob6 = msg.value;
		break;
		case 27:
			knob7 = msg.value;
		break;
		case 28:
			knob8 = msg.value;
		break;
	}
	// re-export new values on update
	module.exports.controls = {
		knob1, 
		knob2,
		knob3, 
		knob4,
		knob5, 
		knob6,
		knob7, 
		knob8,
	};
});

// initial export of default values
module.exports.controls = {
	knob1, 
	knob2,
	knob3, 
	knob4,
	knob5, 
	knob6,
	knob7, 
	knob8,
};