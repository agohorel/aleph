exports.run = (audio, midi, assets) => {
	let r = audio.bass, g = audio.mid, b = audio.high;
	
	_2D.size(windowWidth, windowHeight);
	_2D.background(255 - volume * 255);
	_2D.noStroke();
	_2D.fill(r, g, b);

	for (let i = 0; i < audio.spectrum.length; i++){
		let x = map(i, 0, audio.spectrum.length, 0, width);
	    let h = -height + map(audio.spectrum[i], 0, 255, height, 0);
	    _2D.rect(x, _2D.height, _2D.width / audio.spectrum.length, h);
	}

	background(255);
	texture(_2D);
	plane(_2D.width, _2D.height);
}