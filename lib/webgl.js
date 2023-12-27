
function createProgram(gl, vertexshader, fragmentshader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexshader);
    gl.attachShader(program, fragmentshader);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) { return program; }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function compileShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { return shader; }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createShaderProgram(gl, vertexshadersource, fragmentshadersource) {
    return createProgram(gl, compileShader(gl, gl.VERTEX_SHADER, vertexshadersource), compileShader(gl, gl.FRAGMENT_SHADER, fragmentshadersource));
}

function init3D(gl) {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
}

function getAttribLocations(gl, program, names) {
    var attriblocations = {};
    for (var i = 0; i < names.length; i++) { attriblocations[names[i]] = gl.getAttribLocation(program, names[i]); }
    return attriblocations;
}

function getUniformLocations(gl, program, names) {
    var uniformlocations = {};
    for (var i = 0; i < names.length; i++) { uniformlocations[names[i]] = gl.getUniformLocation(program, names[i]); }
    return uniformlocations;
}

function createBuffer(gl, type, data) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, new Float32Array(data), gl.STATIC_DRAW);
    return buffer;
}

function setBufferData(gl, type, buffer, data) {
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, new Float32Array(data), gl.STATIC_DRAW);
}

function connectBufferToAttribute(gl, type, buffer, attriblocation, valuespervertex, enable) {
    if (enable) gl.enableVertexAttribArray(attriblocation);
    gl.bindBuffer(type, buffer);
    gl.vertexAttribPointer(attriblocation, valuespervertex, gl.FLOAT, false, 0, 0);
}

function createTexture(gl, dim) {
    dim = dim ? dim : { x: 1, y: 1 };
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dim.x, dim.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return texture;
}

function createModelMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz) {
    var modelmatrix = createIdentityMatrix();
    modelmatrix = mult(createTranslationMatrix(tx, ty, tz), modelmatrix);
    modelmatrix = mult(createXRotationMatrix(degreeToRadians(rx)), modelmatrix);
    modelmatrix = mult(createYRotationMatrix(degreeToRadians(ry)), modelmatrix);
    modelmatrix = mult(createZRotationMatrix(degreeToRadians(rz)), modelmatrix);
    modelmatrix = mult(createScaleMatrix(sx, sy, sz), modelmatrix);
    return modelmatrix;
}

function addTexture(gl, texture, source) {
    var img = new Image();
    img.src = source;

    img.addEventListener("load", function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
    });
}

function attachTextureSourceAsync(gl, texture, source, flipVertically) {
    var image = new Image();
    image.src = source;

    image.addEventListener("load", function () {
        if (flipVertically) {
            var canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            canvas.getContext("2d").scale(1, -1);
            canvas.getContext("2d").drawImage(image, 0, image.height * -1);
            var flipImage = new Image();
            flipImage.src = canvas.toDataURL("image/png");
            flipImage.addEventListener("load", function () {
                addTexture(gl, texture, flipImage);
            });
        } else {
            addTexture(gl, texture, image);
        }
    });
}
