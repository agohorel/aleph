// this sketch illustrates how you can use MIDI controls to adjust parameters within your
// sketches. try adding addition controls to adjust other parameters! the location and/or
// size of the rect() could be a good place to start, but go nuts!

function draw() {
  // link RGB variables to first 3 midi controls & remap from 0-127 to 0-255
  let r = map(midi[0].value, 0, 127, 0, 255) || 0; // "|| 0" sets a default value if no midi controls exist to prevent errors
  let g = map(midi[1].value, 0, 127, 0, 255) || 0;
  let b = map(midi[2].value, 0, 127, 0, 255) || 0;
  // link brightness variable to fourth midi control
  let brightness = midi[3].value || 0;
  // change rectMode so the origin is in the center of the rect
  rectMode(CENTER);
  // set background to the color determined by midi controls 1-3
  background(r, g, b);
  // set fill to the color described above, modified by the brightness variable
  fill(r + brightness, g + brightness, b + brightness);
  // remove outlines
  noStroke();
  // draw square in the center, colored by the above fill()
  rect(width / 2, height / 2, width / 3, width / 3);
}

exports.run = () => {
  utils.render2D(state[path.basename(__filename)], setup, draw);
};
