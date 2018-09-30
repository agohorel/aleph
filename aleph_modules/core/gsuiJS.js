const s = [
	new gsuiSlider(),
	new gsuiSlider(),
	new gsuiSlider(),
	new gsuiSlider(),
	new gsuiSlider(),
	new gsuiSlider()
];

// volume 
s[ 0 ].options( { type: "circular", min:  0, max: 2, step: 0.001, startFrom: 0, value: 1      } );
// bass
s[ 1 ].options( { type: "circular", min:  0, max: 2, step: 0.001, startFrom: 0, value: 1      } );
// mid
s[ 2 ].options( { type: "circular", min: 0, max:  2, step: 0.001, startFrom: 0, value: 1      } );
// high
s[ 3 ].options( { type: "circular", min:  0, max: 2, step: 0.001, startFrom: 0, value: 1      } );
// fft smoothing
s[ 4 ].options( { type: "circular", min:  0, max: 2, step: 0.001, startFrom: 0, value: 1      } );
// volume smoothing
s[ 5 ].options( { type: "circular", min: .001, max:.5, step: 0.001, startFrom: 0, value: 0.25 } );

s.forEach( ( slider, i ) => {
	document.querySelector( "#sliderWrap" + i ).append( slider.rootElement );
	slider.attached();
} );