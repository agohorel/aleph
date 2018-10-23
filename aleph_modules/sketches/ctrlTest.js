exports.run = (audio, midi, assets) => {
	let r = map(midi.controller(1).value, 0, 127, 0, 255);
	let g = map(midi.controller(2).value, 0, 127, 0, 255);
	let b = map(midi.controller(3).value, 0, 127, 0, 255);
	let brightness = midi.controller(4).value;

	translate(-width/2, -height/2);
	rectMode(CENTER);
	
	background(r, g, b);

	fill(r + brightness, g + brightness, b + brightness);
	noStroke();
	rect(width/2, height/2, width/3, width/3);
}