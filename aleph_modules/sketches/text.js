let hasRun = {state: false};
let _3D;

exports.run = (audio, midi, assets, utils) => {
  utils.renderLoop(hasRun, setup, _3D, draw);
}

function setup(){
  let sketch = utils.getSketchName(__filename);
  _3D = renderers[sketch];
  // put code you only want to run once here.
}

function draw() {
  _3D.rotateX(frameCount * .003);
  _3D.rotateY(frameCount * .005);
  _3D.rotateZ(frameCount * .008);

  _3D.translate(-width/2, -height/2, 0);
  _3D.textAlign(CENTER);
  _3D.noStroke();
  _3D.fill(map(audio.spectralCentroid, 0, 12000, 0, 255));
  _3D.textFont(assets.fonts.RobotoMono_Light);
  _3D.textSize(width/8 * audio.volume);
  _3D.text('hello i am some text', width/2, height/2);
}