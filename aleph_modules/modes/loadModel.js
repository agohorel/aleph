let leftVolEased = .001, rightVolEased = .001, easing = 0.025; 
let scaler = .1;

exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi, leftVol, rightVol, models) => {
	background(0);

	let targetL = leftVol * scaler;
	let distL = targetL - leftVolEased;
	leftVolEased += distL * easing;

	let targetR = rightVol * scaler;
	let distR = targetR - rightVolEased;
	rightVolEased += distR * easing;

	let volumeEased = leftVolEased + rightVolEased * .5;

	rotateX(frameCount * leftVolEased * .5);
	rotateZ(frameCount * rightVolEased * .5);
	rotateY(frameCount * 0.01);

	stroke(map(volumeEased, 0, .025, 0, 255));
	fill(bass * .1, mid * .5, high * 255);
	
	model(models.floppy);
}