// this sketch illustrates a signal's spectral centroid, which indicates where the 
// "center of mass" of the spectrum is located. perceptually, it has a connection  
// with the impression of "brightness" of a sound.

let centroidplot = 0.0;
let spectralCentroid = 0;

exports.run = (audio, midi, assets) => {
	background(0);
	stroke(0,255,0);
	strokeWeight(1);
	fill(0,255,0); // spectrum is green

	translate(-width/2, -height/2, 0);

	//draw the spectrum
	for (let i = 0; i < audio.spectrum.length; i+=2){
		// grab x coord and scale it based on screen width using p5's map()
		let x = map(i, 0, audio.spectrum.length, 0, width);
		// grab x coord and scale it based on screen height using p5's map()
	    let h = -height + map(audio.spectrum[i], 0, 255, height, 0);
	    // draw a rectangle for each slice of the spectrum at x, h coords
	    rect(x, height, width / audio.spectrum.length, h);
	}

	let nyquist = 22050;
	spectralCentroid = audio.spectralCentroid;

	// the mean_freq_index calculation is for the display.
	let mean_freq_index = spectralCentroid/(nyquist/audio.spectrum.length);

	centroidplot = map(log(mean_freq_index), 0, log(audio.spectrum.length), 0, width);

	stroke(255,0,0); // the line showing where the centroid is will be red
	rect(centroidplot, 0, width / spectrum.length, height);

	noStroke();
	fill(255);  
	textSize(32);
	// textAlign(LEFT);
  	textFont(assets.fonts.RobotoMono_Medium);
	text(`centroid: ${round(spectralCentroid)} Hz`, 10, 40);
}