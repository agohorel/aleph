let gif;

function setup() {
  gif = createImg(assets.textures.glitchdotcool.path);
}

function draw() {
  // call gif.position and pass in X/Y coords if you want arbitrary placement
  gif.position(mouseX, mouseY);

  // or use built-in util for centering
  // utils.centerGif(gif);
}

exports.run = () => {
  utils.runOnce(state[path.basename(__filename)], setup);
  draw();
};
