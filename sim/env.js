// --- SETUP ENVIRONMENT ---
let keys = {};
let mouse = {
    horizontal: 0,
    vertical: 0
};
const canvas = document.getElementById("canvas");
const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
gl.getExtension('WEBGL_depth_texture');
resizeCanvas();

// --- ADD EVENT LISTENERS ---
window.addEventListener("orientationchange", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("mousemove", function (event) {
    if (document.pointerLockElement === canvas) {
        mouse["horizontal"] = event.movementX;
        mouse["vertical"] = event.movementY;
    }
});
canvas.addEventListener("click", canvas.requestPointerLock);
canvas.addEventListener("keydown", function (event) { keys[event.key] = true; });
canvas.addEventListener("keyup", function (event) { keys[event.key] = false; });

// --- OBJECT MODEL MATRICIES ---
let cameraModelMatrix = modelMat4f(0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
let droneModelMatrix = modelMat4f(0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.01);
let sceneModelMatrix = modelMat4f(2.0, 0.0, 2.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
