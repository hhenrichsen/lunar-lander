import { CoordinateTranslatable } from "./coordinate";
import Drawable from "./drawable";

export interface DrawPredicate<T> {
  (state: T): boolean;
}

export class ConditionalDrawable<T> implements Drawable<T> {
  private _predicate;
  private _drawable;
  public constructor(predicate: DrawPredicate<T>, drawable: Drawable<T>) {
    this._predicate = predicate;
    this._drawable = drawable;
  }
  draw(
    context: CanvasRenderingContext2D,
    state: T,
    coordinates: CoordinateTranslatable
  ): void {
    if (this._predicate(state)) {
      this._drawable.draw(context, state, coordinates);
    }
  }
}

export function ifDraw<T>(pred: DrawPredicate<T>, drawable: Drawable<T>): ConditionalDrawable<T> {
  return new ConditionalDrawable<T>(pred, drawable);
}
