// this sketch illustrates how to load/display an existing 3D model and apply textures to it.

let hasRun = {state: false};

// initialize empty textures array
let textures = [];

exports.run = (audio, midi, assets, utils) => {
	utils.renderLoop(hasRun, setup, _3D, draw);
}

function setup() {
	// scale everything up by 2x
	_3D.scale(2);
}
 
function draw() {
	// set white background
	_3D.background(255);

	// rotate the model based on the smoothed volume (Y axis) and bass (X axis)
	_3D.rotateY(audio.volEased * 0.075);
	_3D.rotateX(audio.bass * 0.001);

	// set stroke color to the smoothed volume parameter
	_3D.stroke(map(audio.volEased, 0, .025, 255, 0));

	// check if we've already packed the array so we don't keep adding to it
	if (textures.length < Object.keys(assets.textures).length) {
		// loop through the textures object
		Object.keys(assets.textures).forEach((texture) => {
			// add each texture into the textures array so we can pull them at random
			textures.push(assets.textures[texture]);
		});
	}

	// randomly change the texture when the volume hits a certain threshold
	if (audio.volume > .2) {
		_3D.texture(textures[Math.floor(Math.random() * textures.length)]);
	}

	// display the 3D model
	_3D.model(assets.models.floppy);
}