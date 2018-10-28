exports.run = (audio, midi, assets) => {
	console.log(midi);

	let r = map(midi[0].value, 0, 127, 0, 255);
	let g = map(midi[1].value, 0, 127, 0, 255);
	let b = map(midi[2].value, 0, 127, 0, 255);	


	let brightness = midi[3].value;

	translate(-width/2, -height/2);
	rectMode(CENTER);
	
	background(r, g, b);

	fill(r + brightness, g + brightness, b + brightness);
	noStroke();
	rect(width/2, height/2, width/3, width/3);
}