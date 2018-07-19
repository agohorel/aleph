const electron = require("electron");
const BrowserWindow = electron.remote.BrowserWindow;

let newWindow = document.querySelector("#newWindow")
	.addEventListener("click", function(event){
		console.log("clicked!");
		let win2 = new BrowserWindow({width: 400, height: 300});
		win2.show();
	});