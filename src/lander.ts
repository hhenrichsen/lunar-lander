import Vector2 from './vector2';
import Drawable from './drawable';
import Ticking from './ticking';
import { CoordinateTranslatable } from './coordinate';
import { drawTexture, Texture } from './texture';
import { GlobalState } from './state';
import { ParticleEmitter, ParticleGenerator } from './particle';

class ThrustGenerator implements ParticleGenerator {
    private tex: Texture = new Texture('assets/Fire.png', new Vector2(5, 5))

    texture(): Texture {
        throw new Error('Method not implemented.');
    }
    direction(): Vector2 {
        throw new Error('Method not implemented.');
    }
    size(): Vector2 {
        throw new Error('Method not implemented.');
    }
    velocity(): number {
        throw new Error('Method not implemented.');
    }
    lifetime(): number {
        throw new Error('Method not implemented.');
    }
    rotation(): number {
        throw new Error('Method not implemented.');
    }

}

export class Lander implements Drawable<GlobalState>, Ticking<GlobalState> {
    private position: Vector2;
    private velocity: Vector2;
    private size: Vector2;
    private thrustOffset: Vector2;
    private thrustVector: Vector2;
    private texture: Texture;
    private frozen: boolean;
    private thrustEmitter: ParticleEmitter<GlobalState>;
    private rotation: number;

    constructor(position: Vector2, texture: Texture, size: Vector2) {
        this.position = position;
        this.texture = texture;
        this.size = size;
        this.velocity = new Vector2(0, 0);
        this.frozen = false;
        this.thrustOffset = new Vector2(0.0 * size.x, 0.3 * size.y);
        this.thrustVector = new Vector2(0, -1);
        this.rotation = 0;
    }

    draw(context: CanvasRenderingContext2D, state: GlobalState, coordinates: CoordinateTranslatable) {
        drawTexture(context, this.texture, coordinates.translate(this.position), coordinates.translate(this.size), this.rotation);
        context.beginPath();
        context.strokeStyle = "#ffffff";
        let circlepos = coordinates.translate(this.position);
        context.arc(circlepos.x, circlepos.y, coordinates.translate(new Vector2(4, 0)).x, 0, Math.PI * 2);
        context.stroke();
        let adjPos = coordinates.translate(this.position);
        context.beginPath();
        context.lineTo(adjPos.x, adjPos.y);
        context.strokeStyle = "#ff0000";
        let adjVec = coordinates.translate(this.thrustVector.scale(5));
        context.lineTo(adjPos.x + adjVec.x, adjPos.y + adjVec.y);
        context.stroke();
    }

    update(delta: number, state: GlobalState): void {
        if (!this.frozen) {
            if (state.turnLeft) {
                state.fuel -= state.fuelConsumption * delta;
                this.rotation -= state.theta * delta;
                this.thrustVector = this.thrustVector.rotate(-state.theta * delta);
                console.log(`New Thrust Vector: ${this.thrustVector.x} ${this.thrustVector.y}`)
            }
            if (state.turnRight) {
                state.fuel -= state.fuelConsumption * delta;
                this.rotation += state.theta * delta;
                this.thrustVector = this.thrustVector.rotate(state.theta * delta);
                console.log(`New Thrust Vector: ${this.thrustVector.x} ${this.thrustVector.y}`)
            }
            this.velocity = this.velocity.add(state.gravity.scale(delta));
            if (state.thrust && state.fuel > 0) {
                this.velocity = this.velocity.add(this.thrustVector.scale(delta * state.thrustCoefficient));
                console.log(`New Velocity: ${this.velocity.x} ${this.velocity.y}`)
                state.fuel -= state.fuelConsumption * delta;
            }
            this.position = this.position.add(this.velocity.scale(delta));
            // this.thrustEmitter.update(delta, state);
        }
        if (this.position.y > 90) {
            this.position = new Vector2(this.position.x, 90);
            this.velocity = Vector2.ZERO;
            this.frozen = true;
        }
    }
}