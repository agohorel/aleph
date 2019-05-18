const p5 = require("p5");
const p5_audio = require("p5/lib/addons/p5.sound.js");

let input, amplitude, fft;
let audioParams = { 0: 1, 1: 1, 2: 1, 3: 1, 4: .45, 5: 0.25 }; // initial values for audioParams object
let volEased = .001, leftVolEased = .001, rightVolEased = .001; // initial values for smoothing

ipc.on("knobChanged", (event, arg) => {
    audioParams = arg;
});

function setup(){
    input = new p5.AudioIn();
    // input.getSources((devices) => {
    // 	console.log(devices);
    // });
    // input.setSource(5);
    input.start();

    amplitude = new p5.Amplitude();
    amplitude.setInput(input);
    
    fft = new p5.FFT();
    fft.setInput(input);
}

function draw(){
    ipc.send("updateAudio", analyzeAudio());
}

function analyzeAudio() {
    let volume = clamp(amplitude.getLevel() * audioParams[0], 0, 1);
    let leftVol = clamp(amplitude.getLevel(0) * audioParams[0], 0, 1);
    let rightVol = clamp(amplitude.getLevel(1) * audioParams[0], 0, 1);
    let spectrum = fft.analyze();
    let waveform = fft.waveform();
    let bass = clamp(fft.getEnergy("bass") * audioParams[1], 0, 255);
    let mid = clamp(fft.getEnergy("mid") * audioParams[2], 0, 255);
    let high = clamp(fft.getEnergy("treble") * audioParams[3], 0, 255);
    let spectralCentroid = fft.getCentroid();
    fft.smooth(audioParams[4]);
    smoother(volume, leftVol, rightVol, .5 - audioParams[5]);
    return audio = {
        fft, 
        volume, 
        leftVol, 
        rightVol, 
        spectrum, 
        waveform,
        bass, 
        mid, 
        high, 
        spectralCentroid,
        volEased, 
        leftVolEased, 
        rightVolEased
    };
}

function smoother(volume, leftVol, rightVol, easing) {
    let target = volume;
    let diff = target - volEased;
    volEased += diff * easing;

    let targetL = leftVol;
    let diffL = targetL - leftVolEased;
    leftVolEased += diffL * easing;

    let targetR = rightVol;
    let diffR = targetR - rightVolEased;
    rightVolEased += diffR * easing;
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(val, max));
}