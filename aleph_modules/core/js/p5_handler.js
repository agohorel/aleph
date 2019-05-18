// p5.disableFriendlyErrors = true;
const electron = require("electron");
const ipc = electron.ipcRenderer;
const { dialog } = electron.remote;
const p5 = require("p5");
const p5_dom = require("p5/lib/addons/p5.dom.js");
const fs = require("fs");
const path = require("path");

const assetsPath = path.resolve(__dirname, "../../assets/");
const sketchesPath = path.resolve(__dirname, "../../sketches/");
const utils = require(path.resolve(__dirname, "../js/utils.js"));

let moduleName = "";
let assets = {models: {}, textures: {}, fonts: {}, shaders: {}};
let cnv, _2D;
let renderers = {};
let pxlDensity;
let aa;
let midi = {};
let audio = {};

ipc.on("updateAudio", (event, args) => {
	audio = args;
});

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

	// ipc calls to check for previously loaded MIDI if window is refreshed
	ipc.send("p5MidiInit", null);

	ipc.on("p5MidiInit", (event, args) => {
		midi = args;
	});
}

function setAA(aa){
	aa > 0 ? smooth() : noSmooth();
}

function setup() {
	cnv = createCanvas(windowWidth, windowHeight);
	_2D = createGraphics(windowWidth, windowHeight);
}

function draw() {		
	if (moduleName !== ""){
		try {
			let moduleFile = require(path.resolve(__dirname, "../../sketches/", moduleName));
			moduleFile.run(audio, midi, assets, utils);
		} 

		catch (err){
			console.error(err);
		}
	}
} 

function checkSketchMidiControls(controlsArray){
	for (let i = 0; i < controlsArray.length; i++){
		// if a button belonging to the sketchCtrl array has been pressed, set the currently running sketch
		if (controlsArray[i].value > 0){
			moduleName = controlsArray[i].name;
			ipc.send("sketchChanged", controlsArray[i].name);
		}
	}
}

ipc.on("sketchSelector", (event, arg) => {
	resetStyles();
	moduleName = arg;
});

ipc.on("sketchChangedWithMidi", (event, arg) => {
	checkSketchMidiControls(arg);
});

ipc.on("updateMidi", (event, args) => {
	midi = args;
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
		err ? console.log(err) : callback(sketches);
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