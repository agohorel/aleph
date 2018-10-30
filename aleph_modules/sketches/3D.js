exports.run = (audio, midi, assets) => {
	// set black background
	background(0);
	
	// 
	let rotator = frameCount * .005;	

	rotateX(rotator);
	rotateY(rotator);	
	rotateZ(rotator);

	let size = map(audio.volEased, 0, 1, 50, 1000);
	let detailX = int(map(audio.leftVol, 0, 1, 1, 24));
	let detailY = int(map(audio.rightVol, 0, 1, 1, 16));
	let cube_detailX = int(map(detailX, 1, 24, 1, 4));
	let cube_detailY = int(map(detailY, 1, 16, 1, 4));
	let col = map(audio.volume, 0, 1, 50, 255);

	normalMaterial();
	box(size, size, size, cube_detailX, cube_detailY);

	push();
	applyStyles(col);
	translate(-width/3, 0);
	torus(size, size/4, detailX, detailY);
	pop();
	
	push();
	applyStyles(col);
	translate(width/3, 0);
	sphere(size, detailX, detailY);
	pop();

	push();
	applyStyles(col);
	translate(0, -height/3);
	cylinder(size, size, detailX, detailY);
	pop();

	push();
	applyStyles(col);
	translate(0, height/3);
	cone(size, size, detailX, detailY);
	pop();
}

function applyStyles(color){
	stroke(color);
	noFill();
}