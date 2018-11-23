exports.run = (audio, midi, assets) => {
	let r = audio.bass, g = audio.mid, b = audio.high;
	background(255);
	_2D.background(255 - volume * 255);
	_2D.noStroke();
	_2D.fill(r, g, b);

	for (let i = 0; i < audio.spectrum.length; i++){
		let x = map(i, 0, audio.spectrum.length, 0, width);
	    let h = -height + map(audio.spectrum[i], 0, 255, height, 0);
	    _2D.rect(x, height, width / audio.spectrum.length, h);
	}

	texture(_2D);
	
	if (second() % 2 === 0){
		rotateX(frameCount * 0.01);
		rotateY(frameCount * 0.01);
		rotateZ(frameCount * 0.01);
		noStroke();
		box(200);
	} else {
		rect(-width/2, -height/2, width, height);	
	}	
}