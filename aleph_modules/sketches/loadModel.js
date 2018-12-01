// this sketch illustrates how to load/display an existing 3D model and apply textures to it.

// initialize empty textures array
let textures = [];
let hasRun = false;
let dirX, dirY;
let r;

exports.run = (audio, midi, assets) => {
	if (!hasRun){
		r = renderers.loadModel;
		r.scale(2, -2);	
		hasRun = true;
	}
	
	r.push();

	// set white background
	r.background(255);
	
	// constantly rotate along Y axis
	r.rotateY(frameCount * .01);
	r.rotateX(frameCount * .005);
	// double the size of the model, flipping it along the Y axis (note the negative number)
	
	// set stroke color to the smoothed volume parameter
	r.stroke(map(audio.volEased, 0, .025, 255, 0));

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
		r.texture(textures[Math.floor(Math.random() * textures.length)]);
	}

    dirX = (mouseX / width - 0.5) * 2;
    dirY = (mouseY / height - 0.5) * 2;
    let red = map(dirX, 0, 1, 0, 255);
    let green = map(dirY, 0, 1, 0, 255);
    let blue = map(dirX + dirY, 0, 2, 0, 255);
    col = color(red, green, blue);

    r.specularMaterial(200);
    r.directionalLight(col, -dirX, -dirY, 0.25);
    r.pointLight(255, 255, 255, dirX, dirY, 100);

	// display the 3D model
	r.model(assets.models.floppy);
	image(r, 0, 0, width, height);

	r._renderer._update();
	r.pop();
}