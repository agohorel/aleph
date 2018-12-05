// this sketch layers waveforms at varying levels of detail using p5's beginShape() function.
// it also makes use of p5's transformation functions scale() and rotateZ().

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

function draw() {
	// set background to black
	_3D.background(0);
	// link strokeWeight to volume
	_3D.strokeWeight(map(audio.volume, 0, 1, 1, 5));
	// link fill & opacity to volume
	_3D.fill(map(audio.volume, 0, .5, 0, 255), map(audio.volume, 0, .5, 0, 255));
	// set stroke to opposite of fill (note the order of the last 2 arguments)
	_3D.stroke(map(audio.volume, 0, .5, 255, 0));
	// shrink everything by 60% to fit on screen
	_3D.scale(.4); 

	_3D.rotateZ(radians(135));
	// loops typically start at 0 but we have to start at 1 because we're 
	// passing the i variable into functions that require non-zero values.  
	for (let i = 2; i < 34; i+=4){
		// call renderShape function, passing in new values each loop (i)
		renderShape(TRIANGLE_STRIP, i, i*16);
		// invert coords each loop
		_3D.scale(-1);
		// call renderShapeInverse, passing in the same i values as before to produce mirrored copy of shape
		renderShapeInverse(TRIANGLE_STRIP, i, i*16);
	}

}

// this is our custom renderShape function, which allows us to render waveforms at varying resolutions in a reusable manner.
function renderShape(shapeType, stepSize, offset){
	_3D.beginShape(shapeType); // open our shape 
	for (let i = 0; i < audio.spectrum.length; i+=stepSize){ // loop through spectrum at given resolution
		// grab x coord and add some offset (padding)
		let x = map(i, 0, audio.spectrum.length, -width/2 + offset, width/2 + offset); 
	    // grab y coord and add some offset (padding)
	    let h = map(audio.spectrum[i], 0, 255, height + offset, -height + offset);
		// add a point to the shape using our x,y coords
		_3D.vertex(x, h); 
	}
	// close our shape after the loop has terminated
	_3D.endShape(); 
}

// this is identical to the renderShape function, except the x,y coords passed to the p5 vertex() function are reversed. 
function renderShapeInverse(shapeType, stepSize, offset){
	_3D.beginShape(shapeType);
	for (let i = 0; i < audio.spectrum.length; i+=stepSize){
		let x = map(i, 0, audio.spectrum.length, -width/2 + offset, width/2 + offset);
	    let h = map(audio.spectrum[i], 0, 255, height + offset, -height + offset);
		_3D.vertex(h, x); // the x,y coordinates are flipped relative to renderShape()
	}
	_3D.endShape();
}