exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi) => {

	for (let i = 0; i < 10000; i++){
		let x = random(width);
		let y = random(height);
		let xSize = random(300);
		let ySize = random(300);
		let col = random(255);
		fill(col);
		rect(x, y, xSize, ySize);
	}

	if (frameRate() < 30){
		fill(255, 0, 0);
	} 
	else if (frameRate() > 30 && frameRate()< 60){
		fill(244, 149, 66);
	} else {
		fill(0, 255, 0);
	}

	noStroke();
	textSize(40);
	text(frameRate(), 10, 40);
}