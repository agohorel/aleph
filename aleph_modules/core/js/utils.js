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

exports.makeDomElementWithId = (type, text, id, className, destParent, boolean) => {
	let element = document.createElement(type);
	let displayText = document.createTextNode(text);
	element.appendChild(displayText);

	for (let i = 0; i < className.length; i++){
		element.classList.add(className[i]);
	}
	
	element.id = id;
	element.disabled = boolean;
	document.querySelector(destParent).appendChild(element);
}