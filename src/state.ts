import { CommandService } from './command';
import { KeyManager } from './key';
import { Lander } from './lander';
import { Terrain } from './terrain';
import Vector2 from './vector2';

export interface GlobalState {
    // Rates
    config: GameConfig
    // Important Objects
    lander: Lander;
    terrain: Terrain;
    safeZones: Array<Array<Vector2>>,
    commands: CommandService<GlobalState>,
    keys: KeyManager
}

export interface GameConfig {
    gravity: Vector2; // u / second
    thrustCoefficient: number;  // u / second
    fuelConsumption: number; // fuel / second
    theta: number; // degrees / second
}