import { Lander } from './lander';
import { Terrain } from './terrain';
import Vector2 from './vector2';

export interface GlobalState {
    // Rates
    gravity: Vector2; // u / second
    thrustCoefficient: number;  // u / second
    fuelConsumption: number; // fuel / second
    theta: number; // degrees / second
    // States
    crashed: boolean;
    thrust: boolean;
    fuel: number;
    turnLeft: boolean;
    turnRight: boolean;
    lander: Lander;
    terrain: Terrain;
}