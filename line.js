let ctx = document.getElementById("canvas").getContext("2d");
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;
ctx.font = "18px Source Code Pro";

let a = canvas.height/ canvas.width;
let FOV = 70;
let f = 1 / Math.tan( (FOV * Math.PI / 180) /2); 
let zFar = 10;
let zNear = 1;
let q = zFar / (zFar - zNear);

let tx = 0;
let ty = 0;
let tz = 0;

let angleX = 0;
let angleY = 180 * Math.PI / 180;

let keysPressed = new Set(); 
let keysToggle = new Set(); 



class Triangle {

    constructor(x1, y1, x2, y2, x3, y3) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
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
let testTriangle = new Triangle(1,1,2,2,1,3);


let objects = [];

let box = {
    points: [
        [-1, -1, 10, 1 ],
        [ 1, -1, 10, 1 ],
        [ 1,  1, 10, 1 ],
        [-1,  1, 10, 1 ],
        [-1, -1, 8,  1 ],
        [ 1, -1, 8,  1 ],
        [ 1,  1, 8,  1 ],
        [-1,  1, 8,  1 ]
        ],
        projectionPoints: [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0]
        ],
        draw: function() {
            
            for ( let numLines = 0; numLines < 4; numLines++ ) {
                line(this.projectionPoints[numLines], this.projectionPoints[(numLines+1)%4]);
                line(this.projectionPoints[numLines+4], this.projectionPoints[(numLines+5)%4+4]);
                line(this.projectionPoints[numLines], this.projectionPoints[numLines+4]);
            }
        }
};
//objects.push(box);

let direction = {
    points: [
        [0, 0, 0, 1 ],
        [5, 0, 0, 1 ],
        [0, 5, 0, 1 ],
        [0, 0, 5, 1 ]
        ],
        projectionPoints: [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0]
        ],
        draw: function() {
            
            for ( let numLines = 0; numLines < 4; numLines++ ) {
                line(this.projectionPoints[0], this.projectionPoints[numLines]);
            }
            ctx.fillText("X", this.projectionPoints[1][0], this.projectionPoints[1][1]);
            ctx.fillText("Y", this.projectionPoints[2][0], this.projectionPoints[2][1]);
            ctx.fillText("Z", this.projectionPoints[3][0], this.projectionPoints[3][1]);
        }
};
objects.push(direction);

let testLine = {
    points: [
        [2, 1, 5, 1],
        [4, 1, 5, 1]
        ],
        projectionPoints: [
            [0, 0],
            [0, 0]
        ],
        draw: function() {
                line(this.projectionPoints[0], this.projectionPoints[1]);
        }
};
objects.push(testLine);







function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let cosX = Math.cos(angleX);
    let cosY = Math.cos(angleY);
    let sinX = Math.sin(angleX);
    let sinY = Math.sin(angleY);

    let projectionMatrix = [
        [a * f, 0,  0,       0],
        [0,     f, 0,       0],
        [0,     0,  q,       1],
        [0,     0,  zNear*q, 0]
    ];

    let projectionMatrixInvers = [
        [1/(a * f), 0,   0,   0],
        [0,          1/f, 0,   0],
        [0,          0,   1/q, 0],
        [0,          0,   0,   0]
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

    for(let i = 0; i < objects.length; i++ ){

        let normalizedPoints = [];
        let pointsInsideView = 0;
        
        for(let j = 0; j < objects[i].points.length; j++) { 
            
            let translation = matrixMultipliation(translationMatrix, objects[i].points[j]);
            let rotate = matrixMultipliation(rotateMatrix,translation);
            let normalizedProjection = matrixMultipliation(projectionMatrix, rotate);

            if (normalizedProjection[3] != 0){

                let x = normalizedProjection[0] / normalizedProjection[3];
                let y = normalizedProjection[1] / normalizedProjection[3];
                let z = normalizedProjection[2] / normalizedProjection[3];

                normalizedPoints.push([x,y,z]);

                if ( x > -1 && x < 1 && y > -1 && y < 1 && z < 1 && z > -1){
                    pointsInsideView++; 
                }
            }
        }

        if ( pointsInsideView > 0){
            for ( k = 0; k < normalizedPoints.length; k++ ){

                let x = normalizedPoints[k][0];
                let y = normalizedPoints[k][1];
                let z = normalizedPoints[k][2];
                
                if ( x > -1 && x < 1 && y > -1 && y < 1 && z < 1 && z > -1){
                    
                    x =  (( x + 1 ) * canvas.width / 2);
                    y =  (( y + 1 ) * canvas.height / 2);

                    objects[i].projectionPoints[k] = [x,y];
                }else{
                    let nextPoint = 0;
                    if (k == 0){
                        nextPoint = 1;
                    }

                    let x2 = normalizedPoints[nextPoint][0];
                    let y2 = normalizedPoints[nextPoint][1];
                    let z2 = normalizedPoints[nextPoint][2];
                    
                    let intersection = pointOfIntersectionPlane([x,y,z],[x2,y2,z2]);

                    if ( intersection != false ){
                        x =  (( intersection[0] + 1 ) * canvas.width / 2);
                        y =  (( intersection[1] + 1 ) * canvas.height / 2);

                        objects[i].projectionPoints[k] = [x,y];
                    }
                }

            }
            objects[i].draw();
        }
    }

    if (keysToggle.has("KeyQ")){
        ctx.fillText("XYZ: " + parseInt(-tx) + "," + parseInt(-ty) + "," + parseInt(-tz), 10, 20);
        ctx.fillText("angle X: " + parseInt((angleY / (Math.PI / 180)) % 360), 10, 40);
        ctx.fillText("angle Y: " + parseInt(angleX / (Math.PI / 180)), 10, 60);
        ctx.fillText("zFar zNear: " + zFar + "," + zNear, 10, 80);
        ctx.fillText("FOV: " + FOV, 10, 100);
        ctx.fillText("Keys: " + Array.from(keysPressed).join(' '), 10, 120);
        
    }
    

    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);





function pointOfIntersectionPlane(p1,p2){
    let lineV = [p2[0]-p1[0], p2[1]-p1[1], p2[2]-p1[2]];

    let PpList = [[[-1,0,0],[1,0,0]],[[0,-1,0],[0,1,0]],[[0,0,1],[0,0,-1]]];
    let PnList = [[[1,0,0],[-1,0,0]],[[0,1,0],[0,-1,0]],[[0,0,-1],[0,0,1]]];

    let intersectionCheckIndex = 0;

    while(intersectionCheckIndex < 3){

        let direction = 0;
        if (lineV[intersectionCheckIndex] < 0){
            direction = 1;
        } 

        let sent = false;
        
        let Pp = PpList[intersectionCheckIndex][direction];
        let Pn = PnList[intersectionCheckIndex][direction]; 

        let dotProduct = lineV[0] * Pn[0] + lineV[1] * Pn[1] + lineV[2] * Pn[2];

        if (dotProduct != 0){
            let t = ((Pp[0]-p1[0])*Pn[0] + (Pp[1]-p1[1])*Pn[1] + (Pp[2]-p1[2])*Pn[2]) / dotProduct;

            let instersectionPoint = [p1[0]+lineV[0]*t, p1[1]+lineV[1]*t, p1[2]+lineV[2]*t];

            if ( intersectionCheckIndex == 0
                && instersectionPoint[0] >= -1 && instersectionPoint[0] <= 1
                && instersectionPoint[1] >= -1 && instersectionPoint[1] <= 1 )
            {
                intersectionCheckIndex = 6;
                sent = true;
                return instersectionPoint;
            }

            else if ( intersectionCheckIndex == 1
                      && instersectionPoint[2] >= -1 && instersectionPoint[2] <= 1
                      && instersectionPoint[0] >= -1 && instersectionPoint[0] <= 1 )
            {
                intersectionCheckIndex = 6;
                sent = true;
                return instersectionPoint;
            }

            else if ( intersectionCheckIndex == 2
                && instersectionPoint[1] >= -1 && instersectionPoint[1] <= 1
                && instersectionPoint[2] >= -1 && instersectionPoint[2] <= 1 )
            {
                intersectionCheckIndex = 6;
                sent = true;
                return instersectionPoint;
            }

            intersectionCheckIndex++;
        }
        if ( sent == false) {
            return false;
        }
    }
}


document.addEventListener("keydown", (event) => {
    keysPressed.add(event.code);
    
    if (!keysToggle.has("KeyQ")){
        keysToggle.add(event.code);
    }else if ( keysToggle.has("KeyQ") ){
        keysToggle.delete(event.code);
    }
});
 
 document.addEventListener("keyup", (event) => {
    keysPressed.delete(event.code);
});
 
canvas.addEventListener("click", async () => {
    await canvas.requestPointerLock();
});

document.addEventListener('mousemove', function(e){
    if ( Math.cos(angleX + e.movementY / 100) > 0 ){
        angleX += e.movementY / 100;
    } 
    else if ( Math.cos(angleX) < 0 ) {
        if ( e.movementY < 0 ) {
            angleX = 3*Math.PI/2;
        }else{
            angleX = Math.PI/2;
        }
    }
    angleY -= e.movementX / 100;
});



function keyLoop(projectionMatrixInvers, rotateMatrixInvers) {
    let d = [0,0,0,0];
    if (keysPressed.has("KeyW")) {
        d = [0,0,0.1,0];
    }
    else if (keysPressed.has("KeyS")){
        d = [0,0,-0.1,0];
    }
    if (keysPressed.has("KeyA")) {
        d = [-0.1,0,0,0];
    }
    else if (keysPressed.has("KeyD")){
        d = [0.1,0,0,0];
    }
    if (keysPressed.has("ShiftLeft")) {
        ty += 0.1;
    }
    else if (keysPressed.has("Space")){
        ty -= 0.1;
    }

    let dr = matrixMultipliation(projectionMatrixInvers, d);
    let dw = matrixMultipliation(rotateMatrixInvers, dr);
    tx += dw[0];
    tz += dw[2];
}

function matrixMultipliation(projection,vertex) {
    let result = [];
    for(let v = 0; v < projection.length; v++){
        result.push(projection[v][0] * vertex[0] + projection[v][1] * vertex[1] + projection[v][2] * vertex[2] + projection[v][3] * vertex[3]);
    }
    
    return result;
}

function point(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
    ctx.fill();
}

function line( p1, p2) {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
}
