// --- SHADER CODE ---
const vertexshadersource = `
    precision highp float;

    attribute vec4 vertexposition;
    attribute vec2 texturecoordinate;
    uniform mat4 modelmatrix;
    uniform mat4 viewmatrix;
    uniform mat4 projectionmatrix;

    varying vec2 o_texturecoordinate;

    void main(){
        o_texturecoordinate = texturecoordinate;
        gl_Position = projectionmatrix * viewmatrix * modelmatrix * vertexposition;
    }
`;

const fragmentshadersource = `
    precision highp float;

    uniform sampler2D texture;

    varying vec2 o_texturecoordinate;

    void main(){
        gl_FragColor = texture2D(texture, o_texturecoordinate);
    }
`;

// --- MAKE SHADERS AND PROGRAM ---
const program = createAndUseProgram(gl, vertexshadersource, fragmentshadersource);

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attribLocations = getAttribLocations(gl, program, ["vertexposition", "texturecoordinate"]);
const uniformLocations = getUniformLocations(gl, program, ["modelmatrix", "viewmatrix", "projectionmatrix", "texture"]);

// --- INIT 3D ---
init3D(gl);

// --- GET DATA FROM 3D FILES ---
let scene_vertexbuffer = [];
let scene_texcoordbuffer = [];
let scene_texture = [];

async function loadScene() {
    let [obj, mtl] = await parseOBJ('/simulation/graphics/data/scene/scene.obj');
    let k = 0;
    for (const [key, value] of Object.entries(obj)) {
        scene_vertexbuffer[k] = [];
        scene_vertexbuffer[k][0] = createBuffer(gl, gl.ARRAY_BUFFER, value["v"]);
        scene_vertexbuffer[k][1] = Math.floor(value["v"].length / 3);
        scene_texcoordbuffer[k] = createBuffer(gl, gl.ARRAY_BUFFER, value["vt"]);

        if (value["m"][0]["map_Kd"] && value["m"][0]["map_Kd"].src) {
            scene_texture[k] = addTexture(gl, value["m"][0]["map_Kd"].src);
        } else {
            // Create a 1x1 image of the base color
            const baseColor = value["m"][0]["Ka"] || [1, 1, 1]; // Use Ka color or default to white
            const colorImageURL = createColorImageURL(baseColor);
            scene_texture[k] = addTexture(gl, colorImageURL);
        }
        k = k + 1;
    }
}

function createColorImageURL(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = `rgb(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255})`;
    ctx.fillRect(0, 0, 1, 1);
    return canvas.toDataURL();
}

let drone_vertexbuffer;
let drone_texcoordbuffer;
let drone_texture;
loadDrone();
async function loadDrone() {
    let [obj, mtl] = await parseOBJ('/simulation/graphics/data/drone.obj');
    drone_vertexbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["v"]);
    drone_texcoordbuffer = createBuffer(gl, gl.ARRAY_BUFFER, obj["drone"]["vt"]);
    drone_texture = addTexture(gl, mtl["Material"]["map_Kd"].src);
    await loadScene();
    requestAnimationFrame(drawScene);
}

// --- SETUP PROJECTION MATRIX ---
let projectionmatrix = perspecMat4f(degToRad(46.0), canvas.clientWidth / canvas.clientHeight, 0.01, 1000);
gl.uniformMatrix4fv(uniformLocations["projectionmatrix"], false, projectionmatrix);

// --- DRAW ---
function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // --- SETUP VIEWMATRIX ---
    if (attachedToDrone) {
        gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, inv4Mat4f(multMat4f(yRotMat4f(degToRad(180)), droneModelMatrix)));
    } else {
        gl.uniformMatrix4fv(uniformLocations["viewmatrix"], false, inv4Mat4f(cameraModelMatrix));
    }

    // --- DRAW SCENE ---
    for (let primitive = 0; primitive < scene_vertexbuffer.length; primitive++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_vertexbuffer[primitive][0], attribLocations.vertexposition, 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, scene_texcoordbuffer[primitive], attribLocations.texturecoordinate, 2);
        gl.uniform1i(uniformLocations["texture"], scene_texture[primitive]);
        gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, sceneModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, scene_vertexbuffer[primitive][1]);
    }

    // --- DRAW DRONE ---
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_vertexbuffer, attribLocations.vertexposition, 3);
    connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drone_texcoordbuffer, attribLocations.texturecoordinate, 2);
    gl.uniform1i(uniformLocations["texture"], drone_texture);
    gl.uniformMatrix4fv(uniformLocations["modelmatrix"], false, droneModelMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 924);

    requestAnimationFrame(drawScene);
}
