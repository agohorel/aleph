let leftVolEased = .001, rightVolEased = .001, easing = 0.025; 
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

	directionalLight(bass, mid * .5, high, 1.5, .75, 0.25);
	directionalLight(bass - 50, mid * .5 - 50, high - 50, 0, .4, 0.25);
	pointLight(bass/2, 0, high * 5, -225, -115, 200);
	pointLight(0, 0, high * 5, 225, height - 115, 200);	

	specularMaterial(255);

	rotateX(frameCount * leftVolEased * .5);
	rotateY(frameCount * rightVolEased * .5);	
	rotateZ(frameCount * .01);	

	let size = leftVolEased + rightVolEased * 20000;
	box(size);
}
