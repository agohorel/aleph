const s = [
	new gsuiSlider(),
	new gsuiSlider(),
	new gsuiSlider(),
	new gsuiSlider(),
	new gsuiSlider(),
	new gsuiSlider()
];

s[ 0 ].options( { type: "circular", min:  0, max: 100, step: 10,                    startFrom: 0, value: 33    } );
s[ 1 ].options( { type: "circular", min:  0, max: 100, step: 0.001, scrollStep: 10, startFrom: 0, value: 66    } );
s[ 2 ].options( { type: "circular", min: -1, max:   1, step: 0.001, scrollStep: .1, startFrom: 0, value: -0.33 } );
s[ 3 ].options( { type: "circular", min:  0, max: 100, step: 10,                    startFrom: 0, value: 33    } );
s[ 4 ].options( { type: "circular", min:  0, max: 100, step: 0.001, scrollStep: 10, startFrom: 0, value: 66    } );
s[ 5 ].options( { type: "circular", min: -1, max:   1, step: 0.001, scrollStep: .1, startFrom: 0, value: -0.33 } );

s.forEach( ( slider, i ) => {
	document.querySelector( "#sliderWrap" + i ).append( slider.rootElement );
	slider.attached();
} );