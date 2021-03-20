import { CommandService } from "./command";
import { KeyManager } from "./key";
import { Lander } from "./lander";
import { SoundEffect } from "./sound";
import { Terrain } from "./terrain";
import Vector2 from "./vector2";

export interface GlobalState<T> {
  // Rates
  config: GameConfig;
  localState: T;
  commands: CommandService<GlobalState<T>>;
  keys: KeyManager;
  sounds: GameSounds;
}

export interface PlayState {
  // Game Running
  running: boolean;
  // Important Objects
  lander: Lander;
  terrain: Terrain;
  safeZones: Array<Array<Vector2>>;
}

export interface GameSounds {
  mainThruster: SoundEffect;
  subThruster: SoundEffect;
  explosion: SoundEffect;
  landing: SoundEffect;
  noFuel: SoundEffect;
}

export interface GameConfig {
  gravity: Vector2; // u / second
  thrustCoefficient: number; // u / second
  fuelConsumption: number; // fuel / second
  theta: number; // degrees / second
  worldSize: Vector2;
}
