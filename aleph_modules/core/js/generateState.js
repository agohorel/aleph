function generateState(path) {
  let state = {};

  fs.readdir(path, (err, files) => {
    if (err) {
      console.log(err);
    } else {
      files.forEach((file, i) => {
        state[file] = {
          key: i,
          state: false,
        };
      });
    }
  });
  return state;
}

module.exports = generateState;
