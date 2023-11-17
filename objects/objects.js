class Entity {

    triangleObjects;
    offset = [0,0,0];
    scale  = 1;
    color =  [130,130,130];

    constructor(objects) {
        this.triangleObjects = objects;
    };

    colorValues() {
        let array = this.color;
        return [array[0] / 255,
                array[1] / 255,
                array[2] / 255];
    };
};