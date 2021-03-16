import Position from './position';

export interface Drawable<T> {
    draw(context: CanvasRenderingContext2D, state: T);
}

export default Drawable;