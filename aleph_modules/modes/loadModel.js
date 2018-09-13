let leftVolEased = .001, rightVolEased = .001, easing = 0.025; 
let scaler = .1;
let textures = [];

exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midi, leftVol, rightVol, assets) => {
	background(255);
 
	let targetL = leftVol * scaler;
	let distL = targetL - leftVolEased;
	leftVolEased += distL * easing;

	let targetR = rightVol * scaler;
	let distR = targetR - rightVolEased;
	rightVolEased += distR * easing;

	let volumeEased = leftVolEased + rightVolEased * .5;
	
	rotateY(frameCount * 0.01);
	scale(2, -2);

	stroke(map(volumeEased, 0, .025, 255, 0));
	fill(map(volume, 0, 1, 0, 255));

	// check if we've already packed the array so we don't keep adding to it
	if (textures.length < Object.keys(assets.textures).length){
		Object.keys(assets.textures).forEach((texture) => {
			// add each texture into the textures array so we can pull them at random
			textures.push(assets.textures[texture]);
		});
	}

	if (volume > .2){
		// randomly change the texture when the volume hits a certain threshold 
		// this is to illustrate how there's no latency when swapping textures
		// because all imported assets are preloaded into RAM on launch
		texture(textures[Math.floor(Math.random() * textures.length)]);
	}

	model(assets.models.floppy);
}