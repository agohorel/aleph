const electron = require("electron");
const ipc = electron.ipcRenderer;
const p5 = require("p5");
const p5_audio = require("p5/lib/addons/p5.sound.js");
const p5_dom = require("p5/lib/addons/p5.dom.js");
const midi = require(`${process.cwd()}\\aleph_modules\\core\\js\\midi.js`);
const fs = require("fs");

let assetsPath = `${process.cwd()}\\aleph_modules\\assets`;
let cnv, _2D;

let fft, input, spectrum, waveform, spectralCentroid, bass, mid, high, moduleName = "", amplitude, leftVol, rightVol, leftVolEased = .001, rightVolEased = .001, volEased = .001;
let assets = {models: {}, textures: {}, fonts: {}, shaders: {}};
let audio = {};
// set up initial values for audioParams object
let audioParams = {0: 1, 1: 1, 2: 1, 3: 1, 4: .45, 5: 0.25};

// p5.disableFriendlyErrors = true;

function preload() {
	importer("models");
	importer("textures");
	importer("fonts");
	importer("shaders");
}

function setup() {
	cnv = createCanvas(windowWidth, windowHeight, WEBGL);
	_2D = createGraphics(windowWidth, windowHeight, P2D);

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
			let moduleFile = require(`../../sketches/${moduleName}.js`);
			moduleFile.run(audio, midi.controls, assets);
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

// note to self: break checking folders into separate function
function importer(folder){
	let count = 0;
	fs.readdir(`${assetsPath}/${folder}`, (err, files) => {
		if (err){ console.log(err); } 
		else {

			if (folder === "shaders"){
					scanShaders();									
			} 

			files.forEach((file, index) => {
				// get file name
				let name = file.substring(0, file.lastIndexOf(".")) || file;

				// check which folder we're importing from 
				if (folder === "models"){
					// create entry on assets object & load file
					assets.models[name] = loadModel(`../../assets/models/${file}`, true);
				}
				
				if (folder === "textures"){
					assets.textures[name] = loadImage(`../../assets/textures/${file}`, true);
				}
				
				if (folder === "fonts"){
					// grab file names and replace hyphens with underscores
					let fontName = file.substring(0, file.length-4).replace("-", "_");
					// filter out font license txt files
					if (file.substring(file.length-4, file.length) !== ".txt"){
						assets.fonts[fontName] = loadFont(`../../assets/fonts/${file}`);
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

function resetStyles(){
	clear();
	strokeWeight(1);
	stroke(255);
	fill(0);
	ellipseMode(CENTER);
	rectMode(CORNER);
	textAlign(LEFT, BOTTOM);
}

function clamp(val, min, max){
	return Math.max(min, Math.min(val, max));
}

function scanShaders(){
	let shaders = fs.readdirSync(`${assetsPath}/shaders`);
	importShaders(shaders);
}

function importShaders(array){
	for (let i = 0; i < array.length; i++){
		let name = array[i].substring(0, array[i].lastIndexOf(".")) || array[i];
		assets.shaders[name] = loadShader(`${assetsPath}/shaders/${name}.vert`, `${assetsPath}/shaders/${name}.frag`);
	}	
}