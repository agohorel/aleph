exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi) => {
	noStroke();
	fill(0, volume * 100);
	rect(-width/2, -height/2, width, height);

	strokeWeight(map(volume, 0, 1, 1, 5));	

	push();
	rotateZ(radians(45));

	colors(0, 255); // invert colors each time to increase visibility
	renderShape(TRIANGLE_STRIP, 0, 128); // start with low spectrum resolution and double each time
	colors(255, 0);
	renderShape(TRIANGLE_STRIP, 0, 64);	
	colors(0, 255);
	renderShape(TRIANGLE_STRIP, 0, 32);
	colors(255, 0);
	renderShape(TRIANGLE_STRIP, 0, 16);


	colors(0, 255); 
	renderShapeInverse(TRIANGLE_STRIP, 0, 128); 
	colors(255, 0);
	renderShapeInverse(TRIANGLE_STRIP, 0, 64);	
	colors(0, 255);
	renderShapeInverse(TRIANGLE_STRIP, 0, 32);
	colors(255, 0);
	renderShapeInverse(TRIANGLE_STRIP, 0, 16);

	pop();
}

function renderShape(shapeType, start, stepSize){
	beginShape(shapeType);
	for (let i = start; i < spectrum.length; i+=stepSize){
		let x = map(i, 0, spectrum.length, -width/2, width/2);
	    let h = map(spectrum[i], 0, 255, height/2, -height/2);
		vertex(x, h);
	}
	endShape();
}

function renderShapeInverse(shapeType, start, stepSize){
	beginShape(shapeType);
	for (let i = start; i < spectrum.length; i+=stepSize){
		let x = map(i, 0, spectrum.length, -width/2, width/2);
	    let h = map(spectrum[i], 0, 255, height/2, -height/2);
		vertex(h, x);
	}
	endShape();
}

function colors(min, max){
	fill(map(volume, 0, .5, min, max), map(volume, 0, .5, 0, 255));
	stroke(map(volume, 0, .5, max, min));	
}