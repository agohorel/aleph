const p5 = require("p5");
const p5_audio = require("p5/lib/addons/p5.sound.js");

exports.run = (fft, volume, bass, mid, high, spectrum) => {
	background(0);
	noStroke();
	fill(bass, mid, high);

	for (let i = 0; i < spectrum.length; i++){
		let x = map(i, 0, spectrum.length, 0, width);
	    let h = -height + map(spectrum[i], 0, 255, height, 0);
	    rect(x, height, width / spectrum.length, h);
	}

}