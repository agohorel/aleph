function draw() {
  let word;
  push();
  scale(10);

  if (second() % 2 === 0) {
    smooth();
    word = "antialiasing enabled (10x zoom)";
  } else {
    noSmooth();
    word = "antialiasing disabled (10x zoom)";
  }

  image(assets.textures.glitcht, 0, 0, width, height);
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
    height / 2 + 32
  );
}

exports.run = (audio, midi, assets, utils, state) => {
  utils.runOnce(state[path.basename(__filename)], setup);
  draw();
};
