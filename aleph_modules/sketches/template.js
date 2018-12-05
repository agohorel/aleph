let hasRun = {state: false};
let _3D;

exports.run = (audio, midi, assets, utils) => {
	utils.renderLoop(hasRun, setup, _3D, draw);
}

function setup(){
	let sketch = utils.getSketchName(__filename);
	_3D = renderers[sketch];
	// put code you only want to run once here.
}

function draw(){
	_3D.background(200);
	_3D.normalMaterial();
	_3D.rotateX(frameCount * 0.01);
	_3D.rotateY(frameCount * 0.01);
	_3D.box(200);
}