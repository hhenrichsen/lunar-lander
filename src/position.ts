export class Position {
    private _x: number = 0;
    private _y: number = 0;
    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    public static distance(pos1: Position, pos2: Position) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }
    
    magnitude() : number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    normalize() : Position {
        const magnitude = this.magnitude();
        return new Position(this.x / magnitude, this.y / magnitude);
    }

    scale(scalar: number) : Position {
        return new Position(this.x * scalar, this.y * scalar);
    }
}

export default Position;