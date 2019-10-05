let keysPressed = [],
  isFullScreen = false;

window.addEventListener(
  "keydown",
  event => {
    if (!keysPressed.includes(event.key)) {
      keysPressed.push(event.key);
    }
    checkFullScreenCommand(keysPressed);
  },
  true
);

// delete keysPressed after small delay
window.addEventListener(
  "keyup",
  () => {
    if (keysPressed.length) {
      setTimeout(() => {
        keysPressed = [];
      }, 100);
    }
  },
  true
);

function checkFullScreenCommand(keysPressed) {
  if (
    (keysPressed.includes("Control") && keysPressed.includes("f")) ||
    keysPressed.includes("F")
  ) {
    if (!isFullScreen) {
      document.documentElement.webkitRequestFullscreen();
      isFullScreen = true;
    } else {
      document.webkitExitFullscreen();
      isFullScreen = false;
    }
  }
}
