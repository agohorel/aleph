const electron = require("electron");
const ipc = electron.ipcRenderer;
const p5 = require("p5");
const p5_audio = require("p5/lib/addons/p5.sound.js");
const midi = require("./midi.js");

let fft, input, spectrum, waveform, spectralCentroid, bass, mid, high, moduleName = "";

// p5.disableFriendlyErrors = true;

function setup() {
	let cnv = createCanvas(windowWidth, windowHeight, WEBGL);

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

// resize canvas if window is resized
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	centerCanvas();
	background(0);
}

// re-center canvas if the window is resized
function centerCanvas() {
	var x = (windowWidth - width) / 2;
	var y = (windowHeight - height) / 2;
	canvas.position(x, y);
}