// Simplified main simulation file using procedural geometry
// Replaces complex OBJ/MTL loading with clean, simple rendering

console.log('Loading main_simple.js');

// Scene configuration for simple renderer
const simple_scene_config = {
    lightPos: [8, 12, 8],
    lightColor: [1.0, 0.95, 0.8], // Warm white light
    ambientStrength: 0.4, // Increased ambient
    diffuseStrength: 0.9, // Increased diffuse  
    specularStrength: 0.6, // Increased specular
    dronemodelmatrix: modelMat4f(-2.0, 1.0, -2.0, 0.0, 0.0, 0.0, 0.05, 0.05, 0.05)
};

// Global variables for scene and drone
let simpleScene;
let simpleDrone;
let simpleProgram;
let simpleAttribLocs;
let simpleUniformLocs;

// Initialize simple scene and drone
function initSimpleScene() {
    console.log('Initializing simple scene');
    document.getElementById('loading_overlay').style.display = 'flex';
    
    try {
        // Create simple shader program
        console.log('Creating shader program');
        simpleProgram = createAndUseProgram(gl, getSimpleVertexShaderSource(), getSimpleFragmentShaderSource());
        console.log('Shader program created:', !!simpleProgram);

        // Get attribute and uniform locations for simple shader
        simpleAttribLocs = {
            vertexpos: gl.getAttribLocation(simpleProgram, "vertexpos"),
            vertexnorm: gl.getAttribLocation(simpleProgram, "vertexnorm"),
            vertexcolor: gl.getAttribLocation(simpleProgram, "vertexcolor")
        };
        console.log('Attribute locations:', simpleAttribLocs);

        simpleUniformLocs = {
            modelmat: gl.getUniformLocation(simpleProgram, "modelmat"),
            viewmat: gl.getUniformLocation(simpleProgram, "viewmat"),
            projmat: gl.getUniformLocation(simpleProgram, "projmat"),
            lightPos: gl.getUniformLocation(simpleProgram, "lightPos"),
            lightColor: gl.getUniformLocation(simpleProgram, "lightColor"),
            ambientStrength: gl.getUniformLocation(simpleProgram, "ambientStrength"),
            diffuseStrength: gl.getUniformLocation(simpleProgram, "diffuseStrength"),
            specularStrength: gl.getUniformLocation(simpleProgram, "specularStrength")
        };
        console.log('Uniform locations:', simpleUniformLocs);

        // Enable vertex attributes
        gl.enableVertexAttribArray(simpleAttribLocs.vertexpos);
        gl.enableVertexAttribArray(simpleAttribLocs.vertexnorm);
        gl.enableVertexAttribArray(simpleAttribLocs.vertexcolor);

        // Create scene
        console.log('Creating simple scene');
        simpleScene = createSimpleScene();
        console.log('Simple scene created:', !!simpleScene, 'drawables:', simpleScene ? simpleScene.drawables.length : 0);
        
        // Create drone
        console.log('Creating simple drone');
        const droneGeometry = createSimpleDrone();
        console.log('Drone geometry created, vertices:', droneGeometry.vertices.length);
        simpleDrone = createSimpleDrawable(droneGeometry, simple_scene_config.dronemodelmatrix);
        console.log('Simple drone created:', !!simpleDrone);
        
        // Create compatibility object for dynamics.js
        window.drone_drawable = {
            modelmatrix: simple_scene_config.dronemodelmatrix
        };
        
        // Expose globals for debugging
        window.simpleScene = simpleScene;
        window.simpleDrone = simpleDrone;
        window.simpleProgram = simpleProgram;
        
        document.getElementById('loading_overlay').style.display = 'none';
        
        // Load dynamics and control after initialization
        loadScript('/sim/dynamics.js').then(() => {
            return loadScript('/sim/control.js');
        }).then(() => {
            console.log('Dynamics and control loaded');
            // Start rendering
            drawSimpleScene();
        });
        
    } catch (error) {
        console.error('Error during initialization:', error);
        document.getElementById('loading_overlay').style.display = 'none';
    }
}

// Helper function to load scripts dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Render function for simple scene
function renderSimpleScene() {
    try {
        // Clear and setup
        prepareGLState(gl, canvas.width, canvas.height, simpleProgram, null, null);
        
        // Set up view and projection matrices  
        const projMatrix = projectionmatrix;
        const viewMatrix = attachedToDrone ? inv4Mat4f(multMat4f(yRotMat4f(degToRad(180)), simpleDrone.modelMatrix)) : inv4Mat4f(viewmatrix);
        
        gl.uniformMatrix4fv(simpleUniformLocs.projmat, false, projMatrix);
        gl.uniformMatrix4fv(simpleUniformLocs.viewmat, false, viewMatrix);
        
        // Set up lighting uniforms
        gl.uniform3fv(simpleUniformLocs.lightPos, simple_scene_config.lightPos);
        gl.uniform3fv(simpleUniformLocs.lightColor, simple_scene_config.lightColor);
        gl.uniform1f(simpleUniformLocs.ambientStrength, simple_scene_config.ambientStrength);
        gl.uniform1f(simpleUniformLocs.diffuseStrength, simple_scene_config.diffuseStrength);
        gl.uniform1f(simpleUniformLocs.specularStrength, simple_scene_config.specularStrength);
        
        // Draw scene objects
        if (simpleScene && simpleScene.drawables) {
            for (const drawable of simpleScene.drawables) {
                drawSimpleDrawable(gl, drawable, simpleAttribLocs);
            }
        }
        
        // Draw drone
        if (simpleDrone) {
            drawSimpleDrawable(gl, simpleDrone, simpleAttribLocs);
        }
        
    } catch (error) {
        console.error('Error in renderSimpleScene:', error);
    }
}

// Main render loop
function drawSimpleScene() {
    // Update drone position from dynamics
    if (window.drone_drawable) {
        simpleDrone.modelMatrix = window.drone_drawable.modelmatrix;
    }
    
    renderSimpleScene();
    requestAnimationFrame(drawSimpleScene);
}

// Initialize when page loads
console.log('Starting initialization');
initSimpleScene();