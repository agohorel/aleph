function draw() {
  _3D.rotateX(frameCount * 0.003);
  _3D.rotateY(frameCount * 0.005);
  _3D.rotateZ(frameCount * 0.008);

  _3D.translate(-width / 2, -height / 2, 0);
  _3D.textAlign(CENTER);
  _3D.noStroke();
  _3D.fill(map(audio.spectralCentroid, 0, 12000, 0, 255));
  _3D.textFont(assets.fonts.RobotoMono_Light);
  _3D.textSize((width / 8) * audio.volume);
  _3D.text("hello i am some text", width / 2, height / 2);
}

exports.run = () => {
  utils.render3D(state[path.basename(__filename)], setup, _3D, draw, "reset");
};
