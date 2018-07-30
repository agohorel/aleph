const electron = require("electron");
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;
const fs = require('fs');

fs.readdir("./aleph_modules/modes", (err, files) => {
  if (err){
  	console.log(err);
  } else {
  	  files.forEach(file => {
	    let btn = document.createElement("BUTTON");
	    let text = document.createTextNode(file.substring(0, file.length-3));
	    btn.appendChild(text);
	    btn.classList.add("modeSelectButtons");
	    btn.addEventListener("click", () => {
	    	let modeSelectButtons = document.getElementsByClassName("modeSelectButtons");
	    	Array.from(modeSelectButtons).forEach(btn => btn.classList.toggle("active", ""));
			btn.classList.add("active");
	    	ipc.send("changeMode", text.data);
	    });
	    document.querySelector(".buttons").appendChild(btn);
	  });
  }
});

const midiDeviceHeader = document.querySelector("#midiDeviceHeader");

ipc.on("displayMidi", (event, arg) => {
	for (let i = 0; i < arg.length; i++){
		let btn = document.createElement("BUTTON");
		let text = document.createTextNode(arg[i]);
		btn.appendChild(text);
		btn.classList.add("midiDeviceButtons");
		btn.addEventListener("click", () => {
			ipc.send("selectMidiDevice", arg[i]);
			let deviceBtns = document.getElementsByClassName("midiDeviceButtons");
			Array.from(deviceBtns).forEach(btn => btn.remove());
			midiDeviceHeader.remove();
		});                              
		document.querySelector("#midiDeviceButtons").appendChild(btn);       
	}
});

const addMidiMap = document.querySelector("#addMidiMap");
let controlCount = 0;

addMidiMap.addEventListener("click", () => {	
	controlCount++;
	let btn = document.createElement("BUTTON");
	let text = document.createTextNode(controlCount);
	btn.appendChild(text);
	btn.classList.add("midiMapping");
	btn.id = controlCount;
	document.querySelector("#midiMapIcons").appendChild(btn);
});

const midiMappingButtons = document.querySelector("#midiMapIcons");

midiMappingButtons.addEventListener("click", function(e) {
	if (e.target.className === "midiMapping"){
		ipc.send("addMidiMapping", `controller${e.target.id}`);
	}	
});