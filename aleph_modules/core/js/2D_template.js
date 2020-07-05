function setup() {
  // code you only want to run ONCE
}

function draw() {
  // code you want to run every frame
}

exports.run = () => {
  utils.render2D(state[path.basename(__filename)], setup, draw);
};
