exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi) => {
	let r = bass, g = mid, b = high;

	background(midi.btn1, midi.cc1);
	noStroke();
	fill(r + midi.btn2, g + midi.btn3, b + midi.btn4);

	for (let i = 0; i < spectrum.length; i++){
		let x = map(i, 0, spectrum.length, 0, width);
	    let h = -height + map(spectrum[i], 0, 255, height, 0);
	    rect(x, height, width / spectrum.length, h);
	}

}