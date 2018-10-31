// this sketch layers waveforms at varying levels of detail using p5's beginShape() function.
// it also makes use of p5's transformation functions scale() and rotateZ().

exports.run = (audio, midi, assets) => {
	// set background to black
	background(0);
	// link strokeWeight to volume
	strokeWeight(map(audio.volume, 0, 1, 1, 5));
	// link fill & opacity to volume
	fill(map(audio.volume, 0, .5, 0, 255), map(audio.volume, 0, .5, 0, 255));
	// set stroke to opposite of fill (note the order of the last 2 arguments)
	stroke(map(audio.volume, 0, .5, 255, 0));
	// shrink everything by 60% to fit on screen
	scale(.4); 

	rotateZ(radians(135));
	// loops typically start at 0 but we have to start at 1 because we're 
	// passing the i variable into functions that require non-zero values.  
	for (let i = 1; i < 513; i+=16){
		// call renderShape function, passing in new values each loop (i)
		renderShape(TRIANGLE_STRIP, i, i*4);
		// invert coords each loop
		scale(-1);
		// call renderShapeInverse, passing in the same i values as before to produce mirrored copy of shape
		renderShapeInverse(TRIANGLE_STRIP, i, i*4);
	}

}

// this is our custom renderShape function, which allows us to render waveforms at varying resolutions in a reusable manner.
function renderShape(shapeType, stepSize, offset){
	beginShape(shapeType); // open our shape 
	for (let i = 0; i < audio.spectrum.length; i+=stepSize){ // loop through spectrum at given resolution
		// grab x coord and add some offset (padding)
		let x = map(i, 0, audio.spectrum.length, -width/2 + offset, width/2 + offset); 
	    // grab y coord and add some offset (padding)
	    let h = map(audio.spectrum[i], 0, 255, height + offset, -height + offset);
		// add a point to the shape using our x,y coords
		vertex(x, h); 
	}
	// close our shape after the loop has terminated
	endShape(); 
}

// this is identical to the renderShape function, except the x,y coords passed to the p5 vertex() function
// are reversed. there is a better way to implement this with less repeated code, but i'll leave that to you!
function renderShapeInverse(shapeType, stepSize, offset){
	beginShape(shapeType);
	for (let i = 0; i < audio.spectrum.length; i+=stepSize){
		let x = map(i, 0, audio.spectrum.length, -width/2 + offset, width/2 + offset);
	    let h = map(audio.spectrum[i], 0, 255, height + offset, -height + offset);
		vertex(h, x); // the x,y coordinates are flipped relative to renderShape()
	}
	endShape();
}