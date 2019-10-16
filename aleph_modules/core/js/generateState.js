const sketchesPath = path.resolve(__dirname, "../../sketches/");

function generateState() {
  let state = {};

  fs.readdir(sketchesPath, (err, files) => {
    if (err) {
      console.log(err);
    } else {
      files.forEach((file, i) => {
        state[file] = {
          key: i,
          state: false
        };
      });
    }
  });
  return state;
}

module.exports = generateState();
