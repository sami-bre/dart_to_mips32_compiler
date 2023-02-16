const toggler = document.getElementById("toggler");
const sidebar = document.getElementById("sidebar");
const output = document.getElementById("output");

toggler.addEventListener("click",  () => {
    sidebar.classList.toggle("hidden");
    output.classList.toggle("w-1/5");
    output.classList.toggle("w-2/5");
});