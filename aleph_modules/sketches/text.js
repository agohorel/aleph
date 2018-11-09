exports.run = (audio, midi, assets) => {
  rotateX(frameCount * .003);
  rotateY(frameCount * .005);
  rotateZ(frameCount * .008);

  translate(-width/2, -height/2, 0);
  textAlign(CENTER);
  noStroke();
  fill(map(spectralCentroid, 0, 12000, 0, 255));
  textFont(assets.fonts.RobotoMono_Light);
  textSize(width/8 * volume);
  text('hello i am some text', width/2, height/2);
}