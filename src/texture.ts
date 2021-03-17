import Vector2 from "./vector2";

export function drawTexture(context: CanvasRenderingContext2D, texture: Texture, position: Vector2, size: Vector2, rotation: number = 0) {
    if (!texture.ready) {
        return;
    }
    context.save();
    context.translate(position.x, position.y);
    context.rotate(rotation * Math.PI / 180);
    context.translate(-position.x, -position.y);
    context.drawImage(texture.texture, position.x - size.x/2, position.y - size.y/2, size.x, size.y);
    context.restore();
}

export class Texture {
    size: Vector2;
    el: HTMLImageElement;
    ready: boolean = false;
    constructor(texture: string, size: Vector2) {
        this.el = new Image();
        this.el.src = texture;
        this.el.addEventListener('load', () => {
            this.ready = true;
        });
    }

    get texture() : CanvasImageSource {
        return this.el;
    }
}``