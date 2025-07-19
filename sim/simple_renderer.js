// Simple renderer with procedural geometry - replaces complex OBJ/MTL system
// This provides clean, simple assets and shaders for better visual quality

// Simple vertex shader - no complex lighting calculations
function getSimpleVertexShaderSource() {
    return `
        precision highp float;
        
        attribute vec4 vertexpos;
        attribute vec3 vertexnorm;
        attribute vec3 vertexcolor;
        
        uniform mat4 modelmat;
        uniform mat4 viewmat;
        uniform mat4 projmat;
        uniform vec3 lightPos;
        
        varying vec3 v_color;
        varying vec3 v_normal;
        varying vec3 v_lightDir;
        varying vec3 v_viewDir;
        
        void main() {
            vec4 worldPos = modelmat * vertexpos;
            gl_Position = projmat * viewmat * worldPos;
            
            v_normal = normalize((modelmat * vec4(vertexnorm, 0.0)).xyz);
            v_lightDir = normalize(lightPos - worldPos.xyz);
            v_viewDir = normalize(-worldPos.xyz);
            v_color = vertexcolor;
        }
    `;
}

// Simple fragment shader - clean lighting without complex material parsing
function getSimpleFragmentShaderSource() {
    return `
        precision highp float;
        
        varying vec3 v_color;
        varying vec3 v_normal;
        varying vec3 v_lightDir;
        varying vec3 v_viewDir;
        
        uniform vec3 lightColor;
        uniform float ambientStrength;
        uniform float diffuseStrength;
        uniform float specularStrength;
        
        void main() {
            vec3 norm = normalize(v_normal);
            
            // Ambient lighting
            vec3 ambient = ambientStrength * lightColor;
            
            // Diffuse lighting
            float diff = max(dot(norm, v_lightDir), 0.0);
            vec3 diffuse = diffuseStrength * diff * lightColor;
            
            // Specular lighting
            vec3 reflectDir = reflect(-v_lightDir, norm);
            float spec = pow(max(dot(v_viewDir, reflectDir), 0.0), 32.0);
            vec3 specular = specularStrength * spec * lightColor;
            
            vec3 result = (ambient + diffuse + specular) * v_color;
            gl_FragColor = vec4(result, 1.0);
        }
    `;
}

// Create simple geometric shapes procedurally
function createCube(size, color) {
    const vertices = [
        // Front face
        -size, -size,  size,   size, -size,  size,   size,  size,  size,
        -size, -size,  size,   size,  size,  size,  -size,  size,  size,
        // Back face
        -size, -size, -size,  -size,  size, -size,   size,  size, -size,
        -size, -size, -size,   size,  size, -size,   size, -size, -size,
        // Top face
        -size,  size, -size,  -size,  size,  size,   size,  size,  size,
        -size,  size, -size,   size,  size,  size,   size,  size, -size,
        // Bottom face
        -size, -size, -size,   size, -size, -size,   size, -size,  size,
        -size, -size, -size,   size, -size,  size,  -size, -size,  size,
        // Right face
         size, -size, -size,   size,  size, -size,   size,  size,  size,
         size, -size, -size,   size,  size,  size,   size, -size,  size,
        // Left face
        -size, -size, -size,  -size, -size,  size,  -size,  size,  size,
        -size, -size, -size,  -size,  size,  size,  -size,  size, -size
    ];
    
    const normals = [
        // Front face
         0,  0,  1,   0,  0,  1,   0,  0,  1,
         0,  0,  1,   0,  0,  1,   0,  0,  1,
        // Back face
         0,  0, -1,   0,  0, -1,   0,  0, -1,
         0,  0, -1,   0,  0, -1,   0,  0, -1,
        // Top face
         0,  1,  0,   0,  1,  0,   0,  1,  0,
         0,  1,  0,   0,  1,  0,   0,  1,  0,
        // Bottom face
         0, -1,  0,   0, -1,  0,   0, -1,  0,
         0, -1,  0,   0, -1,  0,   0, -1,  0,
        // Right face
         1,  0,  0,   1,  0,  0,   1,  0,  0,
         1,  0,  0,   1,  0,  0,   1,  0,  0,
        // Left face
        -1,  0,  0,  -1,  0,  0,  -1,  0,  0,
        -1,  0,  0,  -1,  0,  0,  -1,  0,  0
    ];
    
    const colors = [];
    for (let i = 0; i < 36; i++) {
        colors.push(...color);
    }
    
    return { vertices, normals, colors };
}

function createFloor(size, color) {
    const vertices = [
        -size, 0, -size,   size, 0, -size,   size, 0,  size,
        -size, 0, -size,   size, 0,  size,  -size, 0,  size
    ];
    
    const normals = [
        0, 1, 0,   0, 1, 0,   0, 1, 0,
        0, 1, 0,   0, 1, 0,   0, 1, 0
    ];
    
    const colors = [];
    for (let i = 0; i < 6; i++) {
        colors.push(...color);
    }
    
    return { vertices, normals, colors };
}

function createSphere(radius, segments, color) {
    const vertices = [];
    const normals = [];
    const colors = [];
    
    for (let lat = 0; lat <= segments; lat++) {
        const theta = lat * Math.PI / segments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        
        for (let lon = 0; lon <= segments; lon++) {
            const phi = lon * 2 * Math.PI / segments;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
            
            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;
            
            vertices.push(x * radius, y * radius, z * radius);
            normals.push(x, y, z);
            colors.push(...color);
        }
    }
    
    const indices = [];
    for (let lat = 0; lat < segments; lat++) {
        for (let lon = 0; lon < segments; lon++) {
            const first = (lat * (segments + 1)) + lon;
            const second = first + segments + 1;
            
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }
    
    // Convert indexed vertices to simple triangle list
    const finalVertices = [];
    const finalNormals = [];
    const finalColors = [];
    
    for (let i = 0; i < indices.length; i++) {
        const idx = indices[i];
        finalVertices.push(vertices[idx * 3], vertices[idx * 3 + 1], vertices[idx * 3 + 2]);
        finalNormals.push(normals[idx * 3], normals[idx * 3 + 1], normals[idx * 3 + 2]);
        finalColors.push(colors[idx * 3], colors[idx * 3 + 1], colors[idx * 3 + 2]);
    }
    
    return { vertices: finalVertices, normals: finalNormals, colors: finalColors };
}

// Create simple drawable object
function createSimpleDrawable(geometry, modelMatrix) {
    return {
        vertexBuffer: createBuffer(gl, gl.ARRAY_BUFFER, geometry.vertices),
        normalBuffer: createBuffer(gl, gl.ARRAY_BUFFER, geometry.normals),
        colorBuffer: createBuffer(gl, gl.ARRAY_BUFFER, geometry.colors),
        vertexCount: geometry.vertices.length / 3,
        modelMatrix: modelMatrix
    };
}

// Draw simple drawable
function drawSimpleDrawable(gl, drawable, attribLocations) {
    try {
        // Set model matrix
        const modelMatLoc = gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "modelmat");
        gl.uniformMatrix4fv(modelMatLoc, false, drawable.modelMatrix);
        
        // Bind vertex positions
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drawable.vertexBuffer, attribLocations["vertexpos"], 3);
        
        // Bind normals
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drawable.normalBuffer, attribLocations["vertexnorm"], 3);
        
        // Bind colors
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, drawable.colorBuffer, attribLocations["vertexcolor"], 3);
        
        // Draw the triangles
        gl.drawArrays(gl.TRIANGLES, 0, drawable.vertexCount);
        
    } catch (error) {
        console.error('Error in drawSimpleDrawable:', error);
    }
}

// Create a simple, beautiful scene
function createSimpleScene() {
    const scene = {
        drawables: [],
        lightPos: [5, 10, 5],
        lightColor: [1.0, 1.0, 0.9],
        ambientStrength: 0.3,
        diffuseStrength: 0.8,
        specularStrength: 0.5
    };
    
    // Create floor
    const floorGeometry = createFloor(20, [0.8, 0.8, 0.9]);
    scene.drawables.push(createSimpleDrawable(floorGeometry, modelMat4f(0, -1, 0, 0, 0, 0, 1, 1, 1)));
    
    // Create some walls
    const wallGeometry = createCube(0.2, [0.9, 0.9, 0.95]);
    scene.drawables.push(createSimpleDrawable(wallGeometry, modelMat4f(-10, 5, 0, 0, 0, 0, 1, 25, 1)));
    scene.drawables.push(createSimpleDrawable(wallGeometry, modelMat4f(10, 5, 0, 0, 0, 0, 1, 25, 1)));
    scene.drawables.push(createSimpleDrawable(wallGeometry, modelMat4f(0, 5, -10, 0, 0, 0, 25, 25, 1)));
    
    // Create some furniture/obstacles
    const furnitureColors = [
        [0.6, 0.3, 0.2], // Brown
        [0.2, 0.6, 0.3], // Green
        [0.3, 0.3, 0.8], // Blue
        [0.8, 0.6, 0.2]  // Orange
    ];
    
    const positions = [
        [-5, 0.5, -5], [5, 0.5, -5], [-5, 0.5, 5], [3, 1.5, 2]
    ];
    
    for (let i = 0; i < positions.length; i++) {
        const cubeGeometry = createCube(1, furnitureColors[i]);
        scene.drawables.push(createSimpleDrawable(cubeGeometry, modelMat4f(...positions[i], 0, 0, 0, 1, 1, 1)));
    }
    
    // Add some spherical decorations
    const sphereGeometry = createSphere(0.5, 12, [0.9, 0.7, 0.3]);
    scene.drawables.push(createSimpleDrawable(sphereGeometry, modelMat4f(-2, 2, -2, 0, 0, 0, 1, 1, 1)));
    scene.drawables.push(createSimpleDrawable(sphereGeometry, modelMat4f(7, 3, 7, 0, 0, 0, 1, 1, 1)));
    
    return scene;
}

// Create simple drone geometry
function createSimpleDrone() {
    const droneGeometry = {
        vertices: [],
        normals: [],
        colors: []
    };
    
    // Main body (center cube)
    const body = createCube(0.3, [0.2, 0.2, 0.2]);
    droneGeometry.vertices.push(...body.vertices);
    droneGeometry.normals.push(...body.normals);
    droneGeometry.colors.push(...body.colors);
    
    // Arms (4 thin rectangles)
    const armPositions = [
        [0.8, 0, 0], [-0.8, 0, 0], [0, 0, 0.8], [0, 0, -0.8]
    ];
    
    for (const pos of armPositions) {
        const arm = createCube(0.1, [0.3, 0.3, 0.3]);
        // Transform arm vertices
        for (let i = 0; i < arm.vertices.length; i += 3) {
            arm.vertices[i] += pos[0];
            arm.vertices[i + 1] += pos[1];
            arm.vertices[i + 2] += pos[2];
        }
        droneGeometry.vertices.push(...arm.vertices);
        droneGeometry.normals.push(...arm.normals);
        droneGeometry.colors.push(...arm.colors);
    }
    
    // Propellers (4 small spheres)
    for (const pos of armPositions) {
        const propeller = createSphere(0.15, 8, [0.9, 0.9, 0.1]);
        // Transform propeller vertices
        for (let i = 0; i < propeller.vertices.length; i += 3) {
            propeller.vertices[i] += pos[0];
            propeller.vertices[i + 1] += pos[1] + 0.1;
            propeller.vertices[i + 2] += pos[2];
        }
        droneGeometry.vertices.push(...propeller.vertices);
        droneGeometry.normals.push(...propeller.normals);
        droneGeometry.colors.push(...propeller.colors);
    }
    
    return droneGeometry;
}