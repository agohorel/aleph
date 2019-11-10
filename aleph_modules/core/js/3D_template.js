function setup() {
  // code you only want to run ONCE
}

function draw() {
  // code you want to run every frame
}

exports.run = () => {
  utils.renderLoop(state[path.basename(__filename)], setup, _3D, draw, "reset");
};
