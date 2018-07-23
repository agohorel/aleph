const electron = require("electron");
const ipc = electron.ipcRenderer;
const p5 = require("p5");
const p5_audio = require("p5/lib/addons/p5.sound.js");
const easymidi = require("easymidi");

// p5.disableFriendlyErrors = true;

let midiInputs = easymidi.getInputs();
console.log(midiInputs);

let midi = new easymidi.Input("Launch Control 1");
console.log(midi);

// type: noteon
// channel 8
// note: 9-12, 25-28

let noteObj = {
	channel: 0,
	controller: 0,
	value: 0,
	_type: "noteon"
};

midi.on('noteon', (msg) => {
  noteObj = msg;
  return noteObj;
});

// type: CC 
// channel 8
// controller: 21-28, 41-48

let ccObj = {
	channel: 0,
	controller: 0,
	value: 0,
	_type: "cc"
};

midi.on("cc", (msg) => {
	ccObj = msg;
	return ccObj;
});

let cnv, fft, input, spectrum, waveform, spectralCentroid, bass, mid, high, moduleName = "simpleSpectrum";

function setup() {
	cnv = createCanvas(1900, 1023);
	
	input = new p5.AudioIn();
	input.start();
	
	fft = new p5.FFT();
	fft.setInput(input);
}

function draw() {	
	myFFT();

	console.log(noteObj);

	if (moduleName !== undefined){
		try {
			let moduleFile = require(`./../modes/${moduleName}.js`);
			moduleFile.run(fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, ccObj, noteObj);
		} 

		catch (err){
			console.error(err);
		}
	}
}

function myFFT(){
	volume = input.getLevel();
	spectrum = fft.analyze();
	waveform = fft.waveform();
	bass = fft.getEnergy("bass");
	mid = fft.getEnergy("mid");
	high = fft.getEnergy("treble");
	spectralCentroid = fft.getCentroid();
}

ipc.on("modeSelector", (event, arg) => {
	moduleName = arg;
});