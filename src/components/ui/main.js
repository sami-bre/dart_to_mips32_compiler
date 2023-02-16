let openFiles = [];
currentFileIndex = -1;

// the add file button
var addFileBtn = document.getElementById("add-file");
addFileBtn.addEventListener("click", chooseFile);

// the code editing area
var editArea = document.getElementById("edit-area");

// the tab-container
let tabContainer = document.getElementById("tab-container")

let fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.addEventListener("change", loadFile);

function chooseFile(e) {
  fileInput.click();
}

function loadFile(e) {
  let file = e.target.files[0];

  let reader = new FileReader();
  reader.readAsText(file);

  // when the readier finishes reading ...
  reader.onload = (readerEvent) => {
    let fileContent = readerEvent.target.result; // this is the content
    console.log(fileContent);
    // add the content to the array of files
    openFiles.push({ name: file.name, content: fileContent });
    // switch to the new file
    switchFile(openFiles.length - 1)
    console.log(openFiles.length)
  };
}

function switchFile(index) {
    currentFileIndex = index;
    editArea.textContent = openFiles[index].content;
    // add a new tab, select it, and render all the other tabs as unselected
    tabContainer.innerHTML = ""
    for(let i=0; i<openFiles.length; i++) {
        tabContainer.innerHTML += i == index 
        ? `<button class="text-white bg-gray-500 rounded-lg px-3 py-1 mr-1 hover:bg-gray-400" onclick="switchFile(${i})">${openFiles[i].name}</button>`
        : `<button class="text-gray-300 bg-gray-700 px-3 py-1 mr-1 hover:bg-gray-400" onclick="switchFile(${i})">${openFiles[i].name}</button>`
    }
}
