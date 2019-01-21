const p5 = require("p5");
const uiIpc = electron.ipcRenderer;
const utils = require(path.resolve(__dirname, "../js/utils.js"));

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
knobs[0].options({ type: "circular", min: 0, max: 2, step: 0.001, startFrom: 0, value: 1});
// bass
knobs[1].options({ type: "circular", min: 0, max: 2, step: 0.001, startFrom: 0, value: 1});
// mid
knobs[2].options({ type: "circular", min: 0, max: 2, step: 0.001, startFrom: 0, value: 1});
// high
knobs[3].options({ type: "circular", min: 0, max: 2, step: 0.001, startFrom: 0, value: 1});
// fft smoothing
knobs[4].options({ type: "circular", min: 0, max: .9, step: 0.001, startFrom: 0, value: .45});
// volume smoothing
knobs[5].options({ type: "circular", min: 0, max: .5, step: 0.001, startFrom: 0, value: 0.25});

knobs.forEach((knob, i) => {
	document.querySelector("#knob" + i).append(knob.rootElement);
	knob.attached();
	knobParams[i] = knob._options.value;
	knob.oninput = (value) => {
		knobParams[i] = value;
		uiIpc.send("knobChanged", knobParams);
	}
	utils.makeDomElementWithId("BUTTON", "map", `mapAudioCtrl_${i}`,["audioCtrlsMapBtn"], "#knob" + i, false);
});

uiIpc.on("audioCtrlChanged", (event, args) => {
	for (let i = 0; i < args.length; i++){
		// not sure why i can't just use map()?
		let scaledInput = p5.prototype.map(args[i].value, 0, 127, knobs[i]._options.min, knobs[i]._options.max);
		// set the gsui element's value (controls appearance of svg elements)
		knobs[i].setValue(scaledInput);
		// set the knobParams object's value as well (controls the actual audio analysis)
		knobParams[i] = scaledInput;
	}
	// send updated params back to main process
	uiIpc.send("knobChanged", knobParams);
});