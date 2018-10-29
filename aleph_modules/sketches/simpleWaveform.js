exports.run = (audio, midi, assets) => {
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

	// translate 0,0 point (origin) to top left of screen
	translate(-width/2, -height/2, 0);

	// loop through audio waveform array one slice at a time
	for (let i = 0; i< audio.waveform.length; i++){
		// grab x coord and scale by screen width using p5's map()
		let x = map(i, 0, audio.waveform.length, 0, width);
		// grab y coord and scale by screen height using p5's map()
		let y = map(audio.waveform[i], -1, 1, 0, height);
		// add a vertex to our custom shape using the above coords
		vertex(x,y);
	}
	// close the custom shape once the loop has terminated
	endShape();
}