import Vector2 from "./vector2";

export class VirtualCoordinateSystem {
  private scaleX: number;
  private scaleY: number;

  constructor(scaleX: number, scaleY: number) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.translate = this.translate.bind(this);
    this.translateValueX = this.translateValueX.bind(this);
    this.translateValueY = this.translateValueY.bind(this);
  }

  translate(v1: Vector2): Vector2 {
    return new Vector2(v1.x * this.scaleX, v1.y * this.scaleY);
  }

  translateValueX(p: number): number {
    return p * this.scaleX;
  }

  translateValueY(p: number): number {
    return p * this.scaleY;
  }
}

export interface CoordinateTranslatable {
  translate(v1: Vector2): Vector2;
  translateValueX(p: number): number;
  translateValueY(p: number): number;
}
