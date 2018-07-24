const easymidi = require("easymidi");

let midiInputs = easymidi.getInputs();
console.log(midiInputs);

let midiDevice = new easymidi.Input("Launch Control 1");
let knob1, knob2;

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
			console.log(`\n\n knob1 = ${knob1}, knob2 = ${knob2}.`);
	    break;
	    case 22: 
	    	knob2 = map(msg.value, 0, 127, 0, 255);
	    	console.log(`\n\n knob1 = ${knob1}, knob2 = ${knob2}.`);
	    break;
	}
	module.exports.knob1 = knob1;
});