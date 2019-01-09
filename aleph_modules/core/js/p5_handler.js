// p5.disableFriendlyErrors = true;

const electron = require("electron");
const ipc = electron.ipcRenderer;
const p5 = require("p5");
const p5_audio = require("p5/lib/addons/p5.sound.js");
const p5_dom = require("p5/lib/addons/p5.dom.js");
const fs = require("fs");
const path = require("path");

const midi = require(path.resolve(__dirname, "../js/midi.js"));
const assetsPath = path.resolve(__dirname, "../../assets/");
const sketchesPath = path.resolve(__dirname, "../../sketches/");
const utils = require(path.resolve(__dirname, "../js/utils.js"));

let fft, input, spectrum, waveform, spectralCentroid, bass, mid, high, moduleName = "", amplitude, leftVol, rightVol, leftVolEased = .001, rightVolEased = .001, volEased = .001;
let assets = {models: {}, textures: {}, fonts: {}, shaders: {}};
let audio = {};
let audioParams = {0: 1, 1: 1, 2: 1, 3: 1, 4: .45, 5: 0.25}; // set up initial values for audioParams object
let cnv, _2D;
let renderers = {};
let pxlDensity;
let aa;

function preload() {
	importer("models");
	importer("textures");
	importer("fonts");
	importer("shaders");
	scanSketches(assignRenderers);

	ipc.on("applyDisplaySettings", (event, arg) => {
		pxlDensity = Number(arg[2]);
		pixelDensity(pxlDensity);
		aa = Number(arg[3]);
		setAA(aa);
	});
}

function setAA(aa){
	if (aa > 0) {smooth();} else {noSmooth()}
}

function setup() {
	cnv = createCanvas(windowWidth, windowHeight);
	_2D = createGraphics(windowWidth, windowHeight);

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
			let moduleFile = require(path.resolve(__dirname, "../../sketches/", moduleName));
			moduleFile.run(audio, midi.controls, assets, utils);
		} 

		catch (err){
			console.error(err);
		}
	}
}

function analyzeAudio(){
	volume = clamp(amplitude.getLevel() * audioParams[0], 0, 1);
	leftVol = clamp(amplitude.getLevel(0) * audioParams[0], 0, 1);
	rightVol = clamp(amplitude.getLevel(1) * audioParams[0], 0, 1);
	spectrum = fft.analyze();
	waveform = fft.waveform();
	bass = clamp(fft.getEnergy("bass") * audioParams[1], 0, 255);
	mid = clamp(fft.getEnergy("mid") * audioParams[2], 0, 255);
	high = clamp(fft.getEnergy("treble") * audioParams[3], 0, 255);
	fft.smooth(audioParams[4]);
	spectralCentroid = fft.getCentroid();
	smoother(volume, leftVol, rightVol, .5 - audioParams[5]);
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
	audioParams = arg;
});

// resize canvas if window is resized
function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	_2D.resizeCanvas(windowWidth, windowHeight);
	scanSketches(resizeOffscreenRenderers);
	centerCanvas();
	background(0);
}

// re-center canvas if the window is resized
function centerCanvas() {
	var x = (windowWidth - width) / 2;
	var y = (windowHeight - height) / 2;
	cnv.position(x, y);
}

function nearestPow2(value){
  return Math.pow(2, Math.round(Math.log(value)/Math.log(2))); 
}

function importer(folder){
	let count = 0;
	fs.readdir(path.join(assetsPath, folder), (err, files) => {
		if (err){ console.log(err); } 
		else {

			if (folder === "shaders"){
				scanShaders();									
			} 

			files.forEach((file, index) => {
				// get file name
				let name = file.substring(0, file.lastIndexOf(".")).replace(/[- ]/g, "_") || file;

				// check which folder we're importing from 
				if (folder === "models"){
					// create entry on assets object & load file
					assets.models[name] = loadModel(path.join(assetsPath, "models", file), true);
				}
				
				if (folder === "textures"){
					assets.textures[name] = loadImage(path.join(assetsPath, "textures", file));
				}
				
				if (folder === "fonts"){
					// grab file names and replace hyphens with underscores
					let fontName = file.substring(0, file.lastIndexOf(".")).replace(/[- ]/g, "_");
					// filter out font license txt files
					if (file.substring(file.length-4, file.length) !== ".txt"){
						assets.fonts[fontName] = loadFont(path.join(assetsPath, "fonts", file));;
					}
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

// reset basic p5 visual params when changing sketch to prevent "leaking" styles
function resetStyles(){
	clear();
	_2D.clear();
	strokeWeight(1);
	stroke(255);
	fill(0);
	ellipseMode(CENTER);
	rectMode(CORNER);
	resetMatrix();
	setAA(aa);
}

function clamp(val, min, max){
	return Math.max(min, Math.min(val, max));
}

function scanShaders(){
	let shaders = fs.readdirSync(path.join(assetsPath, "shaders"));
	importShaders(shaders);
}

function importShaders(array){
	for (let i = 0; i < array.length; i++){
		let name = array[i].substring(0, array[i].lastIndexOf(".")) || array[i];
		let vert = path.join(assetsPath, "shaders", `${name}.vert`);
		let frag = path.join(assetsPath, "shaders", `${name}.frag`);
		assets.shaders[name] = loadShader(vert, frag);
	}	
}

function scanSketches(callback){
	fs.readdir(sketchesPath, (err, sketches) => {
		if (err) { console.log(err) }
		else { callback(sketches); }
	});
}

function assignRenderers(sketches){
	for (let i = 0; i < sketches.length; i++){
		let sketch = sketches[i].substring(0, sketches[i].lastIndexOf("."));
		renderers[sketch] = createGraphics(width, height, WEBGL);
	}
}

function resizeOffscreenRenderers(sketches){
	for (let i = 0; i < sketches.length; i++){
		let sketch = sketches[i].substring(0, sketches[i].lastIndexOf("."));
		renderers[sketch].resizeCanvas(windowWidth, windowHeight);
	}
}