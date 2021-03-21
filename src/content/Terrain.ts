import Vector2 from "../core/geometry/Vector2";
import { random } from "../core/Random";
import { CoordinateTranslatable } from "../core/rendering/VirtualCoordinate";
import { GlobalState, PlayState } from "./State";

export function drawTerrain(
  ctx: CanvasRenderingContext2D,
  state: GlobalState<PlayState>,
  vcs: CoordinateTranslatable
): void {
  ctx.beginPath();
  ctx.lineTo(
    vcs.translateValueX(0),
    vcs.translateValueY(state.config.worldSize.y)
  );

  const grd = ctx.createLinearGradient(0, 0, 0, 1000);
  grd.addColorStop(0, "#ffffff");
  grd.addColorStop(1, "#777777");

  for (let i = 1; i < state.localState.terrain.points.length; i++) {
    const pt = vcs.translate(state.localState.terrain.points[i]);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.lineTo(
    vcs.translateValueX(state.config.worldSize.x),
    vcs.translateValueY(state.config.worldSize.y)
  );
  ctx.fillStyle = grd;
  ctx.fill();

  for (let i = 0; i < state.localState.safeZones.length; i++) {
    ctx.strokeStyle = "#f69205";
    ctx.lineWidth = vcs.translateValueY(0.5);
    ctx.beginPath();
    const [pt1, pt2] = state.localState.safeZones[i].map(vcs.translate);
    ctx.lineTo(pt1.x, pt1.y);
    ctx.lineTo(pt2.x, pt2.y);
    ctx.stroke();
  }
}

export class Terrain {
  points: Array<Vector2>;
  constructor(iterations: number, roughness: number, p1: Vector2, p2: Vector2, min = 100) {
    this.points = [p1, p2];
    for (let i = 0; i < iterations; i++) {
      const savedLength = this.points.length;
      roughness /= 2;
      for (let j = 0; j < savedLength - 1; j++) {
        let mid = new Vector2(
          (this.points[j * 2].x + this.points[j * 2 + 1].x) / 2,
          (this.points[j * 2].y + this.points[j * 2 + 1].y) / 2
        );
        mid = mid.add(new Vector2(0, random.gaussian(12) * roughness));
        mid = new Vector2(mid.x, Math.min(mid.y, min));
        this.points.splice(j * 2 + 1, 0, mid);
      }
    }
  }

  insertSafeZone(minX: number, maxX: number, width: number): Array<Vector2> {
    const targetXMin = minX + width / 2;
    const targetXMax = maxX - width / 2;
    const diff = targetXMax - targetXMin;
    const offset = targetXMin + diff * Math.random();
    let i = 0;
    let point = this.points[0];
    while (point.x < offset) {
      point = this.points[++i];
    }
    const saved = point;
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
