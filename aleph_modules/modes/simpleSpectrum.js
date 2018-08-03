exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi) => {
	let r = bass, g = mid, b = high;

	background(midi.controller(0).value, midi.controller(1).value);
	noStroke();
	fill(r + midi.controller(0).value, g + midi.controller(1).value, b + midi.controller(2).value);

	for (let i = 0; i < spectrum.length; i++){
		let x = map(i, 0, spectrum.length, 0, width);
	    let h = -height + map(spectrum[i], 0, 255, height, 0);
	    rect(x, height, width / spectrum.length, h);
	}

}