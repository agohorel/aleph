let leftVolEased = 1, rightVolEased = 1, easing = 0.05; 
let scale = .1;

exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi, leftVol, rightVol) => {
	background(0);
	
	let targetL = leftVol * scale;
	let distL = targetL - leftVolEased;
	leftVolEased += distL * easing;

	let targetR = rightVol * scale;
	let distR = targetR - rightVolEased;
	rightVolEased += distR * easing;

	let dirX = (mouseX / width - 0.5) * 2;
	let dirY = (mouseY / height - 0.5) * 2;

	directionalLight(bass, mid, high, 1.5, .75, 0.25);
	directionalLight(bass - 50, mid - 50, high - 50, 0, .4, 0.25);
	ambientMaterial(250);

	rotateX(frameCount * leftVolEased * .5);
	rotateY(frameCount * rightVolEased * .5);
	
	stroke(255);
	strokeWeight(map(volume, 0, 1, 1, 5));

	let size = leftVolEased + rightVolEased * 30000;
	box(size);
}
