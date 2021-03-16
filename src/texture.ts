import Vector2 from "./position";

export function drawTexture(context: CanvasRenderingContext2D, texture: CanvasImageSource, position: Vector2, size: Vector2, rotation: number = 0) {
    context.save();
    context.translate(position.x + size.x, position.y + size.y);
    context.rotate(rotation);
    context.translate(-position.x - size.x, -position.y - size.y);
    context.drawImage(texture, position.x - size.x/2, position.y - size.y/2, size.x, size.y);
    context.restore();
}

export class Texture {
    texture: CanvasImageSource;
    size: Vector2;
}