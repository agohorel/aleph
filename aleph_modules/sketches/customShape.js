// this sketch layers waveforms at varying levels of detail using p5's beginShape() function.
// it also makes use of p5's transformation functions scale() and rotateZ().

exports.run = (audio, midi, assets, utils) => {
	// set background to black
	background(map(audio.volEased, 0, .5, 0, 255));
	// link strokeWeight to volume
	strokeWeight(map(audio.volume, 0, 1, 1, 5));
	// link fill & opacity to volume
	fill(map(audio.volume, 0, .5, 0, 255), map(audio.volume, 0, .5, 0, 255));
	// set stroke to opposite of fill (note the order of the last 2 arguments)
	stroke(map(audio.volume, 0, .5, 255, 0));
	
	rotate(radians(map(mouseX, 0, width, 0, 180)));

	renderShape(TRIANGLE_STRIP, vert);
	renderShape(TRIANGLE_STRIP, inverseVert);
}

function renderShape(shapeType, callback){
	beginShape(shapeType);

	for (let i = 0; i < audio.spectrum.length; i += 8) {
		let x = map(i, 0, audio.spectrum.length, 0, width * 2);
		let y = map(audio.spectrum[i], 0, 255, height, 0);
		callback(x, y);
	}

	endShape();
}

function vert(x, y){
	vertex(x, y);
}

function inverseVert(x, y) {
	vertex(y, x);
}