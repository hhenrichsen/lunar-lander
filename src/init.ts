import { CommandService } from "./core/Command";
import { KeyManager } from "./core/KeyManager";
import { HomePage } from "./pages/MainMenu";
import { PlayPage } from "./pages/PlayPage";
import { SoundEffect } from "./core/SoundEffect";
import { GlobalState, isPersistentState, PersistentState, PlayState } from "./content/State";
import Vector2 from "./core/geometry/Vector2";
import { buildKeys } from "./content/DefaultKeys";
import { buildCommands } from './content/Commands';
import { CreditsPage } from "./pages/CreditsPage";
import { SimpleRouter } from "./core/menus/Router";
import { PersistenceManager } from "./core/data/Persistence";
import { KeysPage } from "./pages/KeysPage";
import { ScoresPage } from "./pages/ScoresPage";

export function buildState(): GlobalState<PlayState> {
  const ratio = new Vector2(4 / 3, 1);
  const worldSize = ratio.scale(100);
  const state = {
    commands: undefined as CommandService<GlobalState<PlayState>>,
    localState: undefined as PlayState,
    keys: undefined as KeyManager,
    eventMap: new Map<string, string>(),
    config: {
      fuelConsumption: 20,
      thrustCoefficient: 10,
      theta: 90,
      gravity: new Vector2(0, 1),
      worldSize,
      screenRatio: ratio,
    },
    persistentState: undefined as PersistentState,
    sounds: {
      mainThruster: new SoundEffect("assets/mainthruster.wav", 4),
      subThruster: new SoundEffect("assets/subthruster.wav", 4),
      explosion: new SoundEffect("assets/explosion.wav"),
      landing: new SoundEffect("assets/landing.wav"),
      noFuel: new SoundEffect("assets/nofuel.wav", 1),
    },
    router: undefined as SimpleRouter<GlobalState<unknown>>,
    persistence: undefined as PersistenceManager<GlobalState<unknown>, PersistentState>
  };
  state.router = new SimpleRouter<GlobalState<unknown>>(state);
  state.router.addPage('home', new HomePage());
  state.router.addPage('play', new PlayPage());
  state.router.addPage('credits', new CreditsPage());
  state.router.addPage('scores', new ScoresPage());
  state.router.addPage('controls', new KeysPage());
  state.commands = buildCommands(state);
  state.persistence = new PersistenceManager('landerData', () => {
    return {
      scores: [],
      eventMap: {
        'Thrust': 'UpArrow',
        'TurnLeft': 'LeftArrow',
        'TurnRight': 'RightArrow'
      }
    }
  }, isPersistentState);
  state.keys = buildKeys(state, state.persistence.get(state).eventMap);
  window.addEventListener('keydown', goPrev(state));
  return state;
}

function goPrev(state: GlobalState<any>) {
  return function(evt: KeyboardEvent) {
    if (evt.key === "Escape") {
      if (state.localState !== undefined && state.localState.ticking !== undefined && typeof(state.localState.ticking) === "boolean") {
        state.localState.ticking = !state.localState.ticking;
        return;
      }
      state.router.previous(state);
    }
  }
}