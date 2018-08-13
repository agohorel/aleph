exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi) => {
	let r = bass, g = mid, b = high;
	let scaleAmt = 10;

	noStroke();
	fill(midi.controller(1).value, midi.controller(2).value);
	rect(0, 0, width, height);

	copy(0, 0, width, height, -20, 0, width + 40, height);

	fill(r/2, g/4, b * 1.5, map(volume, 0, .5, 20, 255));
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