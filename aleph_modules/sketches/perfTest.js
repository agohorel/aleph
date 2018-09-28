exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi) => {
	translate(-width/2, -height/2, 0);
	noStroke();

	for (let i = 0; i < 5000; i++){
		let x = random(width);
		let y = random(height);
		let xSize = random(300);
		let ySize = random(300);
		let col = random(255);
		fill(col);
		rect(x, y, xSize, ySize);
	}

	console.log(frameRate());
}