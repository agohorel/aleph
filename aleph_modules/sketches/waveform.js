// this sketch illustrates how we can loop through the audio waveform (time domain) data
// to construct our own custom waveforms using p5's custom shape functions
// beginShape(), vertex(), and endShape().

function draw() {
  // set black background
  background(0);
  // remove color fills from shapes
  noFill();
  // open custom shape
  beginShape();
  // color-code outline color (stroke) to be based on frequency content
  stroke(audio.bass, audio.mid, audio.high);
  // set outline thickness (strokeWeight) based on volume
  strokeWeight(audio.volume * 50);

  // loop through audio waveform array one slice at a time
  for (let i = 0; i < audio.waveform.length; i++) {
    // grab x coord and scale by screen width using p5's map()
    let x = map(i, 0, audio.waveform.length, 0, width);
    // grab y coord and scale by screen height using p5's map()
    let y = map(audio.waveform[i], -1, 1, 0, height);
    // add a vertex to our custom shape using the above coords
    vertex(x, y);
  }
  // close the custom shape once the loop has terminated
  endShape();
}

exports.run = (audio, midi, assets, utils, state) => {
  utils.runOnce(state[path.basename(__filename)], setup);
  draw();
};
