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
        [a * f, 0,  0,       0],
        [0,     f,  0,       0],
        [0,     0,  q,       1],
        [0,     0,  zNear*q, 0]
    ];

    let projectionMatrixInvers = [
        [1/projectionMatrix[0][0],  0,                        0,                        0],
        [0,                         1/projectionMatrix[1][1], 0,                        0],
        [0,                         0,                        1/projectionMatrix[2][2], 0],
        [0,                         0,                        0,                        0]
    ];
    
    let translationMatrix = [
        [1, 0, 0, tx],
        [0, 1, 0, ty],
        [0, 0, 1, tz],
        [0, 0, 0, 1 ]
    ];

    let rotateMatrix = [
        [cosY,       0,    sinY,       0],
        [sinX*sinY,  cosX, -sinX*cosY, 0],
        [-cosX*sinY, sinX, cosX*cosY,  0],
        [0,          0,    0,          1]
    ];

    let rotateMatrixInvers = [
        [rotateMatrix[0][0],  rotateMatrix[1][0], rotateMatrix[2][0], 0],
        [rotateMatrix[0][1],  rotateMatrix[1][1], rotateMatrix[2][1], 0],
        [rotateMatrix[0][2],  rotateMatrix[1][2], rotateMatrix[2][2], 0],
        [0,                   0,                  0,                  0]
    ];

    keyLoop(projectionMatrixInvers, rotateMatrixInvers);
    
    // Every object
    for (let i = 0; i < objects.length; i++) {
        
        let depthClippedPoints = [];
        let normalizedPoints = [];
        let projectionPoints = [];
        
        // Depth Clipping
        for (k = 0; k <  objects[i].points.length; k++) {
            
            let point1 = { 
                x: frustumPoints[k][0],
                y: frustumPoints[k][1],
                z: frustumPoints[k][2],
                w: frustumPoints[k][3] 
            };
            
            if (point1.z < 0) {
                
                let x = point1.x / point1.w;
                let y = point1.y / point1.w;
                let z = point1.z / point1.w;
    
                normalizedPoints.push([x, y, z]);
    
            } else {
                
                let nextPoint = (k + 1) % 2;
                
                let point2 = { 
                    x: frustumPoints[nextPoint][0],
                    y: frustumPoints[nextPoint][1], 
                    z: frustumPoints[nextPoint][2], 
                    w: frustumPoints[nextPoint][3] 
                };
                
                if (point2.z < 0) {

                    let d = -(sinY * cosX * tx + sinY * sinX * ty + cosY * tz)
        
                    let nearPlaneNormal = [
                        sinY * cosX * tx,
                        sinY * sinX * ty,
                        cosY * tz,
                        d
                    ]; 
        
                    let intersection = linePlaneIntersection(point1, point2, nearPlaneNormal);

                    if (intersection != null) {
                        if (intersection){

                            let x = intersection.x / (intersection.z-1);
                            let y = intersection.y / (intersection.z-1);
                            let z = intersection.z;

                            ctx.fillText("Nx: " + x, 10, 20);
                            ctx.fillText("Ny: " + y, 10, 40);
                            ctx.fillText("Nz: " + z, 10, 60);
                            ctx.fillText("W: " + (intersection.z-1), 10, 80);

                            ctx.fillText("x: " + intersection.x, 10, 100);
                            ctx.fillText("y: " + intersection.y, 10, 120);
                            ctx.fillText("z: " + intersection.z, 10, 140);
        
                            normalizedPoints.push([x, y, z]);
                        }   
                    }
                }
            }
        }

        // Matrix multiplications
        for (let j = 0; j < depthClippedPoints.length; j++) {
    
            let translation = matrixMultipliation(translationMatrix, depthClippedPoints[j]);
            let rotate = matrixMultipliation(rotateMatrix, translation);
            let projection = matrixMultipliation(projectionMatrix, rotate);
        
            frustumPoints.push(projection);
    
        }

        // Clipping
        for (l = 0; l < normalizedPoints.length; l++){

            let x = normalizedPoints[l][0];
            let y = normalizedPoints[l][1];
            let z = normalizedPoints[l][2];

            projectionPoints.push([ ((x + 1) * canvas.width / 2) , ((y + 1) * canvas.height / 2) ]);

        }

        // Draw
        if( projectionPoints.length > 0){
            //console.log(projectionPoints);
            objects[i].draw(projectionPoints);
        }
    }
    

    if (keysToggle.has("KeyQ")) {
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
    
    requestAnimationFrame(draw);
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
        d = [-0.1, 0, 0, 0];
    }
    else if (keysPressed.has("KeyD")) {
        d = [0.1, 0, 0, 0];
    }
    if (keysPressed.has("ShiftLeft")) {
        ty += 0.1;
    }
    else if (keysPressed.has("Space")) {
        ty -= 0.1;
    }
    else if (keysPressed.has("KeyC")) {
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
    if (Math.cos(angleX + e.movementY / 100) > 0) {
        angleX += e.movementY / 100;
    }
    else if (Math.cos(angleX) < 0) {
        if (e.movementY < 0) {
            angleX = 3 * Math.PI / 2;
        } else {
            angleX = Math.PI / 2;
        }
    }
    angleY -= e.movementX / 100;
});