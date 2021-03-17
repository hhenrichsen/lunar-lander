import Vector2 from './vector2';
import Drawable from './drawable';
import Ticking from './ticking';
import { CoordinateTranslatable } from './coordinate';
import { drawTexture, Texture } from './texture';
import { GlobalState } from './state';
import { ParticleEmitter, ParticleGenerator } from './particle';
import { isColliding } from './collision';
import Circle from './circle';

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
    private _velocity: Vector2;
    private size: Vector2;
    private thrustOffset: Vector2;
    private thrustVector: Vector2;
    private texture: Texture;
    private frozen: boolean;
    private thrustEmitter: ParticleEmitter<GlobalState>;
    private _rotation: number;

    fuel: number = 100;
    crashed: boolean = false;
    thrusting: boolean = false;
    turningLeft: boolean = false;
    turningRight: boolean = false;

    constructor(position: Vector2, texture: Texture, size: Vector2) {
        this.position = position;
        this.texture = texture;
        this.size = size;
        this._velocity = new Vector2(0, 0);
        this.frozen = false;
        this.thrustOffset = new Vector2(0.0 * size.x, 0.3 * size.y);
        this.thrustVector = new Vector2(0, -1);
        this._rotation = 0;
    }

    draw(context: CanvasRenderingContext2D, state: GlobalState, coordinates: CoordinateTranslatable) {
        drawTexture(context, this.texture, coordinates.translate(this.position), coordinates.translate(this.size), this._rotation);
        // this.debugDraw(context, state, coordinates);
    }

    private debugDraw(context: CanvasRenderingContext2D, state: GlobalState, coordinates: CoordinateTranslatable) {
        // Debug collision
        context.beginPath();
        context.strokeStyle = "#ffffff";
        let circlepos = coordinates.translate(this.position);
        context.arc(circlepos.x, circlepos.y, coordinates.translate(new Vector2(4, 0)).x, 0, Math.PI * 2);
        context.stroke();
        let adjPos = coordinates.translate(this.position);

        // Debug rotation
        let adjVec = coordinates.translate(this.thrustVector.scale(5));
        context.beginPath();
        if (this._rotation % 360 < 5 && this._rotation % 360 > -5) {
            context.strokeStyle = "#00ff00";
        }
        else {
            context.strokeStyle = "#ff0000";
        }
        context.lineTo(adjPos.x, adjPos.y);
        context.lineTo(adjPos.x + adjVec.x, adjPos.y + adjVec.y);
        context.stroke();

        // Debug velocity
        let velocity = coordinates.translate(this._velocity.normalize().scale(5));
        context.beginPath();
        if (this._velocity.sqrMagnitude() < 4) {
            context.strokeStyle = "#0000ff";
        }
        else {
            context.strokeStyle = "#ff0000";
        }
        context.lineTo(adjPos.x, adjPos.y);
        context.lineTo(adjPos.x + velocity.x, adjPos.y + velocity.y);
        context.stroke();
    }

    update(delta: number, state: GlobalState): void {
        if (!this.frozen) {
            if (this.turningLeft && this.fuel > 0) {
                this.rotate(delta, state, -1);
            }
            if (this.turningRight && this.fuel > 0) {
                this.rotate(delta, state, 1);
            }
            this._velocity = this._velocity.add(state.config.gravity.scale(delta));
            if (this.thrusting && this.fuel > 0) {
                this._velocity = this._velocity.add(this.thrustVector.scale(delta * state.config.thrustCoefficient));
                this.fuel -= state.config.fuelConsumption * delta;
            }
            if (this.fuel < 0) {
                this.fuel = 0;
            }
            this.position = this.position.add(this._velocity.scale(delta));
            // this.thrustEmitter.update(delta, state);
            for (let i = 0; i < state.terrain.points.length - 1; i++) {
                if(isColliding(new Circle(this.position, 4), state.terrain.points[i], state.terrain.points[i+1])) {
                    if (this.velocity.sqrMagnitude() <= 4 && (this.rotation < 5 || this.rotation > 355)) {
                        for (let j = 0; j < state.safeZones.length; j++) {
                            if (state.terrain.points[i] == state.safeZones[j][0] && state.terrain.points[i+1] == state.safeZones[j][1]) {
                                state.commands.execute('safeLanding', state);
                                return;
                            }
                        }
                    }
                    state.commands.execute('crashLanding', state);
                }
            }
        }
    }

    private rotate(delta: number, state: GlobalState, direction: number) {
        this.fuel -= state.config.fuelConsumption * delta;
        this._rotation += direction * state.config.theta * delta;
        this.thrustVector = this.thrustVector.rotate(direction * state.config.theta * delta);
    }

    get velocity() : Vector2 {
        return this._velocity
    }

    get rotation() : number {
        return ((this._rotation%360)+360)%360
    }

    public freeze() {
        this.frozen = true;
        this._velocity = Vector2.ZERO;
    }
}