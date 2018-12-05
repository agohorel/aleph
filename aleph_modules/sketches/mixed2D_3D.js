let hasRun = {state: false};
let _3D;

exports.run = (audio, midi, assets, utils) => {
	utils.renderLoop(hasRun, setup, _3D, draw);
}

function setup(){
	let sketch = utils.getSketchName(__filename);
	_3D = renderers[sketch];
}

function draw() {
	let r = audio.bass, g = audio.mid, b = audio.high;
	_3D.background(255);
	_2D.background(255 - volume * 255);
	_2D.noStroke();
	_2D.fill(r, g, b);

	for (let i = 0; i < audio.spectrum.length; i++){
		let x = map(i, 0, audio.spectrum.length, 0, width);
	    let h = -height + map(audio.spectrum[i], 0, 255, height, 0);
	    _2D.rect(x, height, width / audio.spectrum.length, h);
	}

	_3D.texture(_2D);
	
	if (second() % 2 === 0){
		_3D.rotateX(frameCount * 0.01);
		_3D.rotateY(frameCount * 0.01);
		_3D.rotateZ(frameCount * 0.01);
		_3D.noStroke();
		_3D.box(200);
	} else {
		_3D.rect(-width/2, -height/2, width, height);	
	}	
}