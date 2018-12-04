let hasRun = {state: false};
let r;

function setup(){
	let sketch = utils.getSketchName(__filename);
	r = renderers[sketch];
	// put code you only want to run once here.  
}

function draw(){
	r.background(200);
	r.normalMaterial();
	r.rotateX(frameCount * 0.01);
	r.rotateY(frameCount * 0.01);
	r.box(200);
}

exports.run = (audio, midi, assets, utils) => {
	utils.runOnce(hasRun, setup);
	utils.update3D(r, draw);
	image(r, 0, 0, width, height);
}

