exports.runOnce = (hasRun, codeToRun) => {
	if (hasRun === false){
		codeToRun();
	}
};

exports.getSketchName = (myPath) => {
	return sketch = path.basename(myPath, ".js");
};