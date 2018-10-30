exports.run = (audio, midi, assets) => {
	// set black background
	background(0);
	
	// create a variable for constant rotation
	let rotator = frameCount * .005;	

	// rotate on all 3 axes 
	rotateX(rotator);
	rotateY(rotator);	
	rotateZ(rotator);

	// link size to eased (smoothed) volume
	let size = map(audio.volEased, 0, 1, 50, 1000);
	// link detailX to left channel volume, scale using map(), and cast to integer
	let detailX = int(map(audio.leftVol, 0, 1, 1, 24));
	// link detailY to right channel volume, scale using map(), and cast to integer
	let detailY = int(map(audio.rightVol, 0, 1, 1, 16));
	// scale detailX and detailY to the range supported by the p5 box() function
	let box_detailX = int(map(detailX, 1, 24, 1, 4));
	let box_detailY = int(map(detailY, 1, 16, 1, 4));
	// link color to volume and scale using map()
	let col = map(audio.volume, 0, 1, 50, 255);

	// set a normal material to the box
	normalMaterial();
	// draw a box
	box(size, size, size, box_detailX, box_detailY);

	// start new transform matrix
	push();
	// apply the desired styles to the objects within this push/pop
	applyStyles(col);
	// move the origin of the shape
	translate(-width/3, 0);
	// draw the shape
	torus(size, size/4, detailX, detailY);
	// close/reset transform matrix
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

// reusable function to reset styles in each push/pop
function applyStyles(color){
	stroke(color);
	noFill();
}