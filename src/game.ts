import Vector2 from './vector2'
import { drawTexture, Texture } from './texture'
import Drawable from './drawable'
import Ticking from './ticking'
import { VirtualCoordinateSystem } from './coordinate'
import { GlobalState } from './state'
import { Lander } from './lander'
import { KeyManager, mapToCommands } from './key'
import { CommandService } from './command'
import { drawTerrain, Terrain } from './terrain'
import { ConditionalDrawable } from './conditionalDrawable'
import { SoundEffect } from './sound'

// General Setup
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const context = canvas.getContext('2d')
const ratio = new Vector2(4/3, 1);
const worldSize = ratio.scale(100);

const landerTexture = new Texture('assets/Lander.png', new Vector2(500, 500))

// Virtual Sizing
  if (window.innerWidth / ratio.x < window.innerHeight / ratio.y) {
    canvas.width = window.innerWidth
    canvas.height = window.innerWidth * ratio.y / ratio.x
  }
  else {
    canvas.width = window.innerHeight * ratio.x / ratio.y
    canvas.height = window.innerHeight
  }

  let vcs = new VirtualCoordinateSystem(
    canvas.width / worldSize.x,
    canvas.height / worldSize.y
  )

// Resize
function resize () {
  if (window.innerWidth / ratio.x < window.innerHeight / ratio.y) {
    canvas.width = window.innerWidth
    canvas.height = window.innerWidth * ratio.y / ratio.x
  }
  else {
    canvas.width = window.innerHeight * ratio.x / ratio.y
    canvas.height = window.innerHeight
  }

  vcs = new VirtualCoordinateSystem(
    canvas.width / worldSize.x,
    canvas.height / worldSize.y
  )
}

window.addEventListener('resize', resize);

let drawables = new Array<Drawable<GlobalState>>()
let ticking = new Array<Ticking<GlobalState>>()

let fuelPosition = new Vector2(5, 5)
let anglePosition = new Vector2(5, 7.5)
let velocityPosition = new Vector2(5, 10)

// Game loop
let lastTime: number = 0
function loop (globalState: GlobalState) : FrameRequestCallback {
    let fn = function(currentTime: number) {
        const delta = currentTime - lastTime
        lastTime = currentTime

        update(delta / 1000, globalState)
        draw(globalState)

        if (globalState.running) {
            requestAnimationFrame(fn);
        }
    }
    return fn
}

function update (delta: number, globalState: GlobalState) {
  for (let i = 0; i < ticking.length; i++) {
    ticking[i].update(delta, globalState)
  }
}
function draw (globalState: GlobalState) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawTerrain(context, globalState.terrain, vcs, worldSize);
  for (let i = 0; i < drawables.length; i++) {
    drawables[i].draw(context, globalState, vcs);
  }
  drawText(context, globalState);
}

function drawText (context: CanvasRenderingContext2D, globalState: GlobalState) {
  let fontSize = vcs.translateValueX(2)
  context.font = `${fontSize}px Arial`

  // Fuel
  let fuel = globalState.lander.fuel
  if (fuel > 0) {
    context.fillStyle = '#00ff00'
  } else {
    context.fillStyle = '#ffffff'
  }
  let adjustedFuelPosition = vcs.translate(fuelPosition)
  context.fillText(
    `Fuel: ${fuel.toFixed(2)}L`,
    adjustedFuelPosition.x,
    adjustedFuelPosition.y
  )

  // Angle
  let angle = globalState.lander.rotation
  if (angle < 5 || angle > 355) {
    context.fillStyle = '#00ff00'
  } else {
    context.fillStyle = '#ffffff'
  }
  let adjustedAnglePosition = vcs.translate(anglePosition)
  context.fillText(
    `Angle: ${angle.toFixed(2)}°`,
    adjustedAnglePosition.x,
    adjustedAnglePosition.y
  )

  // Velocity
  let magn = globalState.lander.velocity.magnitude()
  if (magn < 2) {
    context.fillStyle = '#00ff00'
  } else {
    context.fillStyle = '#ffffff'
  }
  let adjustedVelocityPosition = vcs.translate(velocityPosition)
  context.fillText(
    `Velocity: ${magn.toFixed(2)} m/s`,
    adjustedVelocityPosition.x,
    adjustedVelocityPosition.y
  )
  context.fillStyle = '#ffffff'
}

function buildCommands (state: GlobalState): CommandService<GlobalState> {
  const commands = new CommandService<GlobalState>()
  // Command Creation
  commands.createCommand('beginThrust', globalState => {
    globalState.lander.thrusting = true
    if (globalState.lander.fuel > 0) {
      globalState.sounds.mainThruster.play()
    } else {
      globalState.sounds.noFuel.play()
    }
  })

  commands.createCommand('endThrust', globalState => {
    globalState.lander.thrusting = false
    globalState.sounds.mainThruster.stop()
    globalState.sounds.noFuel.stop()
  })

  commands.createCommand('fuelExpired', globalState => {
    if (globalState.sounds.mainThruster.playing) {
      globalState.sounds.mainThruster.stop()
      globalState.sounds.noFuel.play()
    }
    if (globalState.sounds.subThruster.playing) {
      globalState.sounds.subThruster.stop()
      globalState.sounds.noFuel.play()
    }
  })

  commands.createCommand('beginTurnLeft', globalState => {
    globalState.lander.turningLeft = true
    if (globalState.lander.fuel > 0) {
      globalState.sounds.subThruster.play()
    } else {
      globalState.sounds.noFuel.play()
    }
  })

  commands.createCommand('endTurnLeft', globalState => {
    globalState.sounds.subThruster.stop()
    globalState.sounds.noFuel.stop()
    globalState.lander.turningLeft = false
  })

  commands.createCommand('beginTurnRight', globalState => {
    if (globalState.lander.fuel > 0) {
      globalState.sounds.subThruster.play()
    } else {
      globalState.sounds.noFuel.play()
    }
    globalState.lander.turningRight = true
  })

  commands.createCommand('endTurnRight', globalState => {
    globalState.sounds.subThruster.stop()
    globalState.sounds.noFuel.stop()
    globalState.lander.turningRight = false
  })

  commands.createCommand('safeLanding', globalState => {
    globalState.sounds.landing.play()
    globalState.lander.freeze()
    setTimeout(() => {
        globalState.running = false
        start(buildState(), 2);
    }, 3000);
  })

  commands.createCommand('crashLanding', globalState => {
    globalState.sounds.explosion.play()
    globalState.lander.crashed = true
    globalState.lander.freeze()
  })

  return commands;
}

function buildKeys (state: GlobalState): KeyManager {
  // Default Keybindings
  const keys = new KeyManager()
  mapToCommands(keys, state.commands, 'Thrust', 'ArrowUp', state);
  mapToCommands(keys, state.commands, 'TurnLeft', 'ArrowLeft', state);
  mapToCommands(keys, state.commands, 'TurnRight', 'ArrowRight', state);
  return keys
}

export function buildState (): GlobalState {
  let globalState: GlobalState = {
    terrain: undefined,
    running: true,
    lander: undefined,
    safeZones: undefined,
    commands: undefined,
    keys: undefined,
    config: {
      fuelConsumption: 20,
      thrustCoefficient: 10,
      theta: 90,
      gravity: new Vector2(0, 1),
      worldSize
    },
    sounds: {
      mainThruster: new SoundEffect('assets/mainthruster.wav', 4),
      subThruster: new SoundEffect('assets/subthruster.wav', 4),
      explosion: new SoundEffect('assets/explosion.wav'),
      landing: new SoundEffect('assets/landing.wav'),
      noFuel: new SoundEffect('assets/nofuel.wav', 1)
    }
  }
  globalState.commands = buildCommands(globalState)
  globalState.keys = buildKeys(globalState)
  return globalState
}

export function start (globalState: GlobalState, difficulty: number = 1) {
  const lander = new Lander(
    new Vector2(worldSize.x / 2, 0),
    landerTexture,
    new Vector2(5, 5)
  )
  globalState.lander = lander
  drawables = [];
  ticking = [];
  drawables.push(lander)
  ticking.push(lander)
  const terrain = new Terrain(8, 500, new Vector2(0, worldSize.y * 2 / 3), new Vector2(worldSize.x, worldSize.y * 2 / 3))
  const safeZones: Array<Array<Vector2>> = []
  const count = 3 - difficulty;
  const min = 10;
  const max = worldSize.x - 10;
  const validPortions = (max - min) / count;
  for (let i = 0; i < count; i++) {
    safeZones.push(terrain.insertSafeZone(min + validPortions * i, min + validPortions * (i + 1), count * 7.5));
  }

  globalState.terrain = terrain;
  globalState.safeZones = safeZones;

  requestAnimationFrame(loop(globalState))
}
