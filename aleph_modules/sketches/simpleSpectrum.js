exports.run = (audio, midi, assets) => {
	let r = audio.bass, g = audio.mid, b = audio.high;

	background(0);
	noStroke();
	fill(r, g, b);
	translate(-width/2, -height/2, 0);

	for (let i = 0; i < audio.spectrum.length; i++){
		let x = map(i, 0, audio.spectrum.length, 0, width);
	    let h = -height + map(audio.spectrum[i], 0, 255, height, 0);
	    rect(x, height, width / audio.spectrum.length, h);
	}

}