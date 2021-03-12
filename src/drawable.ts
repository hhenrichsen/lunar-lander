import Position from './position';

export interface Drawable<T> {
    draw(position: Position, state: T);
}

export default Drawable;