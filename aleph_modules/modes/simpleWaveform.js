exports.run = (audio, midi, assets) => {
	background(0);
	noFill();
	beginShape();
	stroke(audio.bass, audio.mid, audio.high);
	strokeWeight(audio.volume * 50);

	translate(-width/2, -height/2, 0);

	for (let i = 0; i< audio.waveform.length; i++){
		let x = map(i, 0, audio.waveform.length, 0, width);
		let y = map(audio.waveform[i], -1, 1, 0, height);
		vertex(x,y);
	}
	
	endShape();
}