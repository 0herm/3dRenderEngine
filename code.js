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

// Space ship
let vert = [
    [ 1.000000,-1.000000,-1.000000],
    [ 1.000000, 1.000000,-1.000000],
    [ 1.000000,-1.000000, 1.000000],
    [ 1.000000, 1.000000, 1.000000],
    [-1.000000,-1.000000,-1.000000],
    [-1.000000, 1.000000,-1.000000],
    [-1.000000,-1.000000, 1.000000],
    [-1.000000, 1.000000, 1.000000],
    [-0.720000, 0.120000,-1.400000],
    [ 0.300000, 0.000000, 5.000000],
    [-0.600000,-0.600000,-1.400000],
    [-0.300000, 0.000000, 5.000000],
    [-1.200000, 0.200000, 1.000000],
    [-0.600000, 0.600000,-1.400000],
    [-1.200000,-0.200000,-1.000000],
    [-1.200000, 0.200000,-1.000000],
    [ 1.200000,-0.200000, 1.000000],
    [ 1.200000,-0.200000,-1.000000],
    [ 1.200000, 0.200000,-1.000000],
    [ 1.200000, 0.200000, 1.000000],
    [-1.200000,-0.200000, 1.000000],
    [ 0.600000, 0.600000,-1.400000],
    [ 0.600000,-0.600000,-1.400000],
    [-4.200000, 0.060000, 1.000000],
    [-4.200000,-0.060000, 1.000000],
    [-4.200000,-0.060000,-1.000000],
    [-4.200000, 0.060000,-1.000000],
    [ 4.200000,-0.060000, 1.000000],
    [ 4.200000,-0.060000,-1.000000],
    [ 4.200000, 0.060000,-1.000000],
    [ 4.200000, 0.060000, 1.000000],
    [ 4.200000,-0.180000, 1.000000],
    [ 4.200000,-0.180000,-1.000000],
    [ 4.200000, 0.180000,-1.000000],
    [ 4.200000, 0.180000, 1.000000],
    [ 4.500000,-0.180000, 1.000000],
    [ 4.500000,-0.180000,-1.000000],
    [ 4.500000, 0.180000,-1.000000],
    [ 4.500000, 0.180000, 1.000000],
    [-4.200000, 0.180000, 1.000000],
    [-4.200000,-0.180000, 1.000000],
    [-4.200000,-0.180000,-1.000000],
    [-4.200000, 0.180000,-1.000000],
    [-4.500000, 0.180000, 1.000000],
    [-4.500000,-0.180000, 1.000000],
    [-4.500000,-0.180000,-1.000000],
    [-4.500000, 0.180000,-1.000000],
    [ 4.350000,-0.180000, 3.000000],
    [ 4.350000, 0.180000, 3.000000],
    [-4.350000, 0.180000, 3.000000],
    [-4.350000,-0.180000, 3.000000],
    [ 0.000000,-0.700000, 3.000000],
    [-0.720000,-0.120000,-1.400000],
    [ 0.720000,-0.120000,-1.400000],
    [ 0.720000, 0.120000,-1.400000],
]
let faces = [
    [21,52,12],
    [6,13,8],
    [5,23,1],
    [7,1,3],
    [4,6,8],
    [4,12,10],
    [17,20,10],
    [20,4,10],
    [17,52,3],
    [7,3,52],
    [16,14,9],
    [7,15,5],
    [20,30,19],
    [18,23,54],
    [4,19,2],
    [1,17,3],
    [13,25,21],
    [13,21,12],
    [12,52,10],
    [8,13,12],
    [27,42,43],
    [15,27,16],
    [21,26,15],
    [16,24,13],
    [31,34,30],
    [18,28,17],
    [17,31,20],
    [19,29,18],
    [32,49,35],
    [29,32,28],
    [31,32,35],
    [29,34,33],
    [38,36,37],
    [34,37,33],
    [35,38,34],
    [33,36,32],
    [43,44,40],
    [25,42,26],
    [27,40,24],
    [25,40,41],
    [44,46,45],
    [40,44,50],
    [42,47,43],
    [41,46,42],
    [44,47,46],
    [32,36,48],
    [39,35,49],
    [39,48,36],
    [45,51,50],
    [40,51,41],
    [45,41,51],
    [45,50,44],
    [18,29,28],
    [17,28,31],
    [4,2,6],
    [18,55,19],
    [15,11,5],
    [19,22,2],
    [2,14,6],
    [16,53,15],
    [53,9,54],
    [19,30,29],
    [15,26,27],
    [16,27,24],
    [13,24,25],
    [21,25,26],
    [7,21,15],
    [7,5,1],
    [21,7,52],
    [1,18,17],
    [17,10,52],
    [4,20,19],
    [20,31,30],
    [4,8,12],
    [43,47,44],
    [6,16,13],
    [40,50,51],
    [41,45,46],
    [42,46,47],
    [2,22,14],
    [19,55,22],
    [18,54,55],
    [18,1,23],
    [5,11,23],
    [15,53,11],
    [16,9,53],
    [16,6,14],
    [9,14,22],
    [22,55,9],
    [55,54,9],
    [54,23,11],
    [11,53,54],
    [34,38,37],
    [38,39,36],
    [39,49,48],
    [35,39,38],
    [33,37,36],
    [25,41,42],
    [27,43,40],
    [31,35,34],
    [29,33,32],
    [32,48,49],
    [27,26,42],
    [31,28,32],
    [29,30,34],
    [25,24,40],
]

for (let index = 0; index < faces.length; index++){
    let point1 = vert[faces[index][0] - 1];
    let point2 = vert[faces[index][1] - 1];
    let point3 = vert[faces[index][2] - 1];

    objects.push(new Triangle(point1[0]+ 25,point1[1]+ 25,point1[2]+ 25,point2[0]+ 25,point2[1]+ 25,point2[2]+ 25,point3[0]+ 25,point3[1]+ 25,point3[2]+ 25));
}



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
                if(keysPressed.has("KeyF") == false){
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
document.addEventListener("keydown", (event) => {
    keysPressed.add(event.code);

    if (!keysToggle.has("KeyQ") && event.code == "KeyQ") {
        keysToggle.add(event.code);
    } else if (keysToggle.has("KeyQ") && event.code == "KeyQ") {
        keysToggle.delete(event.code);
    }
});

document.addEventListener("keyup", (event) => {
    keysPressed.delete(event.code);
});

canvas.addEventListener("click", async () => {
    await canvas.requestPointerLock();
});

document.addEventListener('mousemove', function (e) {
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
});




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