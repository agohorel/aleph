const uiIpc = electron.ipcRenderer;
let knobParams = {};

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
knobs[ 2 ].options( { type: "circular", min:  0, max:  2, step: 0.001, startFrom: 0, value: 1     } );
// high
knobs[ 3 ].options( { type: "circular", min:  0, max: 2, step: 0.001, startFrom: 0, value: 1      } );
// fft smoothing
knobs[ 4 ].options( { type: "circular", min:  0, max: .9, step: 0.001, startFrom: 0, value: .45   } );
// volume smoothing
knobs[ 5 ].options( { type: "circular", min:  0, max:.5, step: 0.001, startFrom: 0, value: 0.25   } );

knobs.forEach( ( knob, i ) => {
	document.querySelector( "#knob" + i ).append( knob.rootElement );
	knob.attached();
	knobParams[i] = knob._options.value;
	knob.oninput = (value) => {
		knobParams[i] = value;
		uiIpc.send("knobChanged", knobParams);
	}
} );