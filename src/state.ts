import { CommandService } from './command';
import { Lander } from './lander';
import { Terrain } from './terrain';
import Vector2 from './vector2';

export interface GlobalState {
    // Rates
    config: GameConfig
    // States
    // TODO: Move into Lander.
    crashed: boolean;
    thrust: boolean;
    fuel: number;
    turnLeft: boolean;
    turnRight: boolean;
    // Important Objects
    lander: Lander;
    terrain: Terrain;
    safeZones: Array<Array<Vector2>>,
    commands: CommandService<GlobalState>
}

export interface GameConfig {
    gravity: Vector2; // u / second
    thrustCoefficient: number;  // u / second
    fuelConsumption: number; // fuel / second
    theta: number; // degrees / second
}