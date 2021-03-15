import Vector2 from "./position";

export function drawTexture(context: CanvasRenderingContext2D, texture: CanvasImageSource, position: Vector2, size: Vector2, rotation: number = 0, scale: number = 1) {
    context.save()
    context.translate(position.x, position.y);
    context.rotate(rotation);
    // TODO: Some drawing code here.
    context.restore()
}