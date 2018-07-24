// let opacity = 255;
// let knob1 = 0, knob2 = 0;

exports.run = (fft, volume, bass, mid, high, spectrum, waveform, spectralCentroid, midiControls) => {
	let r = bass, g = mid, b = high, colorMod;

	// switch (ccObj.controller){
	// 	case 21:
	// 		knob1 = ccObj.value; 
	// 		colorMod = knob1;
	// 		console.log(`\n\n knob1 = ${knob1}, knob2 = ${knob2}.`);
	// 		console.log(`\n\n colorMod = ${colorMod}, opacity = ${opacity}`);
	//     break;
	//     case 22: 
	//     	knob2 = map(ccObj.value, 0, 127, 0, 255);
	//     	opacity = knob2;
	//     	console.log(`\n\n knob1 = ${knob1}, knob2 = ${knob2}.`);
	//     	console.log(`\n\n colorMod = ${colorMod}, opacity = ${opacity}`);
 //        break;
	// }

	// colorMod = ccObj.value;

	// type: CC 
	// channel 8
	// controller: 21-28, 41-48

	background(0, midiControls.knob1);
	noStroke();
	fill(r, g, b + midiControls.knob2);

	for (let i = 0; i < spectrum.length; i++){
		let x = map(i, 0, spectrum.length, 0, width);
	    let h = -height + map(spectrum[i], 0, 255, height, 0);
	    rect(x, height, width / spectrum.length, h);
	}

}