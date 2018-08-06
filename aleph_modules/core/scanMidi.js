const easymidi = require("easymidi");

let midiInputs = easymidi.getInputs();

// send attached midi inputs to main process
ipc.send("listMidi", midiInputs);