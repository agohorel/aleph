let video;

function setup() {
  // videos are accessible in aleph's assets object
  video = assets.videos.dots;
  // start looping the video (otherwise it will be paused)
  video.loop();
}

function draw() {
  // display the video by passing it into image(source, x, y, width, height)
  image(video, width / 2, 0, width / 2, height / 2);
  image(video, 0, height / 2, width / 2, height / 2);
  // we can use p5's built-in filter's to effect the video
  filter(INVERT);
  // we can pass the same video source into multiple things - here image() again, but with a different set of coordinates
  image(video, width / 2, height / 2, width / 2, height / 2);
  image(video, 0, 0, width / 2, height / 2);
}

exports.run = () => {
  utils.render2D(state[path.basename(__filename)], setup, draw);
};
