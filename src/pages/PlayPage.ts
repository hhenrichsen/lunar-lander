import { Lander } from '../content/Lander'
import { GlobalState, PlayState } from '../content/State'
import { drawTerrain, Terrain } from '../content/Terrain'
import { Texture } from '../core/rendering/Texture'
import Vector2 from '../core/geometry/Vector2'
import { GamePage } from '../core/menus/GamePage'

export class PlayPage extends GamePage<GlobalState<PlayState>> {

  private landerTexture = new Texture(
    'assets/Lander.png',
    new Vector2(500, 500)
  )

  private fuelPosition = new Vector2(5, 5)
  private anglePosition = new Vector2(5, 7.5)
  private velocityPosition = new Vector2(5, 10)
  private scorePosition = new Vector2(5, 12.5)
  private countdownPosition = new Vector2(5, 15)

  private countdown = 0;

  protected preLoad(element: HTMLElement, state: GlobalState<unknown>): void {
    super.setBounds(state.config.screenRatio, state.config.worldSize);
  }

  postInit (state: GlobalState<unknown>): void {
    let difficulty = 1;
    let score = 0;
    if (state.router.transitionData !== undefined) {
      if (state.router.transitionData['score'] !== undefined) {
        score = state.router.transitionData['score'] as number;
      }
      if (state.router.transitionData['level'] !== undefined) {
        difficulty = state.router.transitionData['level'] as number;
      }
    }
    const lander = new Lander(
      new Vector2(state.config.worldSize.x / 2, 0),
      this.landerTexture,
      new Vector2(5, 5)
    )
    this.countdown = 0;
    this.drawables.push(lander)
    this.ticking.push(lander)
    const terrain = new Terrain(
      8,
      500,
      new Vector2(0, (state.config.worldSize.y * 2) / 3),
      new Vector2(state.config.worldSize.x, (state.config.worldSize.y * 2) / 3),
      state.config.worldSize.y - 10
    )
    const safeZones: Array<Array<Vector2>> = []
    const count = 3 - difficulty
    const min = 10
    const max = state.config.worldSize.x - 10
    const validPortions = (max - min) / count
    for (let i = 0; i < count; i++) {
      safeZones.push(
        terrain.insertSafeZone(
          min + validPortions * i,
          min + validPortions * (i + 1),
          count * 7.5
        )
      )
    }

    state.localState = {
      running: true,
      ticking: true,
      level: difficulty,
      safeZones,
      lander,
      terrain,
      score,
      transition: false,
    }
    state.keys.listening = true;
  }

  canTransition (nextPage: string): boolean {
    return true
  }
  // Game loop
  public loop (state: GlobalState<PlayState>): FrameRequestCallback {
    const fn = (currentTime: number) => {
      const delta = currentTime - this.lastTime
      this.lastTime = currentTime

      this.update(delta / 1000, state)
      this.draw(state)

      if (state.localState.running) {
        requestAnimationFrame(fn)
      }
    }
    return fn
  }

  public update (delta: number, state: GlobalState<PlayState>) {
    if (state.localState.ticking) {
      for (let i = 0; i < this.ticking.length; i++) {
        this.ticking[i].update(delta, state)
      }
      if (state.localState.transition) {
        this.countdown += delta;
      } 
    }
  }

  public draw (state: GlobalState<PlayState>) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    drawTerrain(this.context, state, this.vcs)
    for (let i = 0; i < this.drawables.length; i++) {
      this.drawables[i].draw(this.context, state, this.vcs)
    }
    this.drawText(this.context, state)
  }

  public drawText (context: CanvasRenderingContext2D, state: GlobalState<PlayState>) {
    const fontSize = this.vcs.translateValueX(2)
    context.font = `${fontSize}px Arial`

    // Fuel
    const fuel = state.localState.lander.fuel
    if (fuel > 0) {
      context.fillStyle = '#00ff00'
    } else {
      context.fillStyle = '#ffffff'
    }
    const adjustedFuelPosition = this.vcs.translate(this.fuelPosition)
    context.fillText(
      `Fuel: ${fuel.toFixed(2)}L`,
      adjustedFuelPosition.x,
      adjustedFuelPosition.y
    )

    // Angle
    const angle = state.localState.lander.rotation
    if (angle < 5 || angle > 355) {
      context.fillStyle = '#00ff00'
    } else {
      context.fillStyle = '#ffffff'
    }
    const adjustedAnglePosition = this.vcs.translate(this.anglePosition)
    context.fillText(
      `Angle: ${angle.toFixed(2)}°`,
      adjustedAnglePosition.x,
      adjustedAnglePosition.y
    )

    // Velocity
    const magn = state.localState.lander.velocity.magnitude()
    if (magn < 2) {
      context.fillStyle = '#00ff00'
    } else {
      context.fillStyle = '#ffffff'
    }
    const adjustedVelocityPosition = this.vcs.translate(this.velocityPosition)
    context.fillText(
      `Velocity: ${magn.toFixed(2)} m/s`,
      adjustedVelocityPosition.x,
      adjustedVelocityPosition.y
    )
    context.fillStyle = '#ffffff'
    const score = state.localState.level * state.localState.lander.fuel;
    const adjustedScorePosition = this.vcs.translate(this.scorePosition)
    context.fillText(
      `Score: ${(score + state.localState.score).toFixed(0)}`,
      adjustedScorePosition.x,
      adjustedScorePosition.y
    )
    if (state.localState.transition) {
      const adjustedCountdownPosition = this.vcs.translate(this.countdownPosition)
      context.fillText(
        `Next level in ${Math.max((3 - this.countdown), 0).toFixed(2)}`,
        adjustedCountdownPosition.x,
        adjustedCountdownPosition.y
      )
    }
  }

  cleanup(state: GlobalState<PlayState>) {
    state.keys.listening = false; 
  }
}
