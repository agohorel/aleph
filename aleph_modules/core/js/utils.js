exports.runOnce = (hasRun, codeToRun) => {
	if (hasRun.state === false){
		codeToRun();
		hasRun.state = true;
	}
};

exports.getSketchName = (myPath) => {
	return sketch = path.basename(myPath, ".js");
};