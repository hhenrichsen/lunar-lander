import Vector2 from "./vector2";
import { drawTexture, Texture } from "./texture";
import Drawable from './drawable';
import Ticking from "./ticking";
import { VirtualCoordinateSystem } from "./coordinate";
import { GlobalState } from './state';
import { Lander } from './lander';
import { KeyManager } from './key';
import { CommandService } from "./command";
import { drawTerrain, Terrain } from "./terrain";
import { ConditionalDrawable } from "./conditionalDrawable";

// General Setup
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');
const keys = new KeyManager();
const commands = new CommandService<GlobalState>();
const worldDimension = 100;
const worldSize = new Vector2(worldDimension, worldDimension);
const landerTexture = new Texture('assets/Lander.png', new Vector2(500, 500));
const terrain = new Terrain(5, 15, new Vector2(0, 70), new Vector2(100, 70));
const safeZones = [];
safeZones.push(terrain.insertSafeZone(10, 40, 15));
safeZones.push(terrain.insertSafeZone(60, 90, 15));
console.log(terrain.points);

// Virtual Sizing
let maxCoord = Math.min(window.innerWidth, window.innerHeight);
console.log(maxCoord);
canvas.width = maxCoord;
canvas.height = maxCoord;
let vcs = new VirtualCoordinateSystem(maxCoord / worldSize.x, maxCoord / worldSize.y);

// Resize
function resize() {
    maxCoord = Math.min(window.innerWidth, window.innerHeight);

    canvas.width = maxCoord;
    canvas.height = maxCoord;

    vcs = new VirtualCoordinateSystem(maxCoord / worldSize.x, maxCoord / worldSize.y);
    console.log(`Resizing to ${maxCoord}px.`)
}

window.addEventListener('resize', resize);

const lander = new Lander(new Vector2(worldSize.x / 2, 0), landerTexture, new Vector2(10, 10));

const drawables = new Array<Drawable<GlobalState>>();
const ticking = new Array<Ticking<GlobalState>>();

// Command Creation
commands.createCommand('enableThrust', (globalState) => {
    console.log("Thrusting...")
    globalState.lander.thrusting = true;
});

commands.createCommand('disableThrust', (globalState) => {
    globalState.lander.thrusting = false;
})

commands.createCommand('beginTurnLeft', (globalState) => {
    globalState.lander.turningLeft = true;
})

commands.createCommand('endTurnLeft', (globalState) => {
    globalState.lander.turningLeft = false;
})

commands.createCommand('beginTurnRight', (globalState) => {
    globalState.lander.turningRight = true;
})

commands.createCommand('endTurnRight', (globalState) => {
    globalState.lander.turningRight = false;
})

commands.createCommand('safeLanding', (globalState) => {
    globalState.lander.freeze();
})

commands.createCommand('crashLanding', (globalState) => {
    globalState.lander.crashed = true;
    globalState.lander.freeze();
})

// Default Keybindings
keys.registerHandler(' ');
keys.registerHandler('q');
keys.registerHandler('e');
keys.bindDown(' ', () => commands.execute('enableThrust', globalState))
keys.bindUp(' ', () => commands.execute('disableThrust', globalState))
keys.bindDown('q', () => commands.execute('beginTurnLeft', globalState))
keys.bindUp('q', () => commands.execute('endTurnLeft', globalState))
keys.bindDown('e', () => commands.execute('beginTurnRight', globalState))
keys.bindUp('e', () => commands.execute('endTurnRight', globalState))

// State Initialization
let globalState: GlobalState = {
    terrain,
    lander,
    safeZones,
    commands,
    keys,
    config: {
        fuelConsumption: 20,
        thrustCoefficient: 10,
        theta: 90,
        gravity: new Vector2(0, 1),
    }
};

drawables.push(new ConditionalDrawable<GlobalState>((state: GlobalState) => !state.lander.crashed, lander));
ticking.push(lander);

// Game loop
let lastTime: number = 0;
function loop(currentTime: number) {
    const delta = currentTime - lastTime;
    lastTime = currentTime;

    update(delta / 1000, globalState);
    draw(globalState);

    requestAnimationFrame(loop);
}

function update(delta: number, globalState: GlobalState) {
    for (let i = 0; i < ticking.length; i++) {
        ticking[i].update(delta, globalState)
    }
}

let fuelPosition = new Vector2(5, 5);
let anglePosition = new Vector2(5, 7.5);
let velocityPosition = new Vector2(5, 10);
function draw(globalState: GlobalState) {
    context.clearRect(0, 0, maxCoord, maxCoord);
    drawTerrain(context, terrain, vcs);
    for (let i = 0; i < drawables.length; i++) {
        drawables[i].draw(context, globalState, vcs);
    }
    drawText(context);
}

function drawText(context: CanvasRenderingContext2D) {
    let fontSize = vcs.translateValueX(2);
    context.font = `${fontSize}px Arial`

    // Fuel
    let fuel = globalState.lander.fuel;
    if (fuel > 0) {
        context.fillStyle = '#00ff00';
    }
    else {
        context.fillStyle = '#ffffff';
    }
    let adjustedFuelPosition = vcs.translate(fuelPosition);
    context.fillText(`Fuel: ${fuel.toFixed(2)}L`, adjustedFuelPosition.x, adjustedFuelPosition.y);

    // Angle
    let angle = globalState.lander.rotation;
    if (angle < 5 || angle > 355) {
        context.fillStyle = '#00ff00';
    }
    else {
        context.fillStyle = '#ffffff';
    }
    let adjustedAnglePosition = vcs.translate(anglePosition);
    context.fillText(`Angle: ${angle.toFixed(2)}°`, adjustedAnglePosition.x, adjustedAnglePosition.y);

    // Velocity
    let magn = globalState.lander.velocity.magnitude();
    if (magn < 2) {
        context.fillStyle = '#00ff00';
    }
    else {
        context.fillStyle = '#ffffff';
    }
    let adjustedVelocityPosition = vcs.translate(velocityPosition);
    context.fillText(`Velocity: ${magn.toFixed(2)} m/s`, adjustedVelocityPosition.x, adjustedVelocityPosition.y);
    context.fillStyle = '#ffffff';
}

requestAnimationFrame(loop);

function testVector() {
    let v = new Vector2(0, 1);
    console.log(v.rotate(90).toString());
}

testVector();