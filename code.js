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
let t = new Triangle(1,1,2,2,1,3);


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
objects.push(box);

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

        let projectionP = [];
        
        for(let j = 0; j < objects[i].points.length; j++) { 
            
            let translation = matrixMultipliation(translationMatrix, objects[i].points[j]);
            let rotate = matrixMultipliation(rotateMatrix,translation);
            let projection2d = matrixMultipliation(projectionMatrix, rotate);

            if (projection2d[3] != 0){

                let x = projection2d[0] / projection2d[3];
                let y = projection2d[1] / projection2d[3];
                let z = projection2d[2] / projection2d[3];

                if ( x > -1 && x < 1 && y > -1 && y < 1 && z < 1){
                    
                    x =  (( x + 1 ) * canvas.width / 2);
                    y =  (( y + 1 ) * canvas.height / 2);

                    projectionP.push([x,y]);
                    point(x, y);

                }
            }
        }

        if (projectionP.length == objects[i].projectionPoints.length){
            objects[i].projectionPoints = projectionP;
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
    if ( Math.cos(angleX - e.movementY / 100) > 0 ){
        angleX += e.movementY / 100;
    } 
    else if (  Math.cos(angleX) > 0 ) {
        if ( e.movementY < 0 ) {
            angleX = Math.PI/2;
        }else{
            angleX = -0.5*Math.PI;
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
