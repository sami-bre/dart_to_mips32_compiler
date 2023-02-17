const compiler = import("compiler");
console.log(compiler);

const toggler = document.getElementById("sidebar-toggle");
const sidebar = document.getElementById("sidebar");
const compile = document.getElementById("compile");
const output = document.getElementById("output");
const input = document.getElementById("input");
const outputbar = document.getElementById("outputbar");
const mainWindow = document.getElementById("main-window");

const openFiles = [];

openFiles.push[]

toggler.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
    mainWindow.classList.toggle("w-4/5");
    mainWindow.classList.toggle("w-full");
})

compile.addEventListener("click", () => {
    if (input.value.length > 0) {
        output.value = compiler.translate(input.value);
    } else {
        input.focus();
    }
});