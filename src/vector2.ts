export class Vector2 {
  static ZERO: Vector2 = new Vector2(0, 0);

  private _x: number = 0;
  private _y: number = 0;

  static random(): Vector2 {
    return new Vector2(Math.random(), Math.random()).normalize();
  }

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  public static distance(pos1: Vector2, pos2: Vector2) {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
    );
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  sqrMagnitude(): number {
    return Math.pow(this.x, 2) + Math.pow(this.y, 2);
  }

  magnitude(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  normalize(): Vector2 {
    const magnitude = this.magnitude();
    return new Vector2(this.x / magnitude, this.y / magnitude);
  }

  scale(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  rotate(degrees: number): Vector2 {
    const rad = (degrees * Math.PI) / 180;
    let val = new Vector2(
      this.x * Math.cos(rad) - Math.sin(rad) * this.y,
      this.x * Math.sin(rad) + this.y * Math.cos(rad)
    );
    return val;
  }

  toString(): string {
    return `Vector2(x: ${this.x}, y: ${this.y})`;
  }
}

export default Vector2;
