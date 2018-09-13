exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi) => {
	background(0);
	strokeWeight(map(volume, 0, 1, 1, 5));	
	scale(.4);

	push();
	rotateZ(radians(45));

	colors(255, 0);
	renderShape(TRIANGLE_FAN, 128, -500); 
	colors(0, 255);
	renderShape(TRIANGLE_FAN, 64, -500);	
	colors(255, 0);
	renderShape(TRIANGLE_FAN, 32, -500);
	colors(0, 255);
	renderShape(TRIANGLE_FAN, 16, -500);


	colors(255, 0); 
	renderShapeInverse(TRIANGLE_FAN, 128, -500); 
	colors(0, 255);
	renderShapeInverse(TRIANGLE_FAN, 64, -500);	
	colors(255, 0);
	renderShapeInverse(TRIANGLE_FAN, 32, -500);
	colors(0, 255);
	renderShapeInverse(TRIANGLE_FAN, 16, -500);

	colors(255, 0);
	renderShape(TRIANGLE_FAN, 128, 500); 
	colors(0, 255);
	renderShape(TRIANGLE_FAN, 64, 500);	
	colors(255, 0);
	renderShape(TRIANGLE_FAN, 32, 500);
	colors(0, 255);
	renderShape(TRIANGLE_FAN, 16, 500);


	colors(255, 0); 
	renderShapeInverse(TRIANGLE_FAN, 128, 500); 
	colors(0, 255);
	renderShapeInverse(TRIANGLE_FAN, 64, 500);	
	colors(255, 0);
	renderShapeInverse(TRIANGLE_FAN, 32, 500);
	colors(0, 255);
	renderShapeInverse(TRIANGLE_FAN, 16, 500);

	colors(0, 255); 
	renderShape(TRIANGLE_STRIP, 128, 0); 
	colors(255, 0);
	renderShape(TRIANGLE_STRIP, 64, 0);	
	colors(0, 255);
	renderShape(TRIANGLE_STRIP, 32, 0);
	colors(255, 0);
	renderShape(TRIANGLE_STRIP, 16, 0);


	colors(0, 255); 
	renderShapeInverse(TRIANGLE_STRIP, 128, 0); 
	colors(255, 0);
	renderShapeInverse(TRIANGLE_STRIP, 64, 0);	
	colors(0, 255);
	renderShapeInverse(TRIANGLE_STRIP, 32, 0);
	colors(255, 0);
	renderShapeInverse(TRIANGLE_STRIP, 16, 0);

	pop();
}

function renderShape(shapeType, stepSize, offset){
	beginShape(shapeType);
	for (let i = 0; i < spectrum.length; i+=stepSize){
		let x = map(i, 0, spectrum.length, -width/2 + offset, width/2 + offset);
	    let h = map(spectrum[i], 0, 255, height/2, -height/2);
		vertex(x, h);
	}
	endShape();
}

function renderShapeInverse(shapeType, stepSize, offset){
	beginShape(shapeType);
	for (let i = 0; i < spectrum.length; i+=stepSize){
		let x = map(i, 0, spectrum.length, -width/2 + offset, width/2 + offset);
	    let h = map(spectrum[i], 0, 255, height/2, -height/2);
		vertex(h, x);
	}
	endShape();
}

function colors(min, max){
	fill(map(volume, 0, .5, min, max), map(volume, 0, .5, 0, 255));
	stroke(map(volume, 0, .5, max, min));	
}