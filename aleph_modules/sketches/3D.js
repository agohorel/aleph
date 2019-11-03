// this sketch illustrates p5's built-in 3D primitives box(), torus(), sphere(), cylinder(), and cone().
// it also makes use of p5's push/pop functions to apply transforms and styling to shapes individually.

function draw() {
  // set black background
  _3D.background(0);

  // create a variable for constant rotation
  let rotator = audio.volEased * 0.1;

  // rotate on all 3 axes
  _3D.rotateX(rotator);
  _3D.rotateY(rotator);
  _3D.rotateZ(rotator);

  // link size to eased (smoothed) volume
  let size = map(audio.volEased, 0, 1, 50, 1000);
  // link detailX to left channel volume, scale using map(), and cast to integer
  let detailX = int(map(audio.leftVol, 0, 1, 1, 24));
  // link detailY to right channel volume, scale using map(), and cast to integer
  let detailY = int(map(audio.rightVol, 0, 1, 1, 16));
  // scale detailX and detailY to the range supported by the p5 box() function
  let box_detailX = int(map(detailX, 1, 24, 1, 4));
  let box_detailY = int(map(detailY, 1, 16, 1, 4));
  // link color to volume and scale using map()
  let col = map(audio.volume, 0, 0.5, 20, 255);

  // set a normal material to the box
  _3D.normalMaterial();
  // draw a box
  _3D.box(size, size, size, box_detailX, box_detailY);

  // start new transform matrix
  _3D.push();
  // apply the desired styles to the objects within this push/pop
  applyStyles(col);
  // move the origin of the shape
  _3D.translate(-width / 3, 0);
  // draw the shape
  _3D.torus(size, size / 4, detailX, detailY);
  // close/reset transform matrix
  _3D.pop();

  _3D.push();
  applyStyles(col);
  _3D.translate(width / 3, 0);
  _3D.sphere(size, detailX, detailY);
  _3D.pop();

  _3D.push();
  applyStyles(col);
  _3D.translate(0, -height / 3);
  _3D.cylinder(size, size, detailX, detailY);
  _3D.pop();

  _3D.push();
  applyStyles(col);
  _3D.translate(0, height / 3);
  _3D.cone(size, size, detailX, detailY);
  _3D.pop();
}

// reusable function to reset styles in each push/pop
function applyStyles(color) {
  _3D.stroke(color);
  _3D.noFill();
}

exports.run = () => {
  utils.renderLoop(state[path.basename(__filename)], setup, _3D, draw);
};
