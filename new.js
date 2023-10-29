let ctx = document.getElementById("canvas").getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
ctx.font = "18px Source Code Pro";

// Camera projection
const a = canvas.height / canvas.width;
const FOV = 70;
const f = 1 / Math.tan((FOV * Math.PI / 180) / 2);
const zFar = 10;
const zNear = 1;
const q = zFar / (zFar - zNear);

// Camera pos 
let tx = 10;
let ty = 10;
let tz = 10;

// Camera angle
let angleX = 0;
let angleY = 320 * Math.PI / 180;

// Button Pressed
let keysPressed = new Set();
let keysToggle = new Set();


// Triangle object
class Triangle {
    constructor(x1, y1, z1, x2, y2, z2, x3, y3, z3, color = "lightgray") {
        this.points = [
            [x1, y1, z1, 1],
            [x2, y2, z2, 1],
            [x3, y3, z3, 1]
        ];
        this.color = color;
    }
}


// Objects
let objects = [];

objects.push(new Triangle(0,0,0,0,0,100,100,0,0,"gray"));
objects.push(new Triangle(0,0,100,100,0,100,100,0,0,"gray"));

// Load objects
//loadObject("terrain.txt");
loadObject("spaceShip.txt");


function draw() {
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let informationTab = []; 
    
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
        
        let depthClippedPoints = [];
        let normalizedPoints = [];
        let projectionPoints = [];
        
        // Depth Clipping Z
        let A = { 
            x: objects[i].points[0][0],
            y: objects[i].points[0][1],
            z: objects[i].points[0][2],
            w: objects[i].points[0][3] 
        };

        let B = { 
            x: objects[i].points[1][0],
            y: objects[i].points[1][1],
            z: objects[i].points[1][2],
            w: objects[i].points[1][3] 
        };

        let C = { 
            x: objects[i].points[2][0],
            y: objects[i].points[2][1],
            z: objects[i].points[2][2],
            w: objects[i].points[2][3] 
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
                let intersectionAC = linePlaneIntersection(infront[0], behind[0], nearPlane);
                let intersectionBC = linePlaneIntersection(infront[1], behind[0], nearPlane);

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
                let intersectionAB = linePlaneIntersection(infront[0], behind[0], nearPlane);
                let intersectionAC = linePlaneIntersection(infront[0], behind[1], nearPlane);

                if (intersectionAB != null && intersectionAC != null) {
                    depthClippedPoints.push([infront[0].x, infront[0].y, infront[0].z, 1]);
                    depthClippedPoints.push([intersectionAB.x, intersectionAB.y, intersectionAB.z, 1]);
                    depthClippedPoints.push([intersectionAC.x, intersectionAC.y, intersectionAC.z, 1]);
                }
            }  

            // Matrix multiplications
            for (let j = 0; j < depthClippedPoints.length; j++) {
                let translation = matrixMultipliation(translationMatrix, depthClippedPoints[j]);
                let rotate = matrixMultipliation(rotateMatrix, translation);
                let projection = matrixMultipliation(projectionMatrix, rotate);
            
                if (projection[3] < 0) {
        
                    let x = projection[0] / projection[3];
                    let y = projection[1] / projection[3];
                    let z = projection[2] / projection[3];
                    
                    normalizedPoints.push([x,y,z]);
                }
            }

            // Clipping X, Y
            for (let l = 0; l < normalizedPoints.length; l++){

                let x = normalizedPoints[l][0];
                let y = normalizedPoints[l][1];

                projectionPoints.push([ ((x + 1) * canvas.width / 2) , ((y + 1) * canvas.height / 2) ]);

            }

            // Draw
            if( projectionPoints.length >= 3){
                ctx.fillStyle = objects[i].color;

                // Wireframe
                if(keysToggle.has("KeyF") == false){
                    ctx.strokeStyle = objects[i].color;
                }else{
                    ctx.strokeStyle = "black";
                }
                
                // Draw triangles
                if(projectionPoints.length >= 3){
                    ctx.beginPath();
                    ctx.moveTo(projectionPoints[0][0], projectionPoints[0][1]);
                    ctx.lineTo(projectionPoints[1][0], projectionPoints[1][1]);
                    ctx.lineTo(projectionPoints[2][0], projectionPoints[2][1]);
                    ctx.fill();
                    ctx.closePath();
                    ctx.stroke();
                }
                if(projectionPoints.length == 6){
                    ctx.beginPath();
                    ctx.moveTo(projectionPoints[3][0], projectionPoints[3][1]);
                    ctx.lineTo(projectionPoints[4][0], projectionPoints[4][1]);
                    ctx.lineTo(projectionPoints[5][0], projectionPoints[5][1]);
                    ctx.fill();
                    ctx.closePath();
                    ctx.stroke();
                }
            }
        }
    }
    
    // Information
    if(keysToggle.has("KeyQ")){
        informationTab.push("XYZ: " + parseInt(tx) + "," + parseInt(ty) + "," + parseInt(tz));
        informationTab.push("angle X: " + parseInt((angleY / (Math.PI / 180)) % 360));
        informationTab.push("angle Y: " + parseInt(angleX / (Math.PI / 180)));
        informationTab.push("zFar zNear: " + zFar + "," + zNear);
        informationTab.push("FOV: " + FOV);
        informationTab.push("Keys: " + Array.from(keysPressed).join(' '));

        informationTab.push("c: clear console");
        informationTab.push("f: wireframe");
        informationTab.push("v: fly");
        
        for (let m = 0; m < informationTab.length; m++){
            ctx.fillStyle = "black";
            ctx.fillText(informationTab[m], 10, (m+1)*20);
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

// Intersections
function linePlaneIntersection(p1, p2, plane) {
    let [a,b,c,d] = plane;
    
    let denominator = a * (p2.x - p1.x) + b * (p2.y - p1.y) + c * (p2.z - p1.z);
    
    if (denominator == 0) {
      return null;
    }
    
    let t = -(a * p1.x + b * p1.y + c * p1.z + d) / denominator;
  
    let intersectionPoint = {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y),
      z: p1.z + t * (p2.z - p1.z),
    };

    return intersectionPoint;
}

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

    let dr = matrixMultipliation(projectionMatrixInvers, d);
    let dw = matrixMultipliation(rotateMatrixInvers, dr);
    tx += dw[0];
    tz += dw[2];
}

// Matrix Multipliation
function matrixMultipliation(projection, vertex) {
    let result = [];
    
    for (let v = 0; v < projection.length; v++) {
        result.push(projection[v][0] * vertex[0] + 
                    projection[v][1] * vertex[1] + 
                    projection[v][2] * vertex[2] + 
                    projection[v][3] * vertex[3]);
    }

    return result;
}

// Draw line
function line(p1, p2) {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
}

// Events
document.onkeydown = function(e){
    keysPressed.add(event.code);

    if (!keysToggle.has(event.code)) {
        keysToggle.add(event.code);
    } else if (keysToggle.has(event.code)) {
        keysToggle.delete(event.code);
    }
};

document.onkeyup = function(e){
    keysPressed.delete(event.code);
};

document.onclick = async () => {
    await canvas.requestPointerLock();
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

// Load file
function loadFile(fileURL, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback(xhr.responseText);
      }
    };
    xhr.open("GET", fileURL, true);
    xhr.send();
}

// Load object
function loadObject(file){
    loadFile(file, function (fileContent) {
        let vertices = [];
        const lines = fileContent.split("\n"); 
        for (let i = 0; i < lines.length; i++){
            if(lines[i].charAt(0) == "v"){
                const vertex = lines[i].split(" ");
                vertices.push([vertex[1],vertex[2],vertex[3]]);
            }else if(lines[i].charAt(0) == "f"){
                let face = lines[i].split(" ");
                let point1 = vertices[parseInt(face[1]) - 1];
                let point2 = vertices[parseInt(face[2]) - 1];
                let point3 = vertices[parseInt(face[3]) - 1];

                objects.push(new Triangle(parseFloat(point1[0]),parseFloat(point1[1]),parseFloat(point1[2]),parseFloat(point2[0]),parseFloat(point2[1]),parseFloat(point2[2]),parseFloat(point3[0]),parseFloat(point3[1]),parseFloat(point3[2])));
            }    
        }
    });
}
// Light ray
        /*    
            const sunVector = [0,-1,0]; 
            
            if(depthClippedPoints.length >= 3){
                // Light ray
                const U = {
                    x: depthClippedPoints[1][0] - depthClippedPoints[0][0],
                    y: depthClippedPoints[1][1] - depthClippedPoints[0][1],
                    z: depthClippedPoints[1][2] - depthClippedPoints[0][2]
                };
                const V = {
                    x: depthClippedPoints[2][0] - depthClippedPoints[0][0],
                    y: depthClippedPoints[2][1] - depthClippedPoints[0][1],
                    z: depthClippedPoints[2][2] - depthClippedPoints[0][2]
                };
                const Nx = (U.y * V.z) - (U.z * V.y);
                const Ny = (U.z * V.x) - (U.x * V.z);
                const Nz = (U.x * V.y) - (U.y * V.x);
                const magnitude = (Nx**2 + Ny**2 + Nz**2)**0.5;
                const N = [Nx/magnitude, Ny/magnitude, Nz/magnitude];
                let result = 0;
                for (let i = 0; i < 3; i++) {
                    result += N[i] * sunVector[i];
                } 
                const R = 255/Math.abs(result-1);
                lightShade = `rgb(${R},${R},${R})`;
            }*/