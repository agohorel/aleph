exports.runOnce = (hasRun, codeToRun) => {
  if (hasRun.state === false) {
    codeToRun();
    hasRun.state = true;
  }
};

exports.getSketchName = (myPath) => {
  return (sketch = path.basename(myPath, ".js"));
};

exports.update3D = (renderer, yourCode, reset) => {
  yourCode();
  reset ? renderer.reset() : null; // optionally reset transforms and lighting information each frame
};

exports.render3D = (hasRun, setup, renderer, draw, resetTransforms) => {
  module.exports.runOnce(hasRun, setup);
  module.exports.update3D(renderer, draw, resetTransforms);
  image(renderer, 0, 0, width, height);
};

exports.render2D = (hasRun, setup, draw) => {
  module.exports.runOnce(hasRun, setup);
  draw();
};

exports.makeDomElementWithId = (
  type,
  text,
  id,
  className,
  destParent,
  boolean
) => {
  let element = document.createElement(type);
  let displayText = document.createTextNode(text);
  element.appendChild(displayText);

  for (let i = 0; i < className.length; i++) {
    element.classList.add(className[i]);
  }

  element.id = id;
  element.disabled = boolean;
  document.querySelector(destParent).appendChild(element);
};

exports.scanAssets = (assetFolders, element) => {
  let assetList = "";
  assetFolders.forEach((folder) => {
    // filter out aleph system icons
    if (folder !== "icons") {
      assetList += `${folder}\n`.toUpperCase();
      let assets = fs.readdirSync(path.join(assetsPath, folder));

      assets.forEach((asset) => {
        // filter out font licenses
        if (!asset.toUpperCase().includes("LICENSE")) {
          assetList += `|__assets.${folder}.${
            asset.substring(0, asset.lastIndexOf(".")) || asset
          }\n`;
        }
      });
      assetList += "\n";
    }
  });

  element.innerText = assetList;
};

exports.makeDomElement = (type, text, className, destParent, boolean) => {
  let element = document.createElement(type);
  let displayText = document.createTextNode(text);
  element.appendChild(displayText);

  for (let i = 0; i < className.length; i++) {
    element.classList.add(className[i]);
  }

  element.id = text;
  element.disabled = boolean;
  document.querySelector(destParent).appendChild(element);
};

exports.highlightSelectedItem = (className, target) => {
  let selectedClass = document.querySelectorAll(className);
  Array.from(selectedClass).forEach((item) =>
    item.classList.toggle("active", "")
  );
  target.classList.add("active");
};

exports.importFileDialog = (filetype) => {
  dialog.showOpenDialog(
    {
      filters: [utils.applyFiletypeFilter(filetype)],
      properties: ["openFile", "multiSelections"],
    },
    (files) => {
      if (files === undefined) return;
      utils.copySelectedFiles(files, path.resolve(assetsPath, filetype));
    }
  );
};

exports.applyFiletypeFilter = (filetype) => {
  let filter = {};
  if (filetype === "3d" || filetype === "obj" || filetype === "models") {
    filter.name = filetype;
    filter.extensions = ["obj"];
    return filter;
  } else if (filetype === "textures" || filetype === "images") {
    filter.name = "Image";
    filter.extensions = ["jpg", "png", "gif", "tif", "bmp"];
    return filter;
  } else if (filetype === "js") {
    filter.name = "Javascript";
    filter.extensions = ["js"];
    return filter;
  } else if (filetype === "fonts") {
    filter.name = "Fonts";
    filter.extensions = ["ttf", "otf"];
    return filter;
  } else if (filetype === "shaders") {
    filter.name = "Shaders";
    filter.extensions = ["frag", "vert"];
    return filter;
  } else if (filetype === "json") {
    filter.name = "json";
    filter.extensions = ["json"];
    return filter;
  } else if (filetype === "videos") {
    filter.name = "videos";
    filter.extensions = ["mp4", "ogg", "webm", "mov"];
    return filter;
  }
};

exports.copySelectedFiles = (selectedFiles, destination) => {
  const assetFolders = fs.readdirSync(assetsPath);
  const assetsDisplay = document.querySelector("#availableAssets");
  for (let i = 0; i < selectedFiles.length; i++) {
    // strip filename off path
    let filename = path.parse(selectedFiles[i]).base.replace(/[- ]/g, "_");
    fs.copyFile(selectedFiles[i], path.join(destination, filename), (err) => {
      if (err) throw err;
      console.log(
        `${selectedFiles[i]} copied to ${path.join(destination, filename)}`
      );
      utils.scanAssets(assetFolders, assetsDisplay);
    });
  }
};

exports.newSketchDialog = (type, sketchesPath) => {
  dialog.showSaveDialog(
    {
      defaultPath: sketchesPath,
      title: "Save New Sketch As",
      filters: [utils.applyFiletypeFilter("js")],
    },
    (sketchPath) => {
      if (sketchPath === undefined) return;
      let sketchName = path.parse(sketchPath).base;
      utils.copySketchTemplate(sketchName, type);
    }
  );
};

exports.copySketchTemplate = (name, type) => {
  let srcPath;
  if (type === "2D") {
    srcPath = path.resolve(__dirname, "../js/2D_template.js");
  }

  if (type === "3D") {
    srcPath = path.resolve(__dirname, "../js/3D_template.js");
  }

  fs.copyFile(srcPath, path.join(sketchesPath, name), (err) => {
    if (err) throw err;
    console.log(`created new sketch "${name}"`);
    utils.appendNewSketchBtn(name.substring(0, name.lastIndexOf(".")));
  });
};

exports.appendNewSketchBtn = (newSketch) => {
  let bool = true;
  let sketchBtn = document.querySelector(".sketchSelectButton");
  // if existing buttons are disabled, bool = true (btn is created in disabled state)
  if (sketchBtn.disabled === true) {
    bool = true;
  } else {
    bool = false;
  }
  utils.makeDomElement(
    "BUTTON",
    newSketch,
    ["sketchSelectButton", "btn"],
    "#sketchSelectorButtons",
    bool
  );
};

exports.saveMidiDialog = (mappingsPath, array) => {
  dialog.showSaveDialog(
    {
      defaultPath: mappingsPath,
      title: "Save Mapping File As",
      filters: [utils.applyFiletypeFilter("json")],
    },
    (filePath) => {
      if (filePath === undefined) return;
      let fileName = path.parse(filePath).base;
      fs.writeFile(
        path.join(mappingsPath, fileName),
        JSON.stringify(array, null, 2),
        (err) => {
          if (err) throw err;
          // send msg to main process to trigger UI save indicator
          ipc.send("midiSaved");
        }
      );
    }
  );
};

exports.loadMidiDialog = (
  mappingsPath,
  midiMappings,
  audioCtrlMappings,
  sketchCtrlMappings,
  displayOutputMappings
) => {
  dialog.showOpenDialog(
    {
      defaultPath: mappingsPath,
      filters: [utils.applyFiletypeFilter("json")],
      properties: ["openFile"],
    },
    (filePath) => {
      if (filePath === undefined) return;

      fs.readFile(filePath[0], "utf-8", (err, data) => {
        if (err) throw err;
        let obj = JSON.parse(data);
        // loop through entire mappings object
        for (let i = 0; i < obj.length; i++) {
          // check if we're dealing w/ the "default" midi controls, or the "audioCtrls" (i.e. the UI knobs)
          if (obj[i].name.indexOf("controller") > -1) {
            midiMappings.push(obj[i]);
          } else if (obj[i].name.indexOf("knob") > -1) {
            audioCtrlMappings.push(obj[i]);
          } else if (obj[i].name.indexOf("display")) {
            displayOutputMappings.push(obj[i]);
          } else {
            sketchCtrlMappings.push(obj[i]);
          }
        }
      });
      // send msg to main process to trigger UI save indicator
      ipc.send("midiLoaded");
    }
  );
};

exports.renderGif = (pathToGif, options) => {
  let gifID = path.basename(pathToGif);
  gifID = gifID.substring(0, gifID.lastIndexOf("."));
  const img = document.querySelector(`#${gifID}`);

  if (!document.getElementsByTagName("img").length) {
    gif = createImg(pathToGif);
    gif.id(gifID);
  }

  if (options && options.scale) {
    img.style.transform = `scale(${options.scale})`;
  }

  if (options && options.filters) {
    let filterString = "";

    options.filters.forEach((filter) => {
      filterString += `${filter.name}(${filter.amount}) `;
      img.style.filter = filterString;
    });
  }

  if (options && options.x && options.y) {
    gif.position(options.x - gif.width * 0.5, options.y - gif.height * 0.5);
  } else {
    // default to center of canvas
    gif.position(width * 0.5 - gif.width * 0.5, height * 0.5 - gif.height / 2);
  }
};
