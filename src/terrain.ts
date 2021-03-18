import Vector2 from "./vector2";
import { random } from "./random";
import { CoordinateTranslatable } from "./coordinate";

export function drawTerrain(
  ctx: CanvasRenderingContext2D,
  terrain: Terrain,
  vcs: CoordinateTranslatable
) {
  ctx.beginPath();
  ctx.lineTo(vcs.translateValueX(0), vcs.translateValueY(100));
  ctx.strokeStyle = "#cccccc";
  ctx.fillStyle = "#aaaaaa";
  for (let i = 1; i < terrain.points.length; i++) {
    let pt = vcs.translate(terrain.points[i]);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.lineTo(vcs.translateValueX(100), vcs.translateValueY(100));
  ctx.fill();
}

export class Terrain {
  points: Array<Vector2>;
  constructor(iterations: number, roughness: number, p1: Vector2, p2: Vector2) {
    this.points = [p1, p2];
    for (let i = 0; i < iterations; i++) {
      let savedLength = this.points.length;
      roughness /= 2;
      for (let j = 0; j < savedLength - 1; j++) {
        let mid = new Vector2(
          (this.points[j * 2].x + this.points[j * 2 + 1].x) / 2,
          (this.points[j * 2].y + this.points[j * 2 + 1].y) / 2
        );
        mid = mid.add(new Vector2(0, random.gaussian(12) * roughness));
        this.points.splice(j * 2 + 1, 0, mid);
      }
    }
  }

  insertSafeZone(minX: number, maxX: number, width: number) {
    let targetXMin = minX + width / 2;
    let targetXMax = maxX - width / 2;
    let diff = targetXMax - targetXMin;
    let offset = targetXMin + diff * Math.random();
    let i = 0;
    let point = this.points[0];
    while (point.x < offset) {
      point = this.points[++i];
    }
    let saved = point;
    i++;
    point = this.points[i];
    let x = 0;
    while (point.x < offset + width) {
      x = point.x;
      this.points.splice(i, 1);
      point = this.points[i];
    }
    this.points[i] = new Vector2(x, saved.y);
    return [saved, this.points[i]];
  }
}
