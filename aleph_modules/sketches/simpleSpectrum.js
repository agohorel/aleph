// this sketch illustrates how we can loop through the audio spectrum (frequency domain) data  
// to construct our own custom spectrums using p5's 2D primitives, in this case rect(). 
// try swapping rect() out for a different shape (arc, ellipse, line, point, quad, or triangle).

exports.run = (audio, midi, assets) => {
	// create color variables based on frequency content 
	let r = audio.bass, g = audio.mid, b = audio.high;

	// set black background
	background(0);
	// remove outlines
	noStroke();
	// set fill color to our color-coded variables from above
	fill(r, g, b);
	// transate 0, 0 point (origin) to top left corner of screen
	translate(-width/2, -height/2, 0);

	// loop through the audio.spectrum array one slice at a time 
	for (let i = 0; i < audio.spectrum.length; i++){
		// grab x coord and scale it based on screen width using p5's map()
		let x = map(i, 0, audio.spectrum.length, 0, width);
		// grab x coord and scale it based on screen height using p5's map()
	    let h = -height + map(audio.spectrum[i], 0, 255, height, 0);
	    // draw a rectangle for each slice of the spectrum at x, h coords
	    rect(x, height, width / audio.spectrum.length, h);
	}
}