let ctx = document.getElementById("canvas").getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
ctx.font = "18px Source Code Pro";

// Global vars 

let a = canvas.height / canvas.width;
let FOV = 70;
let f = 1 / Math.tan((FOV * Math.PI / 180) / 2);
let zFar = 10;
let zNear = 1;
let q = zFar / (zFar - zNear);

// Camera pos 
let tx = 10;
let ty = 10;
let tz = 10;

// Camera angle
let angleX = 0;
let angleY = 320 * Math.PI / 180;

let keysPressed = new Set();
let keysToggle = new Set();

class Triangle {
    constructor(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        this.points = [
            [x1, y1, z1, 1],
            [x2, y2, z2, 1],
            [x3, y3, z3, 1]
        ];
        this.draw = function (projectionPoints) {
            ctx.fillStyle = "gray";
            ctx.strokeStyle = "gray";
            
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
        };
    }
}
  
// Objects

let objects = [];

objects.push(new Triangle(0,0,0,0,0,100,100,0,0));
objects.push(new Triangle(100,0,100,0,0,100,100,0,0));


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
    
    let translationMatrix = [
        [1, 0, 0, -tx],
        [0, 1, 0, -ty],
        [0, 0, 1, -tz],
        [0, 0, 0, 1 ]
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
    
    // Every object
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
        let d = -(normalV[0] * tx + normalV[1] * ty + normalV[2] * tz);

        let nearPlane = [
            normalV[0] - 0.01,
            normalV[1] - 0.01,
            normalV[2] - 0.01,
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
        if( projectionPoints.length > 1){
            objects[i].draw(projectionPoints);
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
        
        for (let m = 0; m < informationTab.length; m++){
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

function intersectionView(p1, p2) {
    let cubePlanes = [
        [ 1,  0,  0, 1], // Right
        [-1,  0,  0, 1], // left
        [ 0,  1,  0, 1], // Top 
        [ 0, -1,  0, 1]  // Bottom
    ];

    let directions = [p1.x <= -1,p1.y <= -1];

    let intersectionIndex = 0;
    let intersectionPoints = [];

    while (intersectionIndex < 4) {

        let lineDirection = 0;
    
        if ( directions[Math.floor(intersectionIndex/2)] == false ){
            lineDirection = 1;
        }

        let pointOfIntersection = linePlaneIntersection(p1, p2, cubePlanes[intersectionIndex + lineDirection]);

        if (pointOfIntersection){
            let inPlaneX = pointOfIntersection.x <= 1 && pointOfIntersection.x >= -1;
            let inPlaneY = pointOfIntersection.y <= 1 && pointOfIntersection.y >= -1;
            let inPlaneZ = pointOfIntersection.z <= 1 && pointOfIntersection.z >= -1;
            
            if (inPlaneX && inPlaneY && inPlaneZ){
                intersectionPoints.push(pointOfIntersection);
            }
        }

        intersectionIndex += 2;
    }   

    return intersectionPoints;
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

// Draw line and point
function point(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
    ctx.fill();
}

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