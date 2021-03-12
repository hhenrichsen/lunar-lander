import Drawable from './drawable';
import Position from './position';

export interface DrawPredicate<T> {
    (position: Position, state: T);
}

export class ConditionalDrawable<T> implements Drawable<T> {
    private _predicate: DrawPredicate<T> = (_ignore1: Position, _ignore2: T) => false;
    private _drawable: Drawable<T> = {draw: (_ignore1: Position, _ignore2: T) => {}};
    public constructor(predicate: DrawPredicate<T>, drawable: Drawable<T>) {
        this._predicate = predicate;
        this._drawable = drawable;
    }
    draw(position: Position, state: T) {
        if (this._predicate(position, state)) {
            this._drawable.draw(position, state);
        }
    }
}

export function ifDraw<T>(pred: DrawPredicate<T>, drawable: Drawable<T>) {
    return new ConditionalDrawable<T>(pred, drawable);
}