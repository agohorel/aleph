const electron = require("electron");
const ipc = electron.ipcRenderer;
const p5 = require("p5");
const p5_audio = require("p5/lib/addons/p5.sound.js");
const midi = require("./midi.js");
const fs = require("fs");

let fft, input, spectrum, waveform, spectralCentroid, bass, mid, high, moduleName = "", amplitude, leftVol, rightVol, leftVolEased = .001, rightVolEased = .001, volEased = .001;
let assets = {models: {}, textures: {}};
let audio = {};

// p5.disableFriendlyErrors = true;

function preload() {
	importer("models");
	importer("textures");
}

function setup() {
	let cnv = createCanvas(windowWidth, windowHeight, WEBGL);
	// var gl = document.getElementById('defaultCanvas0').getContext('webgl');
	// gl.disable(gl.DEPTH_TEST);

	input = new p5.AudioIn();
	input.start();
	
	amplitude = new p5.Amplitude();
	amplitude.setInput(input);

	fft = new p5.FFT();
	fft.setInput(input);
}

function draw() {	
	analyzeAudio();

	if (moduleName !== ""){
		try {
			let moduleFile = require(`./../sketches/${moduleName}.js`);
			moduleFile.run(audio, midi.controls, assets);
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
	volume = amplitude.getLevel();
	leftVol = amplitude.getLevel(0);
	rightVol = amplitude.getLevel(1);
	spectrum = fft.analyze();
	waveform = fft.waveform();
	bass = fft.getEnergy("bass");
	mid = fft.getEnergy("mid");
	high = fft.getEnergy("treble");
	spectralCentroid = fft.getCentroid();
	smoother(volume, leftVol, rightVol, 0.025);
	audio = {
		fft, volume, leftVol, rightVol, spectrum, waveform, 
		bass, mid, high, spectralCentroid, 
		volEased, leftVolEased, rightVolEased
	};
}

function adjustAudioParams(){
	volume = amplitude.getLevel() * map(midi.controls.controller(1).value, 0, 127, 0, 2);
	leftVol = amplitude.getLevel(0);
	rightVol = amplitude.getLevel(1);
	bass = fft.getEnergy("bass") * map(midi.controls.controller(2).value, 0, 127, 0, 2);
	mid = fft.getEnergy("mid") * map(midi.controls.controller(3).value, 0, 127, 0, 2);
	high = fft.getEnergy("treble") * map(midi.controls.controller(4).value, 0, 127, 0, 2);
	fft.smooth(map(midi.controls.controller(5).value, 0, 127, 0, .999));
	spectrum = fft.analyze();
	waveform = fft.waveform();
	spectralCentroid = fft.getCentroid();
	smoother(volume, leftVol, rightVol, map(midi.controls.controller(6).value, 0, 127, .5, .001));
	audio = {
		fft, volume, leftVol, rightVol, spectrum, waveform, 
		bass, mid, high, spectralCentroid, 
		volEased, leftVolEased, rightVolEased
	};	
}

ipc.on("sketchSelector", (event, arg) => {
	resetStyles();
	moduleName = arg;
});

ipc.on("knobChanged", (event, arg) => {
	console.log(arg);
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

function importer(folder){
	fs.readdir(`./aleph_modules/assets/${folder}`, (err, files) => {
		if (err){
			console.log(err);
		} else {
			files.forEach((file, index) => {
				// get file name
				let name = file.substring(0, file.length-4);
				// check which folder we're importing from 
				if (folder === "models"){
					// create entry on assets object & load file
					assets.models[name] = loadModel(`../assets/models/${file}`, true);
				}
				if (folder === "textures"){
					assets.textures[name] = loadImage(`../assets/textures/${file}`, true);
				} 
			});
		}
	});
}

function smoother(volume, leftVol, rightVol, easing){
	let scaler = 0.1;

	let target = volume * scaler;
	let diff = target - volEased;
	volEased += diff * easing;

	let targetL = leftVol * scaler;
	let diffL = targetL - leftVolEased;
	leftVolEased += diffL * easing;

	let targetR = rightVol * scaler;
	let diffR = targetR - rightVolEased;
	rightVolEased += diffR * easing;
}

function resetStyles(){
	strokeWeight(1);
	stroke(255);
	fill(0);
}