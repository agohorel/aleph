// this sketch illustrates how to load/display an existing 3D model and apply textures to it.

let hasRun = {state: false};
let _3D;

// initialize empty textures array
let textures = [];
let dirX, dirY;

exports.run = (audio, midi, assets, utils) => {
	utils.renderLoop(hasRun, setup, _3D, draw);
}

function setup(){
	let sketch = utils.getSketchName(__filename);
	_3D = renderers[sketch];
	_3D.scale(2, -2);
}

function draw() {
	// set white background
	_3D.background(255);
	
	// constantly rotate along Y axis
	_3D.rotateY(frameCount * .01);
	_3D.rotateX(frameCount * .005);
	// double the size of the model, flipping it along the Y axis (note the negative number)
	
	// set stroke color to the smoothed volume parameter
	_3D.stroke(map(audio.volEased, 0, .025, 255, 0));

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
		_3D.texture(textures[Math.floor(Math.random() * textures.length)]);
	}

    dirX = (mouseX / width - 0.5) * 2;
    dirY = (mouseY / height - 0.5) * 2;
    let red = map(dirX, 0, 1, 0, 255);
    let green = map(dirY, 0, 1, 0, 255);
    let blue = map(dirX + dirY, 0, 2, 0, 255);
    col = color(red, green, blue);

    _3D.specularMaterial(200);
    _3D.directionalLight(col, -dirX, -dirY, 0.25);
    _3D.pointLight(255, 255, 255, dirX, dirY, 100);

	// display the 3D model
	_3D.model(assets.models.floppy);
}