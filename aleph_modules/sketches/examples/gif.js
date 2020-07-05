let pathToGif;

function setup() {
  // to render the gif, we'll need to access it's file path
  pathToGif = assets.images.wave.path;
}

function draw() {
  // in it's simplest form you can simply pass a path to a gif.
  // by default it will be placed in the center of the screen.
  // utils.renderGif(pathToGif);

  // but you can pass in an options object for optional:
  // x,y placement (relative to center of gif)
  // scale (scales x,y uniformly, where 1 = 100% = normal size)
  // and an array of objects representing standard CSS filters:
  // https://developer.mozilla.org/en-US/docs/Web/CSS/filter

  utils.renderGif(pathToGif, {
    x: mouseX,
    y: mouseY,
    scale: map(mouseY, 0, height, 0.5, 2),
    filters: [
      {
        name: "sepia",
        amount: map(mouseX, 0, width, 0, 1),
      },
      {
        name: "hue-rotate",
        amount: `${map(mouseY, 0, height, 0, 360)}deg`,
      },
    ],
  });
}

exports.run = () => {
  utils.render2D(state[path.basename(__filename)], setup, draw);
};
