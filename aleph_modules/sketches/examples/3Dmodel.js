// this sketch illustrates how to load/display an existing 3D model and apply textures to it.

// initialize empty textures array
let textures = [];

function setup() {
  // loop through the textures object
  for (texture in assets.images) {
    // add each texture into the textures array so we can pull them at random
    textures.push(assets.images[texture]);
  }
}

function draw() {
  // set white background
  _3D.background(255);

  // rotate the model based on the smoothed volume (Y axis) and bass (X axis)
  _3D.rotateY(frameCount * 0.02);
  _3D.rotateX(frameCount * 0.01);

  // set stroke color to the smoothed volume parameter
  _3D.stroke(map(audio.volEased, 0, 0.25, 200, 0));

  // scale everything up by 2x
  _3D.scale(2);

  // randomly change the texture when the volume hits a certain threshold
  if (audio.volume > 0.4) {
    _3D.texture(textures[floor(random() * textures.length)]);
  }

  // display the 3D model
  _3D.model(assets.models.floppy);
}

exports.run = () => {
  utils.render3D(state[path.basename(__filename)], setup, _3D, draw, "reset");
};
