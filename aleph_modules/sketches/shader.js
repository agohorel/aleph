let hasRun = {state: false};
let _3D;
let yEased = .001;

exports.run = (audio, midi, assets, utils) => {
	utils.renderLoop(hasRun, setup, _3D, draw);
}

function setup(){
	let sketch = utils.getSketchName(__filename);
	_3D = renderers[sketch];
	// put code you only want to run once here.
}

function draw() {
	// apply a shader from our assets object
	_3D.shader(assets.shaders.shd);
	// smooth mouse input to use later
	smoother(mouseY, 0.1);
	// this sets the "camera" position
	assets.shaders.shd.setUniform('p', [-0.74364388703, 0.13182590421]);
	// this slightly warps the fractal, set by mouseY 
	assets.shaders.shd.setUniform('s', map(yEased, 0, height, 2, 6));
	// this controls the zoom level, set by mouseY
	assets.shaders.shd.setUniform('r', map(yEased, 0, height, 0.00001, 25));
	// draw a shape to apply the shader to
	_3D.plane(width, height);
}

function smoother(val, easing){
	let scaler = 0.1;
	let targetVal = val * scaler;
	let diff = targetVal - yEased;
	yEased += diff * easing;
}