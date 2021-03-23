import { CoordinateTranslatable } from "./VirtualCoordinate";

export interface Drawable<T> {
    draw(context: CanvasRenderingContext2D, state: T, coordinates?: CoordinateTranslatable): void;
}

export default Drawable;
