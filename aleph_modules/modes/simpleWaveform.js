exports.run = (fft, volume, bass, mid, high, spectrum, waveform) => {
	background(0);
	noFill();
	beginShape();
	stroke(bass, mid, high);
	strokeWeight(volume * 50);

	for (let i = 0; i< waveform.length; i++){
		let x = map(i, 0, waveform.length, 0, width);
		let y = map(waveform[i], -1, 1, 0, height);
		vertex(x,y);
	}
	
	endShape();
}