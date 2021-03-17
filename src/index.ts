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

// General Setup
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');
const keys = new KeyManager();
const commands = new CommandService<GlobalState>();
const worldDimension = 100;
const worldSize = new Vector2(worldDimension, worldDimension);
const landerTexture = new Texture('assets/Lander.png', new Vector2(500, 500));
const terrain = new Terrain(5, 15, new Vector2(0, 70), new Vector2(100, 70));
terrain.insertSafeZone(10, 40, 15);
terrain.insertSafeZone(60, 90, 15);
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

// State Initialization
let globalState: GlobalState = {
    gravity: new Vector2(0, 1),
    thrust: false,
    turnLeft: false,
    turnRight: false,
    crashed: false,
    fuel: 100,
    fuelConsumption: 0.5,
    thrustCoefficient: 10,
    theta: 90,
    terrain: terrain,
    lander: lander
};

const drawables = new Array<Drawable<GlobalState>>();
const ticking = new Array<Ticking<GlobalState>>();

// Command Creation
commands.createCommand('enableThrust', (globalState) => {
    console.log("Thrust enabled...");
    globalState.thrust = true;
});

commands.createCommand('disableThrust', (globalState) => {
    globalState.thrust = false;
})

commands.createCommand('beginTurnLeft', (globalState) => {
    globalState.turnLeft = true;
})

commands.createCommand('endTurnLeft', (globalState) => {
    globalState.turnLeft = false;
})

commands.createCommand('beginTurnRight', (globalState) => {
    globalState.turnRight = true;
})

commands.createCommand('endTurnRight', (globalState) => {
    globalState.turnRight = false;
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

drawables.push(lander);
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

function draw(globalState: GlobalState) {
    context.clearRect(0, 0, maxCoord, maxCoord);
    for (let i = 0; i < drawables.length; i++) {
        drawables[i].draw(context, globalState, vcs);
    }
    drawTerrain(context, terrain, vcs);
}

requestAnimationFrame(loop);

function testVector() {
    let v = new Vector2(0, 1);
    console.log(v.rotate(90).toString());
}

testVector();