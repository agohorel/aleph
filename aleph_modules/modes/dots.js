exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi) => {
	let r = map(bass, 0, 255, 50, 255), 
		g = map(mid, 0, 255, 50, 255), 
		b = map(high, 0, 255, 50, 255);
	
	let scaleAmt = 10;

	translate(-width/2, -height/2, 0);

	noStroke();
	fill(0);
	rect(0, 0, width, height);

	// copy(0, 0, width, height, -20, 0, width + 40, height);

	fill(r, g, b, map(volume, 0, .5, 20, 255));
	stroke(0);
	strokeWeight(volume);

	for (let i = 0; i < spectrum.length/4; i++){
		let x = map(i, 0, spectrum.length/4, volume * 100, width);
	    let h = -height + map(spectrum[i], 0, 255, height, volume * 100);

	    ellipse(x, -h, scale(volume), scale(volume));
	    ellipse(-h, x, scale(volume), scale(volume));

	    ellipse(width-x, height+h, scale(volume), scale(volume));
	    ellipse(width+h, height-x, scale(volume), scale(volume));
	}

}

function scale(value){
	return map(value, 0, 1, 1, 20);
}