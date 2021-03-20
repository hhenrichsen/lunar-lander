import Vector2 from "./vector2";
import { drawTexture, Texture } from "./texture";
import Drawable from "./drawable";
import Ticking from "./ticking";
import { VirtualCoordinateSystem } from "./coordinate";
import { GlobalState, PlayState } from "./state";
import { Lander } from "./lander";
import { KeyManager, mapToCommands } from "./key";
import { CommandService } from "./command";
import { drawTerrain, Terrain } from "./terrain";
import { ConditionalDrawable } from "./conditionalDrawable";
import { SoundEffect } from "./sound";

// General Setup
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d");
const ratio = new Vector2(4 / 3, 1);
const worldSize = ratio.scale(100);

const landerTexture = new Texture("assets/Lander.png", new Vector2(500, 500));

// Virtual Sizing
if (window.innerWidth / ratio.x < window.innerHeight / ratio.y) {
  canvas.width = window.innerWidth;
  canvas.height = (window.innerWidth * ratio.y) / ratio.x;
} else {
  canvas.width = (window.innerHeight * ratio.x) / ratio.y;
  canvas.height = window.innerHeight;
}

let vcs = new VirtualCoordinateSystem(
  canvas.width / worldSize.x,
  canvas.height / worldSize.y
);

// Resize
function resize() {
  if (window.innerWidth / ratio.x < window.innerHeight / ratio.y) {
    canvas.width = window.innerWidth;
    canvas.height = (window.innerWidth * ratio.y) / ratio.x;
  } else {
    canvas.width = (window.innerHeight * ratio.x) / ratio.y;
    canvas.height = window.innerHeight;
  }

  vcs = new VirtualCoordinateSystem(
    canvas.width / worldSize.x,
    canvas.height / worldSize.y
  );
}

window.addEventListener("resize", resize);

let drawables = new Array<Drawable<GlobalState<PlayState>>>();
let ticking = new Array<Ticking<GlobalState<PlayState>>>();

const fuelPosition = new Vector2(5, 5);
const anglePosition = new Vector2(5, 7.5);
const velocityPosition = new Vector2(5, 10);

// Game loop
let lastTime = 0;
function loop(state: GlobalState<PlayState>): FrameRequestCallback {
  const fn = function (currentTime: number) {
    const delta = currentTime - lastTime;
    lastTime = currentTime;

    update(delta / 1000, state);
    draw(state);

    if (state.localState.running) {
      requestAnimationFrame(fn);
    }
  };
  return fn;
}

function update(delta: number, state: GlobalState<PlayState>) {
  for (let i = 0; i < ticking.length; i++) {
    ticking[i].update(delta, state);
  }
}
function draw(state: GlobalState<PlayState>) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawTerrain(context, state, vcs);
  for (let i = 0; i < drawables.length; i++) {
    drawables[i].draw(context, state, vcs);
  }
  drawText(context, state);
}

function drawText(
  context: CanvasRenderingContext2D,
  state: GlobalState<PlayState>
) {
  const fontSize = vcs.translateValueX(2);
  context.font = `${fontSize}px Arial`;

  // Fuel
  const fuel = state.localState.lander.fuel;
  if (fuel > 0) {
    context.fillStyle = "#00ff00";
  } else {
    context.fillStyle = "#ffffff";
  }
  const adjustedFuelPosition = vcs.translate(fuelPosition);
  context.fillText(
    `Fuel: ${fuel.toFixed(2)}L`,
    adjustedFuelPosition.x,
    adjustedFuelPosition.y
  );

  // Angle
  const angle = state.localState.lander.rotation;
  if (angle < 5 || angle > 355) {
    context.fillStyle = "#00ff00";
  } else {
    context.fillStyle = "#ffffff";
  }
  const adjustedAnglePosition = vcs.translate(anglePosition);
  context.fillText(
    `Angle: ${angle.toFixed(2)}°`,
    adjustedAnglePosition.x,
    adjustedAnglePosition.y
  );

  // Velocity
  const magn = state.localState.lander.velocity.magnitude();
  if (magn < 2) {
    context.fillStyle = "#00ff00";
  } else {
    context.fillStyle = "#ffffff";
  }
  const adjustedVelocityPosition = vcs.translate(velocityPosition);
  context.fillText(
    `Velocity: ${magn.toFixed(2)} m/s`,
    adjustedVelocityPosition.x,
    adjustedVelocityPosition.y
  );
  context.fillStyle = "#ffffff";
}

function buildCommands(
  state: GlobalState<PlayState>
): CommandService<GlobalState<PlayState>> {
  const commands = new CommandService<GlobalState<PlayState>>();
  // Command Creation
  commands.createCommand("beginThrust", (state) => {
    if (state.localState.lander.frozen) return;
    state.localState.lander.thrusting = true;
    if (state.localState.lander.fuel > 0) {
      state.sounds.mainThruster.play();
    } else {
      state.sounds.noFuel.play();
    }
  });

  commands.createCommand("endThrust", (state) => {
    state.localState.lander.thrusting = false;
    state.sounds.mainThruster.stop();
    state.sounds.noFuel.stop();
  });

  commands.createCommand("fuelExpired", (state) => {
    if (state.localState.lander.frozen) return;
    if (state.sounds.mainThruster.playing) {
      state.sounds.mainThruster.stop();
      state.sounds.noFuel.play();
    }
    if (state.sounds.subThruster.playing) {
      state.sounds.subThruster.stop();
      state.sounds.noFuel.play();
    }
  });

  commands.createCommand("beginTurnLeft", (state) => {
    if (state.localState.lander.frozen) return;
    state.localState.lander.turningLeft = true;
    if (state.localState.lander.fuel > 0) {
      state.sounds.subThruster.play();
    } else {
      state.sounds.noFuel.play();
    }
  });

  commands.createCommand("endTurnLeft", (state) => {
    if (state.localState.lander.frozen) return;
    state.sounds.subThruster.stop();
    state.sounds.noFuel.stop();
    state.localState.lander.turningLeft = false;
  });

  commands.createCommand("beginTurnRight", (state) => {
    if (state.localState.lander.frozen) return;
    if (state.localState.lander.fuel > 0) {
      state.sounds.subThruster.play();
    } else {
      state.sounds.noFuel.play();
    }
    state.localState.lander.turningRight = true;
  });

  commands.createCommand("endTurnRight", (state) => {
    if (state.localState.lander.frozen) return;
    state.sounds.subThruster.stop();
    state.sounds.noFuel.stop();
    state.localState.lander.turningRight = false;
  });

  commands.createCommand("safeLanding", (state) => {
    state.sounds.landing.play();
    state.localState.lander.freeze();
    setTimeout(() => {
      state.localState.running = false;
      start(buildState(), 2);
    }, 3000);
  });

  commands.createCommand("crashLanding", (state) => {
    state.sounds.mainThruster.stop();
    state.sounds.subThruster.stop();
    state.sounds.noFuel.stop();
    state.sounds.explosion.play();
    state.localState.lander.crashed = true;
    state.localState.lander.freeze();
  });

  return commands;
}

function buildKeys(state: GlobalState<PlayState>): KeyManager {
  // Default Keybindings
  const keys = new KeyManager();
  mapToCommands(keys, state.commands, "Thrust", "ArrowUp", state);
  mapToCommands(keys, state.commands, "TurnLeft", "ArrowLeft", state);
  mapToCommands(keys, state.commands, "TurnRight", "ArrowRight", state);
  return keys;
}

export function buildState(): GlobalState<PlayState> {
  const state: GlobalState<PlayState> = {
    localState: {
      terrain: undefined,
      running: true,
      lander: undefined,
      safeZones: undefined,
    },
    commands: undefined,
    keys: undefined,
    config: {
      fuelConsumption: 20,
      thrustCoefficient: 10,
      theta: 90,
      gravity: new Vector2(0, 1),
      worldSize,
    },
    sounds: {
      mainThruster: new SoundEffect("assets/mainthruster.wav", 4),
      subThruster: new SoundEffect("assets/subthruster.wav", 4),
      explosion: new SoundEffect("assets/explosion.wav"),
      landing: new SoundEffect("assets/landing.wav"),
      noFuel: new SoundEffect("assets/nofuel.wav", 1),
    },
  };
  state.commands = buildCommands(state);
  state.keys = buildKeys(state);
  return state;
}

export function start(state: GlobalState<PlayState>, difficulty = 1): void {
  const lander = new Lander(
    new Vector2(worldSize.x / 2, 0),
    landerTexture,
    new Vector2(5, 5)
  );
  drawables = [];
  ticking = [];
  drawables.push(lander);
  ticking.push(lander);
  const terrain = new Terrain(
    8,
    500,
    new Vector2(0, (worldSize.y * 2) / 3),
    new Vector2(worldSize.x, (worldSize.y * 2) / 3)
  );
  const safeZones: Array<Array<Vector2>> = [];
  const count = 3 - difficulty;
  const min = 10;
  const max = worldSize.x - 10;
  const validPortions = (max - min) / count;
  for (let i = 0; i < count; i++) {
    safeZones.push(
      terrain.insertSafeZone(
        min + validPortions * i,
        min + validPortions * (i + 1),
        count * 7.5
      )
    );
  }

  state.localState = {
    safeZones,
    lander,
    terrain,
    running: true,
  };

  requestAnimationFrame(loop(state));
}
