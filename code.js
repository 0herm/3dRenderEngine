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
let tx = 0;
let ty = 0;
let tz = 10;

// Camera angle
let angleX = 0;
let angleY = 180 * Math.PI / 180;

let keysPressed = new Set();
let keysToggle = new Set();

class Triangle {

    constructor(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        this.points = [
            [x1,y1,z1,1],
            [x2,y2,z2,1],
            [x3,y3,z3,1]
        ]
        this.projectionPoints = [
            [0, 0],
            [0, 0],
            [0, 0]
        ]
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.projectionPoints[0][0], this.projectionPoints[0][1]);
        ctx.lineTo(this.projectionPoints[1][0], this.projectionPoints[1][1]);
        ctx.lineTo(this.projectionPoints[2][0], this.projectionPoints[2][1]);
        ctx.fill();
    }
}

// Objects

let objects = [];

let directionX = {
    points: [
        [0, 0, 0, 1],
        [5, 0, 0, 1]
    ],
    draw: function (points) {
        line(points[0], points[1]);
        ctx.fillText("X", points[1][0], points[1][1]);
    }
};
objects.push(directionX);

let directionY = {
    points: [
        [0, 0, 0, 1],
        [0, 5, 0, 1]
    ],
    draw: function (points) {
        line(points[0], points[1]);
        ctx.fillText("Y", points[1][0], points[1][1]);
    }
};
objects.push(directionY);

let directionZ = {
    points: [
        [0, 0, 0, 1],
        [0, 0, 5, 1]
    ],
    draw: function (points) {
        line(points[0], points[1]);
        ctx.fillText("Z", points[1][0], points[1][1]);
    }
};
objects.push(directionZ);


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        for (k = 0; k <  objects[i].points.length; k++) {
            
            let point1 = { 
                x: objects[i].points[k][0],
                y: objects[i].points[k][1],
                z: objects[i].points[k][2],
                w: objects[i].points[k][3] 
            };

            let normalV = [-cosX * sinY, sinX, cosY * cosX];
            let d = -(normalV[0] * tx + normalV[1] * ty + normalV[2] * tz);

            let distance =  (normalV[0]*point1.x + normalV[1]*point1.y + normalV[2]*point1.z + d) / 
                            ((normalV[0]**2 + normalV[1]**2 + normalV[2]**2)**0.5);

            if (distance < 0){
                let nextPoint = (k + 1) % 2;
                
                let point2 = { 
                    x: objects[i].points[nextPoint][0],
                    y: objects[i].points[nextPoint][1], 
                    z: objects[i].points[nextPoint][2], 
                    w: objects[i].points[nextPoint][3] 
                };

                let distancePoint2 =    (normalV[0]*point2.x + normalV[1]*point2.y + normalV[2]*point2.z + d) / 
                                        ((normalV[0]**2 + normalV[1]**2 + normalV[2]**2)**0.5);
                
                if (distancePoint2 > 0) {   
                    let nearPlane = [
                        normalV[0] - 0.0001,
                        normalV[1] - 0.0001,
                        normalV[2] - 0.0001,
                        d
                    ];   
            
                    let intersection = linePlaneIntersection(point1, point2, nearPlane);
                    if (intersection != null) {
                        if (intersection){
                            let x = intersection.x;
                            let y = intersection.y;
                            let z = intersection.z;
                            let w = 1;
                            depthClippedPoints.push([x, y, z, w]);
                        } 
                    }
                }
            }else{
                depthClippedPoints.push([point1.x, point1.y, point1.z, point1.w]);
            }

            if (i == 1 && k == 1 && keysToggle.has("KeyQ")){
                ctx.fillText("cPos: x:" + tx + " y:" + ty + " z:" + tz, 10, 200);
                ctx.fillText("nVect: x:" + normalV[0] + " y:" + normalV[1] + " z:" + normalV[2], 10, 220);
                if(depthClippedPoints.length > 1){
                    ctx.fillText("point1: x:" + depthClippedPoints[0][0] + " y:" + depthClippedPoints[0][1] + " z:" + depthClippedPoints[0][2], 10, 240);
                    ctx.fillText("point1: x:" + depthClippedPoints[1][0] + " y:" + depthClippedPoints[1][1] + " z:" + depthClippedPoints[1][2], 10, 260);
                }else if(depthClippedPoints.length != 0){
                    ctx.fillText("point1: x:" + depthClippedPoints[0][0] + " y:" + depthClippedPoints[0][1] + " z:" + depthClippedPoints[0][2], 10, 240);
                }
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
        for (l = 0; l < normalizedPoints.length; l++){

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
        ctx.fillText("XYZ: " + parseInt(-tx) + "," + parseInt(-ty) + "," + parseInt(-tz), 10, 20);
        ctx.fillText("angle X: " + parseInt((angleY / (Math.PI / 180)) % 360), 10, 40);
        ctx.fillText("angle Y: " + parseInt(angleX / (Math.PI / 180)), 10, 60);
        ctx.fillText("zFar zNear: " + zFar + "," + zNear, 10, 80);
        ctx.fillText("FOV: " + FOV, 10, 100);
        ctx.fillText("Keys: " + Array.from(keysPressed).join(' '), 10, 120);

        ctx.fillText("P:X: " + sinY * cosX, 10, 140);
        ctx.fillText("P:Y: " + sinX * cosY, 10, 160);
        ctx.fillText("P:Z: " + cosY, 10, 180);
    }
    
    // Call animation
    if (!keysToggle.has("KeyX")){
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

    if (!keysToggle.has("KeyQ")) {
        keysToggle.add(event.code);
    } else if (keysToggle.has("KeyQ")) {
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