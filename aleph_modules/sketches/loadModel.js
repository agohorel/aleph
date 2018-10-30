// initialize empty textures array
let textures = [];

exports.run = (audio, midi, assets) => {
	// set white background
	background(255);
	
	// constantly rotate along Y axis
	rotateY(frameCount * 0.01);
	// double the size of the model, flipping it along the Y axis (note the negative number)
	scale(2, -2);
	// set stroke color to the smoothed volume parameter
	stroke(map(audio.volEased, 0, .025, 255, 0));
	// set fill color to the volume
	fill(map(audio.volume, 0, 1, 0, 255));

	// check if we've already packed the array so we don't keep adding to it
	if (textures.length < Object.keys(assets.textures).length){
		// loop through the textures object
		Object.keys(assets.textures).forEach((texture) => {
			// add each texture into the textures array so we can pull them at random
			textures.push(assets.textures[texture]);
		});
	}

	// randomly change the texture when the volume hits a certain threshold
	if (audio.volume > .2){ 
		texture(textures[Math.floor(Math.random() * textures.length)]);
	}
	// display the 3D model
	model(assets.models.floppy);
}