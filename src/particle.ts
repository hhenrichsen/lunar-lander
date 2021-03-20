import Ticking from "./ticking";
import Vector2 from "./vector2";
import Drawable from "./drawable";
import { Predicate } from "./functional";
import { drawTexture, Texture } from "./texture";
import { CoordinateTranslatable } from "./coordinate";

export class ParticleContainer<T> implements Ticking<T> {
  particles: Array<ParticleEffect<T>>;
  update(delta: number, state: T) {
    // TODO: Check on the efficiency of this.
    this.particles = this.particles.filter((p) => {
      p.update(delta, state);
      return p.remainingTime > 0;
    });
  }
  add(particle: ParticleEffect<T>) {
    this.particles.push(particle);
  }

  constructor() {
    this.particles = [];
  }
}

export class ParticleEmitter<T> implements Ticking<T>, Drawable<T> {
  position: Vector2;
  private _rate = 0.1;
  private _elapsed = 0;
  private _count = 10;
  private _container: ParticleContainer<T>;
  private _particleGenerator: ParticleGenerator<T>;
  private _predicate: Predicate<T>;

  constructor(
    generator: ParticleGenerator<T>,
    predicate: Predicate<T>,
    rate = 0.1,
    count = 10
  ) {
    this._container = new ParticleContainer<T>();
    this._particleGenerator = generator;
    this._predicate = predicate;
    this._count = count;
    this._rate = rate;
  }
  draw(
    context: CanvasRenderingContext2D,
    state: T,
    coordinates?: CoordinateTranslatable
  ): void {
    this._container.particles.forEach((p) => {
      p.draw(context, state, coordinates);
    });
  }

  update(delta: number, state: T): void {
    if (this._predicate(state)) {
      this._elapsed += delta;
      if (this._elapsed > this._rate) {
        this._elapsed -= this._rate;
        for (let i = 0; i < this._count; i++) {
          this._container.add(
            new ParticleEffect<T>(
              this.position,
              this._particleGenerator.velocity(state),
              this._particleGenerator.lifetime(state),
              this._particleGenerator.rotation(state),
              this._particleGenerator.texture(state),
              this._particleGenerator.size(state)
            )
          );
        }
      }
    }
    this._container.update(delta, state);
  }
}

export interface ParticleGenerator<T> {
  texture(state: T): Texture;
  size(state: T): Vector2;
  velocity(state: T): Vector2;
  lifetime(state: T): number;
  rotation(state: T): number;
}

export class ParticleEffect<T> implements Drawable<T>, Ticking<T> {
  private _center: Vector2;
  private _direction: Vector2;
  private _velocity: Vector2;
  private _lifetime: number;
  private _rotation: number;
  private _elapsedLifetime: number;
  private _texture: Texture;
  private _size: Vector2;
  constructor(
    center: Vector2,
    velocity: Vector2,
    lifetime: number,
    rotation: number,
    texture: Texture,
    size: Vector2
  ) {
    this._center = center;
    this._velocity = velocity;
    this._lifetime = lifetime;
    this._rotation = rotation;
    this._texture = texture;
    this._size = size;
    this._elapsedLifetime = 0;
  }

  draw(
    context: CanvasRenderingContext2D,
    state: T,
    coordinates: CoordinateTranslatable
  ) {
    context.globalAlpha = 1 - this._elapsedLifetime / this._lifetime;
    drawTexture(
      context,
      this._texture,
      coordinates.translate(this._center),
      coordinates.translate(this._size),
      this._rotation
    );
    context.globalAlpha = 1;
  }

  public get velocity(): Vector2 {
    return this._velocity;
  }

  public get direction(): Vector2 {
    return this._direction;
  }

  public get center(): Vector2 {
    return this._center;
  }

  public get remainingTime(): number {
    return this._lifetime - this._elapsedLifetime;
  }

  public update(delta: number, _: T) {
    this._elapsedLifetime += delta;
    this._center = this._center.add(this._velocity.scale(delta));
  }
}
