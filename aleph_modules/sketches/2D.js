exports.run = (audio, midi, assets) => {
	_2D.rectMode(CENTER);
	_2D.fill(255, 0, 0);
	_2D.background(0, 100, 0);
	_2D.rect(0, 0, 200, 200);
	texture(_2D);
	plane(width, height);
}