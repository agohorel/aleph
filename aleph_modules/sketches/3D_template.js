let hasRun = {state: false};
let _3D;

exports.run = (audio, midi, assets, utils) => {
	utils.renderLoop(hasRun, setup, _3D, draw);
}

function setup(){
	let sketch = utils.getSketchName(__filename);
	_3D = renderers[sketch];
	// put code you only want to run once here
}

function draw(){
	// your code here
}