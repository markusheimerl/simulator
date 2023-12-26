// ----------------------------------- LOGIC -----------------------------------
function checkRuleConditions(neighborcount, values) {
	for (var i = 0; i < values.length; i++) {
		if (neighborcount == values[i]) return true;
	}
	return false;
}

function createCellGridWireframe(cellularworldsize, randomize) {
	var cellgrid = [];
	for (var x = 0; x < cellularworldsize; x++) {
		cellgrid[x] = [];
		for (var y = 0; y < cellularworldsize; y++) {
			cellgrid[x][y] = [];
			for (var z = 0; z < cellularworldsize; z++) {
				if (randomize) cellgrid[x][y][z] = Math.random() >= 0.5 ? 1 : 0;
				else cellgrid[x][y][z] = 0;

				// mark world edges
				if (y == 0 && z == 0) cellgrid[x][y][z] = 1;
				if (x == 0 && z == 0) cellgrid[x][y][z] = 1;
				if (x == 0 && y == 0) cellgrid[x][y][z] = 1;

				if (y == cellularworldsize - 1 && z == cellularworldsize - 1) cellgrid[x][y][z] = 1;
				if (x == cellularworldsize - 1 && z == cellularworldsize - 1) cellgrid[x][y][z] = 1;
				if (x == cellularworldsize - 1 && y == cellularworldsize - 1) cellgrid[x][y][z] = 1;

				if (y == cellularworldsize - 1 && z == 0) cellgrid[x][y][z] = 1;
				if (x == cellularworldsize - 1 && z == 0) cellgrid[x][y][z] = 1;
				if (x == cellularworldsize - 1 && y == 0) cellgrid[x][y][z] = 1;

				if (y == 0 && z == cellularworldsize - 1) cellgrid[x][y][z] = 1;
				if (x == 0 && z == cellularworldsize - 1) cellgrid[x][y][z] = 1;
				if (x == 0 && y == cellularworldsize - 1) cellgrid[x][y][z] = 1;
			}
		}
	}
	return cellgrid;
}

var cellularworldsize = 60;
var cellgrid = createCellGridWireframe(cellularworldsize, true);
var survivevalues = [20, 24]
var bornvalues = [4]

cellularAutomataLogic();
function cellularAutomataLogic() {
	if (running) {

		var cellgridnextframe = createCellGridWireframe(cellularworldsize, false);

		for (var x = 2; x < cellularworldsize - 2; x++) {
			for (var y = 2; y < cellularworldsize - 2; y++) {
				for (var z = 2; z < cellularworldsize - 2; z++) {
					// get cell status
					var status = cellgrid[x][y][z];

					// get neighbor count
					var zm1 = z - 1 < 2 ? cellularworldsize - 3 : z - 1;
					var zp1 = z + 1 == cellularworldsize - 2 ? 2 : z + 1;
					var ym1 = y - 1 < 2 ? cellularworldsize - 3 : y - 1;
					var yp1 = y + 1 == cellularworldsize - 2 ? 2 : y + 1;
					var xm1 = x - 1 < 2 ? cellularworldsize - 3 : x - 1;
					var xp1 = x + 1 == cellularworldsize - 2 ? 2 : x + 1;

					// below
					var neighborcount = cellgrid[x][y][zm1] + cellgrid[x][yp1][zm1] + cellgrid[x][ym1][zm1] + cellgrid[xp1][y][zm1]
						+ cellgrid[xm1][y][zm1] + cellgrid[xp1][yp1][zm1] + cellgrid[xp1][ym1][zm1] + cellgrid[xm1][ym1][zm1] + cellgrid[xm1][yp1][zm1];

					// level
					neighborcount += cellgrid[x][yp1][z] + cellgrid[x][ym1][z] + cellgrid[xp1][y][z]
						+ cellgrid[xm1][y][z] + cellgrid[xp1][yp1][z] + cellgrid[xp1][ym1][z] + cellgrid[xm1][ym1][z] + cellgrid[xm1][yp1][z];

					// above
					neighborcount += cellgrid[x][y][zp1] + cellgrid[x][yp1][zp1] + cellgrid[x][ym1][zp1] + cellgrid[xp1][y][zp1]
						+ cellgrid[xm1][y][zp1] + cellgrid[xp1][yp1][zp1] + cellgrid[xp1][ym1][zp1] + cellgrid[xm1][ym1][zp1] + cellgrid[xm1][yp1][zp1];

					// if cell alive and neighborcount is 20 or 24 it stays alive
					if (status == 1 && checkRuleConditions(neighborcount, survivevalues)) {
						cellgridnextframe[x][y][z] = 1;
					}
					// if cell is dead and neighborcount is 4, it is born
					else if (status == 0 && checkRuleConditions(neighborcount, bornvalues)) {
						cellgridnextframe[x][y][z] = 1;
					}
					// in all other cases the cell remains dead or dies (already initialized as 0)
				}
			}
		}

		cellgrid = cellgridnextframe;
	}
	setTimeout(cellularAutomataLogic, 100);
}

// --- DRAWING CODE ---
const vertexshadersource = `
		precision highp float;

		attribute vec4 vertexposition;
		attribute vec2 texturecoordinate;
		attribute vec3 normal;

		uniform mat4 modelmatrix;
		uniform mat4 projectionmatrix;
		uniform mat4 viewmatrix;

		varying vec2 o_texturecoordinate;
		varying vec3 o_normal;

		void main(){
			o_texturecoordinate = texturecoordinate;
			o_normal = mat3(modelmatrix) * normal;
			gl_Position = projectionmatrix * viewmatrix * modelmatrix * vertexposition;
		}
	`;

const fragmentshadersource = `
		precision highp float;

		varying vec2 o_texturecoordinate;
		varying vec3 o_normal;

		uniform sampler2D texture;
		uniform vec3 reverseLightDirection;

		void main(){
			vec3 normal = normalize(o_normal);
			float light = dot(normal, reverseLightDirection);

			gl_FragColor = texture2D(texture, o_texturecoordinate);
			//gl_FragColor.rgb *= light;
		}
	`;

// --- MAKE SHADERS AND PROGRAM ---
const program = createShaderProgram(gl, vertexshadersource, fragmentshadersource);
gl.useProgram(program);

// --- GET ALL ATTRIBUTE AND UNIFORM LOCATIONS
const attribLocations = getAttribLocations(gl, program, ["vertexposition", "texturecoordinate", "normal"]);
const uniformLocations = getUniformLocations(gl, program, ["modelmatrix", "viewmatrix", "projectionmatrix", "texture", "reverseLightDirection"]);

// --- INIT 3D ---
init3D(gl);

// --- THERE SHALL BE LIGHT ---
gl.uniform3fv(uniformLocations.reverseLightDirection, normalize([1.0, 0.0, 0.0, 1.0]));

// GET DATA FROM OBJ
var cubevertexbuffer;
var cubetexcoordbuffer;
var cubenormalbuffer;
main();
async function main() {
	const response = await fetch('data/cube.obj');
	const text = await response.text();
	var data = parseOBJ(text, true);
	console.log(data);
	cubevertexbuffer = createBuffer(gl, gl.ARRAY_BUFFER, data["Cube"].positions);
	cubetexcoordbuffer = createBuffer(gl, gl.ARRAY_BUFFER, data["Cube"].texcoords);
	cubenormalbuffer = createBuffer(gl, gl.ARRAY_BUFFER, data["Cube"].normals);
}

// --- GET OBJ TEXTURE ---
var texturecube = createTexture(gl);
attachTextureSourceAsync(gl, texturecube, "data/cubetexturetest.png", true);

// --- ENABLE TEXTURE0 ---
gl.uniform1i(uniformLocations.texture, 0);

var camerapos = [30.0, 30.0, -100.0];

requestAnimationFrame(drawScene);
toggle();

var then = 0;
function drawScene(now) {
	if (running) {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		// convert requestanimationframe timestamp to seconds
		now *= 0.001;
		// subtract the previous time from the current time
		var deltaTime = now - then;
		// remember the current time for the next frame
		then = now;

		// --- SETUP PROJECTION MATRIX --- (MAKE EVERYTHING 3D)
		//var projectionmatrix = createOrthographicMatrix(0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, 400, -400);
		var projectionmatrix = createPerspectiveMatrix(degreeToRadians(46.0), gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 200000);
		gl.uniformMatrix4fv(uniformLocations.projectionmatrix, false, projectionmatrix);


		// --- SETUP LOOKAT MATRIX ---
		var lookatmatrix = createIdentityMatrix();
		lookatmatrix = mult(createTranslationMatrix(camerapos[0] + Math.sin(degreeToRadians(viewxz)), camerapos[1] + Math.sin(degreeToRadians(viewy)), camerapos[2] + Math.cos(degreeToRadians(viewxz))), lookatmatrix);
		var lookatposition = [lookatmatrix[12], lookatmatrix[13], lookatmatrix[14]];


		// --- FIRST PERSON CAMERA ---
		var movementspeed = 0.8;
		var factorws = (keys["w"] ? 1 : keys["s"] ? -1 : 0);
		lookatposition[0] += Math.sin(degreeToRadians(viewxz)) * movementspeed * factorws;
		lookatposition[1] += Math.sin(degreeToRadians(viewy)) * movementspeed * factorws;
		lookatposition[2] += Math.cos(degreeToRadians(viewxz)) * movementspeed * factorws;
		camerapos[0] += Math.sin(degreeToRadians(viewxz)) * movementspeed * factorws;
		camerapos[1] += Math.sin(degreeToRadians(viewy)) * movementspeed * factorws;
		camerapos[2] += Math.cos(degreeToRadians(viewxz)) * movementspeed * factorws;

		var factorad = (keys["d"] ? 1 : keys["a"] ? -1 : 0);
		var movcamvector = cross([Math.sin(degreeToRadians(viewxz)), Math.sin(degreeToRadians(viewy)), Math.cos(degreeToRadians(viewxz))], [0, 1, 0]);
		lookatposition[0] += movcamvector[0] * movementspeed * factorad;
		lookatposition[2] += movcamvector[2] * movementspeed * factorad;
		camerapos[0] += movcamvector[0] * movementspeed * factorad;
		camerapos[2] += movcamvector[2] * movementspeed * factorad;

		var factoreq = (keys["e"] ? movementspeed : keys["q"] ? -movementspeed : 0);
		lookatposition[1] += factoreq;
		camerapos[1] += factoreq;


		// --- SETUP VIEWMATRIX --- (MOVE THE WORLD INVERSE OF THE CAMERAMOVEMENT)
		var cameramatrix = lookAt(camerapos, lookatposition, [0, 1, 0]);
		var viewmatrix = inverse(cameramatrix);
		var viewmatrixlocation = gl.getUniformLocation(program, "viewmatrix");
		gl.uniformMatrix4fv(uniformLocations.viewmatrix, false, viewmatrix);


		// --- CONNECT BUFFERS TO ATTRIBUTES --- (only has to be done once since the only object vertex data we ever need is that of a cube)
		connectBufferToAttribute(gl, gl.ARRAY_BUFFER, cubevertexbuffer, attribLocations.vertexposition, 3, true);
		connectBufferToAttribute(gl, gl.ARRAY_BUFFER, cubenormalbuffer, attribLocations.normal, 3, true);
		connectBufferToAttribute(gl, gl.ARRAY_BUFFER, cubetexcoordbuffer, attribLocations.texturecoordinate, 2, true);


		// -- DRAW ---
		//console.time("drawloop");
		for (var x = 0; x < cellularworldsize; x++) {
			for (var y = 0; y < cellularworldsize; y++) {
				for (var z = 0; z < cellularworldsize; z++) {
					if (cellgrid[x][y][z] == 1) {
						gl.uniformMatrix4fv(uniformLocations.modelmatrix, false, createModelMatrix(x, y, z, 0, 0, 0, 0.5, 0.5, 0.5));
						gl.drawArrays(gl.TRIANGLES, 0, 6 * 2 * 3);
					}
				}
			}
		}
		//console.timeEnd("drawloop");

	}
	requestAnimationFrame(drawScene);
}
