import Ticking from './ticking';
import Vector2 from './position';
import Drawable from './drawable';
import { Predicate } from './functional'
import { drawTexture, Texture } from './texture';

export class ParticleContainer<T> implements Ticking<T> {
    private particles: Array<ParticleEffect<T>>;
    update(delta: number, state: T) {
        // TODO: Check on the efficiency of this.
        this.particles = this.particles.filter(p => {
            p.update(delta, state);
            return p.remainingTime > 0;
        });
    }
    add(particle: ParticleEffect<T>) {
        this.particles.push(particle);
    }
}

export class ParticleEmitter<T> implements Ticking<T> {
    private _rate: number;
    private _elapsed: number;
    private _count: number;
    private _position: Vector2;
    private _container: ParticleContainer<T>
    private _particleGenerator: ParticleGenerator
    private _predicate: Predicate<T>

    constructor(generator: ParticleGenerator, predicate: Predicate<T>) {
        this._container = new ParticleContainer<T>()
        this._particleGenerator = generator
        this._predicate = predicate;
    }

    update(delta: number, state: T) {
        if (this._predicate(state)) {
            this._elapsed += delta;
            if (this._elapsed > this._rate) {
                this._elapsed -= this._rate;
                for (let i = 0; i < this._count; i++) {
                    this._container.add(new ParticleEffect<T>(this._position,
                    this._particleGenerator.direction(),
                    this._particleGenerator.velocity(),
                    this._particleGenerator.lifetime(),
                    this._particleGenerator.rotation(),
                    this._particleGenerator.texture(),
                    this._particleGenerator.size()))
                }
            }
        }
        this._container.update(delta, state);
    }
}

interface ParticleGenerator {
    texture() : Texture,
    direction() : Vector2,
    size(): Vector2,
    velocity() : number,
    lifetime() : number,
    rotation() : number,
}

export class ParticleEffect<T> implements Drawable<T>, Ticking<T> {
    private _center: Vector2;
    private _direction: Vector2;
    private _velocity: number;
    private _lifetime: number;
    private _rotation: number;
    private _elapsedLifetime: number;
    private _texture: Texture;
    private _size: Vector2;
    constructor(center: Vector2, direction: Vector2, velocity: number, lifetime: number, rotation: number, texture: Texture, size: Vector2) {
        this._center = center;
        this._direction = direction;
        this._velocity = velocity;
        this._lifetime = lifetime;
        this._rotation = rotation;
        this._texture = texture;
        this._elapsedLifetime = 0;
    }

    draw(context: CanvasRenderingContext2D, state: T) {
        drawTexture(context, this._texture.texture, this._center, this._size, this._rotation)
    }

    public get velocity() : number {
        return this._velocity;
    }

    public get direction() : Vector2 {
        return this._direction;
    }

    public get center() : Vector2 {
        return this._center;
    }

    public get remainingTime() : number {
        return this._lifetime - this._elapsedLifetime;
    }

    public update(delta: number, _: T) {
        this._elapsedLifetime += delta;
        this._center = this._center.add(this._direction.scale(delta * this._velocity));
    }
}