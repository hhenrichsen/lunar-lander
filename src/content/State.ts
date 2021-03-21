import { CommandService } from "../core/Command";
import { KeyManager } from "../core/KeyManager";
import { Lander } from "./Lander";
import { SoundEffect } from "../core/SoundEffect";
import { Terrain } from "./Terrain";
import Vector2 from "../core/geometry/Vector2";
import { Router } from "../core/menus/Router";
import { Score } from "./Score";
import { PersistenceManager } from "../core/data/Persistence";

export interface GlobalState<T> {
  // Rates
  config: GameConfig;
  localState: T;
  commands: CommandService<GlobalState<T>>;
  keys: KeyManager;
  sounds: GameSounds;
  router: Router<GlobalState<T>>;
  persistence: PersistenceManager<GlobalState<T>, PersistentState>;
}

export interface PersistentState {
  scores: Array<Score>,
  eventMap: Record<string, string>
}

export function isPersistentState(obj: any): obj is PersistentState {
  return obj && obj.scores && obj.eventMap && Array.isArray(obj.scores) && typeof(obj.eventMap) === "object";
}

export interface PlayState {
  // Game Running
  running: boolean;
  ticking: boolean;
  // Important Objects
  lander: Lander;
  terrain: Terrain;
  safeZones: Array<Array<Vector2>>;
  level: number;
  score: number;
  transition: boolean;
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
  screenRatio: Vector2;
}
