class Calc {


    static linePlaneIntersection(p1, p2, plane){
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

}