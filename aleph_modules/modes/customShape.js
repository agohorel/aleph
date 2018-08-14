exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi) => {
	noStroke();
	fill(0, 100 - volume * 255);
	rect(-width/2, -height/2, width, height);

	fill(map(volume, 0, .5, 255, 0));
	stroke(map(volume, 0, .5, 0, 255));
	strokeWeight(volume * 5);

	for (let i = 0; i < spectrum.length; i+=spectrum.length/128){
		renderSection(TRIANGLE_STRIP, i, int(map(volume, 0, 1, 4, 64)));
	}	

}

function renderSection(shapeType, start, stepSize){
	beginShape(shapeType);

	for (let i = start; i < spectrum.length; i+=stepSize){
		let x = map(i, 0, spectrum.length, -width/2, width/2);
	    let h = map(spectrum[i], 0, 255, height/2, -height/2);
	 	
		vertex(x, h);
	}

	endShape();
}