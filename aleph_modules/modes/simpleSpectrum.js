exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, ccObj, noteObj) => {
	let r = bass, g = mid, b = high, colorMod;
	colorMod = ccObj.value;

	background(0, colorMod);
	noStroke();
	fill(r + colorMod, g + colorMod, b + colorMod);

	for (let i = 0; i < spectrum.length; i++){
		let x = map(i, 0, spectrum.length, 0, width);
	    let h = -height + map(spectrum[i], 0, 255, height, 0);
	    rect(x, height, width / spectrum.length, h);
	}

}