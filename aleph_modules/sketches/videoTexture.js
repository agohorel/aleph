let video;

function setup() {
  // videos are accessible in aleph's assets object
  video = assets.videos.dots;
  // start looping the video (otherwise it will be paused)
  video.loop();
}

function draw() {
  _3D.background(0);
  _3D.rotateY(frameCount * 0.02);
  _3D.scale(-3);
  // assign the video as a texture, which can be applied to 3D primitives, custom 3D shapes, or in this case an imported 3D model
  _3D.texture(video);
  _3D.model(assets.models.floppy);
}

exports.run = () => {
  utils.renderLoop(state[path.basename(__filename)], setup, _3D, draw, "reset");
};
