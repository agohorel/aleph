exports.runOnce = (hasRun, codeToRun) => {
	if (hasRun.state === false){
		codeToRun();
		hasRun.state = true;
	}
};

exports.getSketchName = (myPath) => {
	return sketch = path.basename(myPath, ".js");
};

exports.update3D = (renderer, yourCode) => {
	renderer.push();
	yourCode();
	renderer._renderer._update();
	renderer.pop();
}

exports.renderLoop = (hasRun, setup, renderer, draw) => {
	module.exports.runOnce(hasRun, setup);
	module.exports.update3D(renderer, draw);
	image(renderer, 0, 0, width, height);
}