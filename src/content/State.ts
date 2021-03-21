import { CommandService } from "../core/Command";
import { KeyManager } from "../core/KeyManager";
import { Lander } from "./Lander";
import { Page } from "../core/menus/Page";
import { SoundEffect } from "../core/SoundEffect";
import { Terrain } from "./Terrain";
import Vector2 from "../core/geometry/Vector2";

export interface GlobalState<T> {
  // Rates
  config: GameConfig;
  localState: T;
  commands: CommandService<GlobalState<T>>;
  keys: KeyManager;
  sounds: GameSounds;
  router: Router;
}

export interface Router {
  pages: Record<string, Page>;
  currentPage: Page;
  transitionData: Record<string, unknown>;
  requestTransition(id: string, data?: Record<string, unknown>): void;
}

export interface PlayState {
  // Game Running
  running: boolean;
  // Important Objects
  lander: Lander;
  terrain: Terrain;
  safeZones: Array<Array<Vector2>>;
  level: number;
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
