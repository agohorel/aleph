// this sketch illustrates how to load/display an existing 3D model and apply textures to it.

// initialize empty textures array
let textures = [];

function draw() {
  // set white background
  _3D.background(255);

  // rotate the model based on the smoothed volume (Y axis) and bass (X axis)
  _3D.rotateY(audio.volEased * 10);
  _3D.rotateX(audio.bass * 0.01);

  // set stroke color to the smoothed volume parameter
  _3D.stroke(map(audio.volEased, 0, 0.025, 255, 0));

  // scale everything up by 2x
  _3D.scale(2);

  // check if we've already packed the array so we don't keep adding to it
  if (textures.length < Object.keys(assets.images).length) {
    // loop through the textures object
    Object.keys(assets.images).forEach((texture) => {
      // add each texture into the textures array so we can pull them at random
      textures.push(assets.images[texture]);
    });
  }

  // randomly change the texture when the volume hits a certain threshold
  if (audio.volume > 0.2) {
    _3D.texture(textures[Math.floor(Math.random() * textures.length)]);
  }

  // display the 3D model
  _3D.model(assets.models.floppy);
}

exports.run = () => {
  utils.render3D(state[path.basename(__filename)], setup, _3D, draw, "reset");
};
