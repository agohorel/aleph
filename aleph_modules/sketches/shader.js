let yEased = .001;

exports.run = (audio, midi, assets) => {
	shader(assets.shaders.shd);
	assets.shaders.shd.setUniform('p', [-0.74364388703, 0.13182590421]);
	smoother(mouseY, 0.1);
	assets.shaders.shd.setUniform('s', map(yEased, 0, height, 2, 6));
	assets.shaders.shd.setUniform('r', map(yEased, 0, height, 0.00001, 25));
	// plane(width, height);
	box(256);
}

function smoother(val, easing){
	let scaler = 0.1;

	let targetVal = val * scaler;
	let diff = targetVal - yEased;
	yEased += diff * easing;
}