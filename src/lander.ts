import Vector2 from './vector2'
import Drawable from './drawable'
import Ticking from './ticking'
import { CoordinateTranslatable } from './coordinate'
import { drawTexture, Texture } from './texture'
import { GlobalState } from './state'
import { ParticleEmitter, ParticleGenerator } from './particle'
import { isColliding } from './collision'
import { random } from './random'
import Circle from './circle'

class ThrustGenerator implements ParticleGenerator<GlobalState> {
  private _rotationOffset: number

  constructor (rotationOffset: number = 0) {
    this._rotationOffset = rotationOffset
  }

  private tex: Texture = new Texture('assets/Smoke.png', new Vector2(32, 32))
  private _size: Vector2 = new Vector2(0.425, 0.425)
  texture (_: GlobalState): Texture {
    return this.tex
  }
  size (state: GlobalState): Vector2 {
    return this._size
  }
  velocity (state: GlobalState): Vector2 {
    let v = state.lander.rotationVector
    let rotation = random.gaussian(12) * 100
    v = v.rotate(rotation + this._rotationOffset)
    v = v.scale(-5 * random.gaussian(12))
    return v
  }
  lifetime (state: GlobalState): number {
    return 5 + random.gaussian(12)
  }
  rotation (state: GlobalState): number {
    return 0
  }
}
class ExplosionGenerator implements ParticleGenerator<GlobalState> {
  private tex: Texture = new Texture('assets/Fire.png', new Vector2(32, 32))
  private _size: Vector2 = new Vector2(0.425, 0.425)
  texture (_: GlobalState): Texture {
    return this.tex
  }
  size (state: GlobalState): Vector2 {
    return this._size
  }
  velocity (state: GlobalState): Vector2 {
    let v = state.lander.rotationVector
    let rotation = Math.random() * 360
    v = v.rotate(rotation)
    v = v.scale(-20 * random.gaussian(12))
    return v
  }
  lifetime (state: GlobalState): number {
    return 2 + random.gaussian(12)
  }
  rotation (state: GlobalState): number {
    return 0
  }
}

export class Lander implements Drawable<GlobalState>, Ticking<GlobalState> {
  private size: Vector2
  private texture: Texture
  private frozen: boolean
  private thrustEmitter: ParticleEmitter<GlobalState>
  private leftRotationEmitter: ParticleEmitter<GlobalState>
  private rightRotationEmitter: ParticleEmitter<GlobalState>
  private explosionEmitter: ParticleEmitter<GlobalState>
  private _position: Vector2
  private _velocity: Vector2
  private _rotationVector: Vector2
  private _rotation: number
  private _explosionCount: number = 0
  private _isExploding: boolean = false

  fuel: number = 100
  crashed: boolean = false
  thrusting: boolean = false
  turningLeft: boolean = false
  turningRight: boolean = false

  constructor (position: Vector2, texture: Texture, size: Vector2) {
    this.texture = texture
    this.size = size
    this.frozen = false
    this._position = position
    this._velocity = new Vector2(0, 0)
    this._rotationVector = new Vector2(0, -1)
    this._rotation = 0
    this.thrustEmitter = new ParticleEmitter(
      new ThrustGenerator(),
      state => state.lander.thrusting && state.lander.fuel > 0,
      0.03,
      5
    )
    this.leftRotationEmitter = new ParticleEmitter(
      new ThrustGenerator(90),
      state => state.lander.turningLeft && state.lander.fuel > 0,
      0.03,
      3
    )
    this.rightRotationEmitter = new ParticleEmitter(
      new ThrustGenerator(-90),
      state => state.lander.turningRight && state.lander.fuel > 0,
      0.03,
      3
    )
    this.explosionEmitter = new ParticleEmitter(
      new ExplosionGenerator(),
      state => this._isExploding,
      0.03,
      200
    )
    this.positionEmitters()
  }

  draw (
    context: CanvasRenderingContext2D,
    state: GlobalState,
    coordinates: CoordinateTranslatable
  ) {
    if (!state.lander.crashed) {
      drawTexture(
        context,
        this.texture,
        coordinates.translate(this._position),
        coordinates.translate(this.size),
        this._rotation
      )
    }
    this.thrustEmitter.draw(context, state, coordinates)
    this.leftRotationEmitter.draw(context, state, coordinates)
    this.rightRotationEmitter.draw(context, state, coordinates)
    this.explosionEmitter.draw(context, state, coordinates)
    // this.debugDraw(context, state, coordinates);
  }

  private debugDraw (
    context: CanvasRenderingContext2D,
    state: GlobalState,
    coordinates: CoordinateTranslatable
  ) {
    // Debug collision
    context.beginPath()
    context.strokeStyle = '#ffffff'
    let circlepos = coordinates.translate(this._position)
    context.arc(
      circlepos.x,
      circlepos.y,
      coordinates.translate(new Vector2(4, 0)).x,
      0,
      Math.PI * 2
    )
    context.stroke()
    let adjPos = coordinates.translate(this._position)

    // Debug rotation
    let adjVec = coordinates.translate(this._rotationVector.scale(5))
    context.beginPath()
    if (this._rotation % 360 < 5 && this._rotation % 360 > -5) {
      context.strokeStyle = '#00ff00'
    } else {
      context.strokeStyle = '#ff0000'
    }
    context.lineTo(adjPos.x, adjPos.y)
    context.lineTo(adjPos.x + adjVec.x, adjPos.y + adjVec.y)
    context.stroke()

    // Debug velocity
    let velocity = coordinates.translate(this._velocity.normalize().scale(5))
    context.beginPath()
    if (this._velocity.sqrMagnitude() < 4) {
      context.strokeStyle = '#0000ff'
    } else {
      context.strokeStyle = '#ff0000'
    }
    context.lineTo(adjPos.x, adjPos.y)
    context.lineTo(adjPos.x + velocity.x, adjPos.y + velocity.y)
    context.stroke()
  }

  positionEmitters (): void {
    this.thrustEmitter.position = this._position.add(
      this._rotationVector.scale(-1.5)
    )
    this.leftRotationEmitter.position = this._position.add(
      this._rotationVector.rotate(70).scale(-1.75)
    )
    this.rightRotationEmitter.position = this._position.add(
      this._rotationVector.rotate(-70).scale(-1.75)
    )
    this.explosionEmitter.position = this._position
  }

  update (delta: number, state: GlobalState): void {
    if (this._isExploding) {
      console.log('Explosion')
      this._explosionCount++
    }
    if (this._explosionCount > 5) {
      this._isExploding = false
      this._explosionCount = 0
    }
    this.thrustEmitter.update(delta, state)
    this.leftRotationEmitter.update(delta, state)
    this.rightRotationEmitter.update(delta, state)
    this.explosionEmitter.update(delta, state)
    if (!this.frozen) {
      if (this.turningLeft && this.fuel > 0) {
        this.rotate(delta, state, -1)
      }
      if (this.turningRight && this.fuel > 0) {
        this.rotate(delta, state, 1)
      }
      this._velocity = this._velocity.add(state.config.gravity.scale(delta))
      if (this.thrusting && this.fuel > 0) {
        this._velocity = this._velocity.add(
          this._rotationVector.scale(delta * state.config.thrustCoefficient)
        )
        this.fuel -= state.config.fuelConsumption * delta
      }
      if (this.fuel < 0) {
        this.fuel = 0
        state.commands.execute('fuelExpired', state)
      }
      this._position = this._position.add(this._velocity.scale(delta))
      this.positionEmitters()
      // this.thrustEmitter.update(delta, state);
      for (let i = 0; i < state.terrain.points.length - 1; i++) {
        if (
          isColliding(
            new Circle(this._position, 2),
            state.terrain.points[i],
            state.terrain.points[i + 1]
          )
        ) {
          if (
            this.velocity.sqrMagnitude() <= 4 &&
            (this.rotation < 5 || this.rotation > 355)
          ) {
            for (let j = 0; j < state.safeZones.length; j++) {
              if (
                state.terrain.points[i] == state.safeZones[j][0] &&
                state.terrain.points[i + 1] == state.safeZones[j][1]
              ) {
                state.commands.execute('safeLanding', state)
                return
              }
            }
          }
          state.commands.execute('crashLanding', state)
          this._isExploding = true
        }
      }

      if (
        this.position.x > state.config.worldSize.x + 10 ||
        this.position.x < -10 ||
        this.position.y > state.config.worldSize.y + 10
      ) {
        state.commands.execute('crashLanding', state)
        this._isExploding = true
      }
    }
  }

  private rotate (delta: number, state: GlobalState, direction: number) {
    this.fuel -= state.config.fuelConsumption * delta * 0.5
    this._rotation += direction * state.config.theta * delta
    this._rotationVector = this._rotationVector.rotate(
      direction * state.config.theta * delta
    )
  }

  get velocity (): Vector2 {
    return this._velocity
  }

  get rotation (): number {
    return ((this._rotation % 360) + 360) % 360
  }

  get rotationVector (): Vector2 {
    return this._rotationVector
  }

  get position (): Vector2 {
    return this._position
  }

  public freeze () {
    this.frozen = true
    this._velocity = Vector2.ZERO
  }
}
