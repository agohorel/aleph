const electron = require("electron");
const ipc = electron.ipcRenderer;
const p5 = require("p5");
const p5_audio = require("p5/lib/addons/p5.sound.js");
const midi = require("./midi.js");

let fft, input, spectrum, waveform, spectralCentroid, bass, mid, high, moduleName = "";

// p5.disableFriendlyErrors = true;

function setup() {
	let cnv = createCanvas(windowWidth, windowHeight, WEBGL);
	var gl = document.getElementById('defaultCanvas0').getContext('webgl');
	gl.disable(gl.DEPTH_TEST);

	input = new p5.AudioIn();
	input.start();
	
	fft = new p5.FFT();
	fft.setInput(input);
}

function draw() {	
	analyzeAudio();

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

function analyzeAudio(){
	if (midi.controls.controller == undefined){
		defaultAudioAnalysis();
	}
	else{
		adjustAudioParams();
	}
}


function defaultAudioAnalysis(){
	volume = input.getLevel();
	spectrum = fft.analyze();
	waveform = fft.waveform();
	bass = fft.getEnergy("bass");
	mid = fft.getEnergy("mid");
	high = fft.getEnergy("treble");
	spectralCentroid = fft.getCentroid();
}

function adjustAudioParams(){
	fft.smooth(map(midi.controls.controller(5).value, 0, 127, 0, .999));
	let bins = nearestPow2(map(midi.controls.controller(6).value, 0, 127, 16, 1024));
	let precision = nearestPow2(map(midi.controls.controller(7).value, 0, 127, 256, 16384)).toString();
	volume = input.getLevel() * map(midi.controls.controller(1).value, 0, 127, 0, 2);
	spectrum = fft.analyze(bins);
	waveform = fft.waveform(bins, precision);
	bass = fft.getEnergy("bass") * map(midi.controls.controller(2).value, 0, 127, 0, 2);
	mid = fft.getEnergy("mid") * map(midi.controls.controller(3).value, 0, 127, 0, 2);
	high = fft.getEnergy("treble") * map(midi.controls.controller(4).value, 0, 127, 0, 2);
	spectralCentroid = fft.getCentroid();	
	console.log(waveform.length, spectrum.length);
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

function nearestPow2(value){
  return Math.pow(2, Math.round(Math.log(value)/Math.log(2))); 
}