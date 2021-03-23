import Vector2 from "./Vector2";

export default class Circle {
    private _center: Vector2;
    private _radius: number;

    constructor(center: Vector2, radius: number) {
        this._center = center;
        this._radius = radius;
    }

    public get center(): Vector2 {
        return this._center;
    }

    public get radius(): number {
        return this._radius;
    }
}
