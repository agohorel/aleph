const easymidi = require("easymidi");

let midiInputs = easymidi.getInputs();
console.log(midiInputs);

let midiDevice = new easymidi.Input("Launch Control 1");
let knob1 = 0, knob2 = 0, knob3 = 0, knob4 = 0, knob5 = 0, knob6 = 0, knob7 = 0, knob8 = 0;
let btn1 = 0, btn2 = 0, btn3 = 0, btn4 = 0, btn5 = 0, btn6 = 0, btn7 = 0, btn8 = 0;

// type: noteon
// channel 8
// note: 9-12, 25-28
midiDevice.on('noteon', (msg) => {
	console.log(msg);
	switch(msg.note){
		case 9:
			btn1 = msg.velocity;
		break;
		case 10:
			btn2 = msg.velocy;		
		break;
		case 11:
			btn3 = msg.velocy;
		break;
		case 12:
			btn4 = msg.velocy;
		break;
		case 25:
			btn5 = msg.velocy;
		break;
		case 26:
			btn6 = msg.velocy;
		break;
		case 27:
			btn7 = msg.velocy;
		break;
		case 28:
			btn8 = msg.velocy;
		break;
	}
	module.exports.controls = {
		btn1,
		btn2,
		btn3,
		btn4,
		btn5,
		btn6,
		btn7,
		btn8
	};
});

midiDevice.on('noteoff', (msg) => {
	switch(msg.note){
		case 9:
			btn1 = msg.velocity;
		break;
		case 10:
			btn2 = msg.velocy;		
		break;
		case 11:
			btn3 = msg.velocy;
		break;
		case 12:
			btn4 = msg.velocy;
		break;
		case 25:
			btn5 = msg.velocy;
		break;
		case 26:
			btn6 = msg.velocy;
		break;
		case 27:
			btn7 = msg.velocy;
		break;
		case 28:
			btn8 = msg.velocy;
		break;
	}
	module.exports.controls = {
		btn1,
		btn2,
		btn3,
		btn4,
		btn5,
		btn6,
		btn7,
		btn8
	};
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
		knob8
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
	btn1,
	btn2,
	btn3,
	btn4,
	btn5,
	btn6,
	btn7,
	btn8
};