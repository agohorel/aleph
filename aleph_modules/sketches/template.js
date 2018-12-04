let hasRun = {state: false};
let r;

function runOnce(){
	let sketch = utils.getSketchName(__filename);
	r = renderers[sketch];
	// put code you only want to run once here. think of it like a second setup(). kinda. 
}

exports.run = (audio, midi, assets, utils) => {
	utils.runOnce(hasRun, runOnce);
	update3D(r, myCode);
	image(r, 0, 0, width, height);
}

function myCode(){
	r.background(200);
	r.normalMaterial();
	r.rotateX(frameCount * 0.01);
	r.box(50);
}

function update3D(renderer, yourCode){
	renderer.push();
	yourCode();
	renderer._renderer._update();
	renderer.pop();
}