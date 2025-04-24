// Scene
let scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0ffff);


// Render
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.id = "canvas";


// Camera
var camera = new THREE.OrthographicCamera(  window.innerWidth  / -2, window.innerWidth /   2,
                                            window.innerHeight / 2 , window.innerHeight / -2, 1, 500);
camera.position.set(0, 0, 100);


// Camera projection
const a = canvas.height / canvas.width;
const FOV = 70;
const f = 1 / Math.tan((FOV * Math.PI / 180) / 2);
const zFar = 100;
const zNear = 1;
const q = zFar / (zFar - zNear);


// Camera pos 
let tx = 0;
let ty = 10;
let tz = -5;


// Camera angle
let angleX = 0 * Math.PI / 180;
let angleY = 0 * Math.PI / 180;


// Screen 
const width = canvas.width;
const height = canvas.height; 


// Button Pressed
let keysPressed = new Set();
let keysToggle = new Set();


// FPS
let d = new Date();
let lastTime = d.getTime()/1000;
let frames = 0;
let fps;


// Information
let informationPre = document.createElement('pre');
informationPre.style.position = 'absolute';
informationPre.style.width = 100;
informationPre.style.height = 200;
informationPre.style.top = 10 + 'px';
informationPre.style.left = 10 + 'px';
document.body.appendChild(informationPre);


// Light 
const sunVector = [0,1,0];


// Objects
let objects = [];


// Axis
objects.push(new Entity([new Triangle(0,0,0,10,0,2,10,0,0),new Triangle(0,0,0,2,0,2,10,0,2)]));
objects[objects.length - 1].color = [255,0,0];
objects.push(new Entity([new Triangle(0,0,0,0,0,10,2,0,10),new Triangle(0,0,0,2,0,10,2,0,2)]));
objects[objects.length - 1].color = [0,0,255];
objects.push(new Entity([new Triangle(0,0,0,0,10,0,2,10,2),new Triangle(0,0,0,2,10,2,2,0,2)]));
objects[objects.length - 1].color = [0,255,0];
objects.push(new Entity([new Triangle(0,0,0,2,10,2,0,10,0),new Triangle(0,0,0,2,0,2,2,10,2)]));
objects[objects.length - 1].color = [0,255,0];


// Utah teapot 
loadObject(teapot);


function draw() {
    // Remove objects (clear screen)
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }

    let informationTab = []; 
    informationPre.innerHTML = "";
    let drawPoints = [];
    let drawColors = [];
    
    // Angles
    let cosX = Math.cos(angleX);
    let cosY = Math.cos(angleY);
    let sinX = Math.sin(angleX);
    let sinY = Math.sin(angleY);
    
    // Matrixes
    let projectionMatrix = [
        [a * f, 0,  0,        0],
        [0,     f,  0,        0],
        [0,     0,  q,        1],
        [0,     0,  -zNear*q, 0]
    ];

    let projectionMatrixInvers = [
        [1/projectionMatrix[0][0],  0,                        0,                        0],
        [0,                         1/projectionMatrix[1][1], 0,                        0],
        [0,                         0,                        1/projectionMatrix[2][2], 0],
        [0,                         0,                        0,                        0]
    ];

    let rotateMatrix = [
        [cosY,       0,    sinY,       0],
        [sinX*sinY,  cosX, -sinX*cosY, 0],
        [-cosX*sinY, sinX, cosX*cosY,  0],
        [0,          0,    0,          1]
    ];

    let rotateMatrixInvers = [
        [cosY, 0, -sinY, 0],
        [0,    1, 0,     0],
        [sinY, 0, cosY,  0],
        [0,    0, 0,     0]
    ];

    keyLoop(projectionMatrixInvers, rotateMatrixInvers);

    let translationMatrix = [
        [1, 0, 0, -tx],
        [0, 1, 0, -ty],
        [0, 0, 1, -tz],
        [0, 0, 0, 1 ]
    ];

    
    // Loop every object
    for (let i = 0; i < objects.length; i++) {

        // Loop the objects triangles 
        for ( let j = 0; j < objects[i].triangleObjects.length; j++ ){
            
            const currentTriangle = objects[i].triangleObjects[j];
            const offset = objects[i].offset;
            const scale = objects[i].scale;
            
            currentTriangle.projectionPoints = [];
            let depthClippedPoints = [];
            let normalizedPoints = [];
            
            // Depth Clipping Z
            let A = { 
                x: (currentTriangle.points[0][0] + offset[0]) * scale,
                y: (currentTriangle.points[0][1] + offset[1]) * scale,
                z: (currentTriangle.points[0][2] + offset[2]) * scale,
                w: currentTriangle.points[0][3] 
            };

            let B = { 
                x: (currentTriangle.points[1][0] + offset[0]) * scale,
                y: (currentTriangle.points[1][1] + offset[1]) * scale,
                z: (currentTriangle.points[1][2] + offset[2]) * scale,
                w: currentTriangle.points[1][3] 
            };

            let C = { 
                x: (currentTriangle.points[2][0] + offset[0]) * scale,
                y: (currentTriangle.points[2][1] + offset[1]) * scale,
                z: (currentTriangle.points[2][2] + offset[2]) * scale,
                w: currentTriangle.points[2][3] 
            };

            let normalV = [-cosX * sinY, sinX, cosY * cosX];

            const U = {
                x: B.x - A.x,
                y: B.y - A.y,
                z: B.z - A.z
            };
            const V = {
                x: C.x - A.x,
                y: C.y - A.y,
                z: C.z - A.z
            };
            let Nx = (U.y * V.z) - (U.z * V.y);
            let Ny = (U.z * V.x) - (U.x * V.z);
            let Nz = (U.x * V.y) - (U.y * V.x);
            const length = (Nx**2 + Ny**2 + Nz**2)**0.5;
            Nx /= length; 
            Ny /= length;
            Nz /= length;
            
            if (Nx * (A.x - tx) + Ny * (A.y - ty) + Nz * (A.z - tz) < 0){
                let d = -(normalV[0] * tx + normalV[1] * ty + normalV[2] * tz);
                let nearPlane = [
                    normalV[0] - 0.0001,
                    normalV[1] - 0.0001,
                    normalV[2] - 0.0001,
                    d
                ];  
                
                let distanceA =  (normalV[0]*A.x + normalV[1]*A.y + normalV[2]*A.z + d) / 
                                ((normalV[0]**2 + normalV[1]**2 + normalV[2]**2)**0.5);

                let distanceB =  (normalV[0]*B.x + normalV[1]*B.y + normalV[2]*B.z + d) / 
                                ((normalV[0]**2 + normalV[1]**2 + normalV[2]**2)**0.5);

                let distanceC =  (normalV[0]*C.x + normalV[1]*C.y + normalV[2]*C.z + d) / 
                                ((normalV[0]**2 + normalV[1]**2 + normalV[2]**2)**0.5);

                let infront = [];
                let behind = [];
                if(distanceA > 0){infront.push(A);}else{behind.push(A);}
                if(distanceB > 0){infront.push(B);}else{behind.push(B);}
                if(distanceC > 0){infront.push(C);}else{behind.push(C);}

                if (infront.length == 3){
                    depthClippedPoints.push([A.x, A.y, A.z, A.w]);
                    depthClippedPoints.push([B.x, B.y, B.z, B.w]);
                    depthClippedPoints.push([C.x, C.y, C.z, C.w]);
                }
                else if(infront.length == 2){
                    let intersectionAC = Calc.linePlaneIntersection(infront[0], behind[0], nearPlane);
                    let intersectionBC = Calc.linePlaneIntersection(infront[1], behind[0], nearPlane);

                    if (intersectionAC != null && intersectionBC != null) {
                        depthClippedPoints.push([infront[0].x, infront[0].y, infront[0].z, 1]);
                        depthClippedPoints.push([intersectionAC.x, intersectionAC.y, intersectionAC.z, 1]);
                        depthClippedPoints.push([infront[1].x, infront[1].y, infront[1].z, 1]);

                        depthClippedPoints.push([infront[1].x, infront[1].y, infront[1].z, 1]);
                        depthClippedPoints.push([intersectionAC.x, intersectionAC.y, intersectionAC.z, 1]);
                        depthClippedPoints.push([intersectionBC.x, intersectionBC.y, intersectionBC.z, 1]);

                    }
                }
                else if(infront.length == 1){
                    let intersectionAB = Calc.linePlaneIntersection(infront[0], behind[0], nearPlane);
                    let intersectionAC = Calc.linePlaneIntersection(infront[0], behind[1], nearPlane);
                    
                    if (intersectionAB != null && intersectionAC != null) {
                        depthClippedPoints.push([infront[0].x, infront[0].y, infront[0].z, 1]);
                        depthClippedPoints.push([intersectionAB.x, intersectionAB.y, intersectionAB.z, 1]);
                        depthClippedPoints.push([intersectionAC.x, intersectionAC.y, intersectionAC.z, 1]);
                    }
                }  

                // Matrix multiplications
                for (let k = 0; k < depthClippedPoints.length; k++) {

                    const translation = Vector4d.dot(translationMatrix, depthClippedPoints[k]);
                    const rotate      = Vector4d.dot(rotateMatrix,      translation);
                    const projection  = Vector4d.dot(projectionMatrix,  rotate);

                    if (projection[3] < 0) {
                        const x = projection[0] / projection[3];
                        const y = projection[1] / projection[3];
                        const z = projection[2] / projection[3];
                        
                        normalizedPoints.push([ (x*width / 2), (y*height / 2), z]);
                    }
                }

                // Draw
                if(normalizedPoints.length >= 3){
                    const rgbValue = objects[i].colorValues();

                    // Light ray 
                    const normalVector = currentTriangle.normalVector();

                    const dotProduct = normalVector[0] * sunVector[0] + normalVector[1] * sunVector[1] + normalVector[2] * sunVector[2];
                    const shading = ((dotProduct + 1) / 2);

                    let faceColor = [rgbValue[0] * shading,
                                     rgbValue[1] * shading,
                                     rgbValue[2] * shading];
                    
                    drawPoints.push(normalizedPoints[0][0], -normalizedPoints[0][1], -normalizedPoints[0][2],
                                    normalizedPoints[1][0], -normalizedPoints[1][1], -normalizedPoints[1][2],
                                    normalizedPoints[2][0], -normalizedPoints[2][1], -normalizedPoints[2][2]      
                                    );
                    drawColors.push(faceColor[0], faceColor[1], faceColor[2],
                                    faceColor[0], faceColor[1], faceColor[2],
                                    faceColor[0], faceColor[1], faceColor[2]    
                                    );
                    if(normalizedPoints.length == 6){
                        drawPoints.push(normalizedPoints[3][0], -normalizedPoints[3][1], -normalizedPoints[0][2],
                                        normalizedPoints[4][0], -normalizedPoints[4][1], -normalizedPoints[1][2],
                                        normalizedPoints[5][0], -normalizedPoints[5][1], -normalizedPoints[2][2]
                                        );
                        drawColors.push(faceColor[0], faceColor[1], faceColor[2],
                                        faceColor[0], faceColor[1], faceColor[2],
                                        faceColor[0], faceColor[1], faceColor[2]    
                                        );
                    }
                    
                }
                
            }
        }
    }

    // Render scene
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(drawPoints, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(drawColors, 3));

    const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
    
    // Wireframe
    if(keysToggle.has("KeyF")){
        material.wireframe = true;
    }    
        
    let triangle = new THREE.Mesh(geometry, material);
    scene.add(triangle);
    renderer.render(scene, camera);

    // FPS
    d = new Date();
    const currentTime = d.getTime()/1000;
    frames++;
    if(currentTime - lastTime > 1){
        lastTime = currentTime;
        fps = frames/1;
        frames = 0;
    }
    informationTab.push("FPS: " + fps);

    // Information
    if(keysToggle.has("KeyQ")){
        informationTab.push("Objects: " + objects.length);
        informationTab.push("XYZ: " + parseInt(tx) + "," + parseInt(ty) + "," + parseInt(tz));
        informationTab.push("angle X: " + parseInt((angleY / (Math.PI / 180)) % 360));
        informationTab.push("angle Y: " + parseInt(angleX / (Math.PI / 180)));
        informationTab.push("zFar zNear: " + zFar + "," + zNear);
        informationTab.push("FOV: " + FOV);
        informationTab.push("Keys: " + Array.from(keysPressed).join(' '));

        for (let m = 0; m < informationTab.length; m++){
            informationPre.innerHTML += informationTab[m] + "\n";
        }
        informationTab = [];
    }


    // Call animation
    if(!keysPressed.has("KeyX")){
        requestAnimationFrame(draw);
    }
}

requestAnimationFrame(draw);

// Functions

// Key down
function keyLoop(projectionMatrixInvers, rotateMatrixInvers) {
    let d = [0, 0, 0, 0];
    if (keysPressed.has("KeyW")) {
        d = [0, 0, 0.1, 0];
    }
    else if (keysPressed.has("KeyS")) {
        d = [0, 0, -0.1, 0];
    }
    if (keysPressed.has("KeyA")) {
        d = [0.1, 0, 0, 0];
    }
    else if (keysPressed.has("KeyD")) {
        d = [-0.1, 0, 0, 0];
    }
    if (keysPressed.has("ShiftLeft")) {
        ty -= 0.1;
    }
    else if (keysPressed.has("Space")) {
        ty += 0.1;
    }
    if (keysPressed.has("KeyC")) {
        console.clear();
    }

    let dr = Vector4d.dot(projectionMatrixInvers, d);
    let dw = Vector4d.dot(rotateMatrixInvers, dr);
    tx += dw[0];
    tz += dw[2];
}

// Load object
function loadObject(object){
    let vertices = [];
    let triangleObjects = [];
    const lines = object.split("\n"); 
    for (let i = 0; i < lines.length; i++){
        if(lines[i].charAt(0) == "v"){
            const vertex = lines[i].split(" ");
            vertices.push([vertex[1],vertex[2],vertex[3]]);
        }else if(lines[i].charAt(0) == "f"){
            let face = lines[i].split(" ");
            let point1 = vertices[parseInt(face[1]) - 1];
            let point2 = vertices[parseInt(face[2]) - 1];
            let point3 = vertices[parseInt(face[3]) - 1]
            triangleObjects.push(new Triangle(parseFloat(point1[0]),parseFloat(point1[1]),parseFloat(point1[2]),parseFloat(point2[0]),parseFloat(point2[1]),parseFloat(point2[2]),parseFloat(point3[0]),parseFloat(point3[1]),parseFloat(point3[2])));
        }    
    }
    objects.push(new Entity(triangleObjects));
}

// Events
document.onkeydown = function(e){
    keysPressed.add(e.code);

    if (!keysToggle.has(e.code)) {
        keysToggle.add(e.code);
    } else if (keysToggle.has(e.code)) {
        keysToggle.delete(e.code);
    }
};

document.onkeyup = function(e){
    keysPressed.delete(e.code);
};

document.onpointermove = function (e) {
    if (Math.cos(angleX - e.movementY / 100) > 0) {
        angleX -= e.movementY / 100;
    }
    else if (Math.cos(angleX) < 0) {
        if (e.movementY < 0) {
            angleX = 3 * Math.PI / 2;
        } else {
            angleX = Math.PI / 2;
        }
    }
    angleY += e.movementX / 100;
};

canvas.addEventListener("click", async () => {
    canvas.requestPointerLock();
});