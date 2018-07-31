const electron = require("electron");
const ipc = electron.ipcRenderer;
const p5 = require("p5");
const p5_audio = require("p5/lib/addons/p5.sound.js");
const midi = require("./midi.js");

let cnv, fft, input, spectrum, waveform, spectralCentroid, bass, mid, high, moduleName = "";

// p5.disableFriendlyErrors = true;

function setup() {
	cnv = createCanvas(1900, 1023);
	
	input = new p5.AudioIn();
	input.start();
	
	fft = new p5.FFT();
	fft.setInput(input);
}

function draw() {	
	myFFT();

	if (moduleName !== ""){
		try {
			let moduleFile = require(`./../modes/${moduleName}.js`);
			moduleFile.run(fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi.controls);
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