// --- SETUP ENVIRONMENT ---
var keys = {};
var viewxz = 0;
var viewy = 0;
var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl");
resizeCanvas();

// --- ADD EVENT LISTENERS ---
window.addEventListener("orientationchange", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("mousemove", function (event) {
    if (document.pointerLockElement === canvas) { updatePosition(event); }
});
canvas.addEventListener("click", canvas.requestPointerLock);
canvas.addEventListener("keydown", function (event) { keys[event.key] = true; });
canvas.addEventListener("keyup", function (event) { keys[event.key] = false; });
