let yEased = .001;

exports.run = (audio, midi, assets) => {
	smoother(mouseY, 0.1);
	shader(assets.shaders.shd);
	assets.shaders.shd.setUniform('p', [-0.74364388703, 0.13182590421]);
	assets.shaders.shd.setUniform('r', map(yEased, 0, height, 0.001, 50));
	plane(width, height);
}

function smoother(val, easing){
	let scaler = 0.1;

	let targetVal = val * scaler;
	let diff = targetVal - yEased;
	yEased += diff * easing;
}