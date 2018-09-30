const knobs = [
	new gsuiSlider(),
	new gsuiSlider(),
	new gsuiSlider(),
	new gsuiSlider(),
	new gsuiSlider(),
	new gsuiSlider()
];

// volume 
knobs[ 0 ].options( { type: "circular", min:  0, max: 2, step: 0.001, startFrom: 0, value: 1      } );
// bass
knobs[ 1 ].options( { type: "circular", min:  0, max: 2, step: 0.001, startFrom: 0, value: 1      } );
// mid
knobs[ 2 ].options( { type: "circular", min: 0, max:  2, step: 0.001, startFrom: 0, value: 1      } );
// high
knobs[ 3 ].options( { type: "circular", min:  0, max: 2, step: 0.001, startFrom: 0, value: 1      } );
// fft smoothing
knobs[ 4 ].options( { type: "circular", min:  0, max: 2, step: 0.001, startFrom: 0, value: 1      } );
// volume smoothing
knobs[ 5 ].options( { type: "circular", min: .001, max:.5, step: 0.001, startFrom: 0, value: 0.25 } );

knobs.forEach( ( slider, i ) => {
	document.querySelector( "#knob" + i ).append( slider.rootElement );
	slider.attached();
} );