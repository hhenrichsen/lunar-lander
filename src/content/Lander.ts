import Vector2 from "../core/geometry/Vector2";
import Drawable from "../core/rendering/Drawable";
import Ticking from "../core/Ticking";
import { CoordinateTranslatable } from "../core/rendering/VirtualCoordinate";
import { drawTexture, Texture } from "../core/rendering/Texture";
import { GlobalState, PlayState } from "./State";
import { ParticleEmitter, ParticleGenerator } from "../core/rendering/Particle";
import { isColliding } from "../core/geometry/Collision";
import { random } from "../core/Random";
import Circle from "../core/geometry/Circle";

class ThrustGenerator implements ParticleGenerator<GlobalState<PlayState>> {
    private _rotationOffset: number;

    constructor(rotationOffset = 0) {
        this._rotationOffset = rotationOffset;
    }

    private tex: Texture = new Texture("assets/Smoke.png", new Vector2(32, 32));
    private _size: Vector2 = new Vector2(0.425, 0.425);
    texture(_: GlobalState<PlayState>): Texture {
        return this.tex;
    }
    size(state: GlobalState<PlayState>): Vector2 {
        return this._size;
    }
    velocity(state: GlobalState<PlayState>): Vector2 {
        let v = state.localState.lander.rotationVector;
        const rotation = random.gaussian(12) * 100;
        v = v.rotate(rotation + this._rotationOffset);
        v = v.scale(-5 * random.gaussian(12));
        return v;
    }
    lifetime(state: GlobalState<PlayState>): number {
        return 5 + random.gaussian(12);
    }
    rotation(state: GlobalState<PlayState>): number {
        return 0;
    }
}
class ExplosionGenerator implements ParticleGenerator<GlobalState<PlayState>> {
    private tex: Texture = new Texture("assets/Fire.png", new Vector2(32, 32));
    private _size: Vector2 = new Vector2(0.425, 0.425);
    texture(_: GlobalState<PlayState>): Texture {
        return this.tex;
    }
    size(state: GlobalState<PlayState>): Vector2 {
        return this._size;
    }
    velocity(state: GlobalState<PlayState>): Vector2 {
        let v = state.localState.lander.rotationVector;
        const rotation = Math.random() * 360;
        v = v.rotate(rotation);
        v = v.scale(-20 * random.gaussian(12));
        return v;
    }
    lifetime(state: GlobalState<PlayState>): number {
        return 2 + random.gaussian(12);
    }
    rotation(state: GlobalState<PlayState>): number {
        return 0;
    }
}

export class Lander implements Drawable<GlobalState<PlayState>>, Ticking<GlobalState<PlayState>> {
    private size: Vector2;
    private texture: Texture;
    private _frozen: boolean;
    private thrustEmitter: ParticleEmitter<GlobalState<PlayState>>;
    private leftRotationEmitter: ParticleEmitter<GlobalState<PlayState>>;
    private rightRotationEmitter: ParticleEmitter<GlobalState<PlayState>>;
    private explosionEmitter: ParticleEmitter<GlobalState<PlayState>>;
    private _position: Vector2;
    private _velocity: Vector2;
    private _rotationVector: Vector2;
    private _rotation: number;
    private _explosionCount = 0;
    private _isExploding = false;
    private _safeTimer = 0;
    private _isSafe = false;
    private _crashTimer = 0;

    fuel = 100;
    crashed = false;
    thrusting = false;
    turningLeft = false;
    turningRight = false;

    constructor(position: Vector2, texture: Texture, size: Vector2) {
        this.texture = texture;
        this.size = size;
        this._frozen = false;
        this._position = position;
        this._velocity = new Vector2(0, 0);
        this._rotationVector = new Vector2(0, -1);
        this._rotation = 0;
        this.thrustEmitter = new ParticleEmitter(
            new ThrustGenerator(180),
            (state) =>
                state.localState.lander.thrusting &&
                state.localState.lander.fuel > 0 &&
                !this._frozen,
            0.03,
            5
        );
        this.leftRotationEmitter = new ParticleEmitter(
            new ThrustGenerator(90),
            (state) =>
                state.localState.lander.turningLeft &&
                state.localState.lander.fuel > 0 &&
                !this._frozen,
            0.03,
            3
        );
        this.rightRotationEmitter = new ParticleEmitter(
            new ThrustGenerator(-90),
            (state) =>
                state.localState.lander.turningRight &&
                state.localState.lander.fuel > 0 &&
                !this._frozen,
            0.03,
            3
        );
        this.explosionEmitter = new ParticleEmitter(
            new ExplosionGenerator(),
            (state) => this._isExploding,
            0.03,
            200
        );
        this.positionEmitters();
    }

    draw(
        context: CanvasRenderingContext2D,
        state: GlobalState<PlayState>,
        coordinates: CoordinateTranslatable
    ) {
        if (!state.localState.lander.crashed) {
            drawTexture(
                context,
                this.texture,
                coordinates.translate(this._position),
                coordinates.translate(this.size),
                this._rotation
            );
        }
        this.thrustEmitter.draw(context, state, coordinates);
        this.leftRotationEmitter.draw(context, state, coordinates);
        this.rightRotationEmitter.draw(context, state, coordinates);
        this.explosionEmitter.draw(context, state, coordinates);
        // this.debugDraw(context, state, coordinates);
    }

    private debugDraw(
        context: CanvasRenderingContext2D,
        state: GlobalState<PlayState>,
        coordinates: CoordinateTranslatable
    ) {
        // Debug collision
        context.beginPath();
        context.strokeStyle = "#ffffff";
        const circlepos = coordinates.translate(this._position);
        context.arc(
            circlepos.x,
            circlepos.y,
            coordinates.translate(new Vector2(4, 0)).x,
            0,
            Math.PI * 2
        );
        context.stroke();
        const adjPos = coordinates.translate(this._position);

        // Debug rotation
        const adjVec = coordinates.translate(this._rotationVector.scale(5));
        context.beginPath();
        if (this._rotation % 360 < 5 && this._rotation % 360 > -5) {
            context.strokeStyle = "#00ff00";
        } else {
            context.strokeStyle = "#ff0000";
        }
        context.lineTo(adjPos.x, adjPos.y);
        context.lineTo(adjPos.x + adjVec.x, adjPos.y + adjVec.y);
        context.stroke();

        // Debug velocity
        const velocity = coordinates.translate(this._velocity.normalize().scale(5));
        context.beginPath();
        if (this._velocity.sqrMagnitude() < 4) {
            context.strokeStyle = "#0000ff";
        } else {
            context.strokeStyle = "#ff0000";
        }
        context.lineTo(adjPos.x, adjPos.y);
        context.lineTo(adjPos.x + velocity.x, adjPos.y + velocity.y);
        context.stroke();
    }

    positionEmitters(): void {
        this.thrustEmitter.position = this._position.add(this._rotationVector.scale(-1.5));
        this.leftRotationEmitter.position = this._position.add(
            this._rotationVector.rotate(70).scale(-1.75)
        );
        this.rightRotationEmitter.position = this._position.add(
            this._rotationVector.rotate(-70).scale(-1.75)
        );
        this.explosionEmitter.position = this._position;
    }

    update(delta: number, state: GlobalState<PlayState>): void {
        if (this._isSafe) {
            this._safeTimer += delta;
            if (this._safeTimer >= 3) {
                state.localState.running = false;
                state.localState.score += state.localState.lander.fuel * state.localState.level;
                if (state.localState.level == 2) {
                    state.router.requestTransition("scores", true, {
                        score: state.localState.score,
                    });
                } else {
                    state.router.requestTransition("play", true, {
                        level: 2,
                        score: state.localState.score,
                    });
                }
            }
        }

        if (this.crashed) {
            this._crashTimer += delta;
            if (this._crashTimer >= 3) {
                state.localState.running = false;
                state.router.requestTransition("scores", true, {
                    score: state.localState.score,
                });
            }
        }

        if (this._isExploding) {
            console.log("Explosion");
            this._explosionCount++;
        }
        if (this._explosionCount > 5) {
            this._isExploding = false;
            this._explosionCount = 0;
        }
        this.thrustEmitter.update(delta, state);
        this.leftRotationEmitter.update(delta, state);
        this.rightRotationEmitter.update(delta, state);
        this.explosionEmitter.update(delta, state);
        if (!this._frozen) {
            if (this.turningLeft && this.fuel > 0) {
                this.rotate(delta, state, -1);
            }
            if (this.turningRight && this.fuel > 0) {
                this.rotate(delta, state, 1);
            }
            this._velocity = this._velocity.add(state.config.gravity.scale(delta));
            if (this.thrusting && this.fuel > 0) {
                this._velocity = this._velocity.add(
                    this._rotationVector.scale(delta * state.config.thrustCoefficient)
                );
                this.fuel -= state.config.fuelConsumption * delta;
            }
            if (this.fuel < 0) {
                this.fuel = 0;
                state.commands.execute("fuelExpired", state);
            }
            this._position = this._position.add(this._velocity.scale(delta));
            this.positionEmitters();
            // this.thrustEmitter.update(delta, state);
            for (let i = 0; i < state.localState.terrain.points.length - 1; i++) {
                if (
                    isColliding(
                        new Circle(this._position, 2),
                        state.localState.terrain.points[i],
                        state.localState.terrain.points[i + 1]
                    )
                ) {
                    if (
                        this.velocity.sqrMagnitude() <= 4 &&
                        (this.rotation < 5 || this.rotation > 355)
                    ) {
                        for (let j = 0; j < state.localState.safeZones.length; j++) {
                            if (
                                state.localState.terrain.points[i] ==
                                    state.localState.safeZones[j][0] &&
                                state.localState.terrain.points[i + 1] ==
                                    state.localState.safeZones[j][1]
                            ) {
                                state.commands.execute("safeLanding", state);
                                return;
                            }
                        }
                    }
                    state.commands.execute("crashLanding", state);
                    this._isExploding = true;
                }
            }

            if (
                this.position.x > state.config.worldSize.x + 10 ||
                this.position.x < -10 ||
                this.position.y > state.config.worldSize.y + 10
            ) {
                state.commands.execute("crashLanding", state);
                this._isExploding = true;
            }
        }
    }

    private rotate(delta: number, state: GlobalState<PlayState>, direction: number) {
        this.fuel -= state.config.fuelConsumption * delta * 0.5;
        this._rotation += direction * state.config.theta * delta;
        this._rotationVector = this._rotationVector.rotate(direction * state.config.theta * delta);
    }

    get safe(): boolean {
        return this._isSafe;
    }

    set safe(safe: boolean) {
        this._isSafe = safe;
    }

    get velocity(): Vector2 {
        return this._velocity;
    }

    get rotation(): number {
        return ((this._rotation % 360) + 360) % 360;
    }

    get rotationVector(): Vector2 {
        return this._rotationVector;
    }

    get position(): Vector2 {
        return this._position;
    }

    public freeze() {
        this._frozen = true;
        this._velocity = Vector2.ZERO;
    }

    public get frozen() {
        return this._frozen;
    }
}
