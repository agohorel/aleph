const p5 = require("p5");
const p5_audio = require("p5/lib/addons/p5.sound.js");

// p5.disableFriendlyErrors = true;

let cnv, input, spectrum, waveform, centroid, bass, mid, high, moduleName;

let simpleSpectrum = document.querySelector("#simpleSpectrum")
	.addEventListener("click", () => moduleName = "simpleSpectrum");

let simpleWaveform = document.querySelector("#simpleWaveform")
	.addEventListener("click", () => moduleName = "simpleWaveform");

let spectralCentroid = document.querySelector("#spectralCentroid")
	.addEventListener("click", () => moduleName = "spectralCentroid");

function setup() {
	cnv = createCanvas(1920, 1080);
	input = new p5.AudioIn();
	input.start();
	fft = new p5.FFT();
	fft.setInput(input);
}

function draw() {	
	myFFT();

	if (moduleName !== undefined){
		try {
			let moduleFile = require(`./../modes/${moduleName}.js`);
			moduleFile.run(volume, bass, mid, high, spectrum, waveform, spectralCentroid);
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