class Vector4d {

    #matrix;

    constructor(matrix){
        this.#matrix = matrix;
    }

    get x(){
        return this.matrix[0];
    }
    
    get y(){
        return this.matrix[1];
    }

    get z(){
        return this.matrix[2];
    }

    get w(){
        return this.matrix[3];
    }

    get matrix(){
        return this.matrix;
    }

    static dot(matrix, vector){
        let result = [];
        for (let i = 0; i < 4; i++) {
            result.push(matrix[i][0] * vector[0] + 
                        matrix[i][1] * vector[1] + 
                        matrix[i][2] * vector[2] + 
                        matrix[i][3] * vector[3]
                        );
        }
        return result;
    }
}