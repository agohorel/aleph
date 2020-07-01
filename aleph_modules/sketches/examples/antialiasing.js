function draw() {
  background(0);
  let word =
    "try toggling the antialiasing checkbox \nin the editor to see the effect.";
  push();
  scale(10);
  image(assets.images.glitcht, 0, 0, width / 2, height / 2);
  pop();

  fill(18, 228, 166);
  noStroke();
  textSize(36);
  textAlign(CENTER, CENTER);
  text(word, width / 2, height / 2);
  textSize(24);
  fill(0, 180, 246);
  text(
    "note: this only applies to resizing images",
    width / 2,
    height / 2 + 70
  );
}

exports.run = () => {
  utils.render2D(state[path.basename(__filename)], setup, draw);
};
