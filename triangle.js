class Triangle {

    points;

    constructor(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        this.points = [
            [x1, y1, z1, 1],
            [x2, y2, z2, 1],
            [x3, y3, z3, 1]
        ];
    };

    normalVector() {
        const U = {
            x: this.points[1][0] - this.points[0][0],
            y: this.points[1][1] - this.points[0][1],
            z: this.points[1][2] - this.points[0][2]
        };
        const V = {
            x: this.points[2][0] - this.points[0][0],
            y: this.points[2][1] - this.points[0][1],
            z: this.points[2][2] - this.points[0][2]
        };
        const Nx = (U.y * V.z) - (U.z * V.y);
        const Ny = (U.z * V.x) - (U.x * V.z);
        const Nz = (U.x * V.y) - (U.y * V.x);
        const magnitude = (Nx**2 + Ny**2 + Nz**2)**0.5;
        const N = [Nx/magnitude, Ny/magnitude, Nz/magnitude];

        return N;
    };
};