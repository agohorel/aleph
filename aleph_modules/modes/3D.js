let leftVolEased = .001, rightVolEased = .001, easing = 0.025; 
let scaler = .1;

exports.run = (audio, midi, assets) => {
	background(0);

	directionalLight(audio.bass, audio.mid * .5, audio.high, 1.5, .75, 0.25);
	directionalLight(audio.bass - 50, audio.mid * .5 - 50, audio.high - 50, 0, .4, 0.25);
	pointLight(audio.bass/2, 0, audio.high * 5, -225, -115, 200);
	pointLight(0, 0, audio.high * 5, 225, height - 115, 200);	

	specularMaterial(255);

	rotateX(frameCount * audio.leftVolEased * .5);
	rotateY(frameCount * audio.rightVolEased * .5);	
	rotateZ(frameCount * .01);	

	let size = audio.leftVolEased + audio.rightVolEased * 20000;
	box(size);
}
