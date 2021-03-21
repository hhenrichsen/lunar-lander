import { CommandService } from "./core/Command";
import { KeyManager } from "./core/KeyManager";
import { Page } from "./core/menus/Page";
import { MainMenu } from "./pages/MainMenu";
import { PlayPage } from "./pages/PlayPage";
import { SoundEffect } from "./core/SoundEffect";
import { GlobalState, PlayState } from "./content/State";
import Vector2 from "./core/geometry/Vector2";
import { buildDefaultKeys } from "./content/DefaultKeys";
import { buildCommands } from './content/Commands';
import { CreditsPage } from "./pages/CreditsPage";

export function buildState(): GlobalState<PlayState> {
  const ratio = new Vector2(4 / 3, 1);
  const worldSize = ratio.scale(100);
  const state = {
    commands: undefined as CommandService<GlobalState<PlayState>>,
    localState: null as PlayState,
    keys: undefined as KeyManager,
    config: {
      fuelConsumption: 20,
      thrustCoefficient: 10,
      theta: 90,
      gravity: new Vector2(0, 1),
      worldSize,
      screenRatio: ratio,
    },
    sounds: {
      mainThruster: new SoundEffect("assets/mainthruster.wav", 4),
      subThruster: new SoundEffect("assets/subthruster.wav", 4),
      explosion: new SoundEffect("assets/explosion.wav"),
      landing: new SoundEffect("assets/landing.wav"),
      noFuel: new SoundEffect("assets/nofuel.wav", 1),
    },
    router: {
      currentPage: undefined as Page,
      transitionData: {},
      requestTransition(id: string, data?: Record<string, unknown>) {
        if (this.router.pages[id] === undefined) {
          return;
        }
        if (this.router.currentPage === undefined || this.router.currentPage.canTransition(id)) {
          this.router.currentPage = this.router.pages[id];
          this.router.transitionData = data;
          const el = document.getElementById('main');
          el.innerHTML = "";
          el.classList.forEach(it => el.classList.remove(it))
          el.classList.add(id);
          this.router.currentPage.load(el, this);
          this.localState = null;
          this.router.currentPage.init(this);
        }
      },
      pages: {'home': new MainMenu(), 'play': new PlayPage(), 'credits': new CreditsPage()},
    }
  };
  state.router.requestTransition = state.router.requestTransition.bind(state);
  state.commands = buildCommands(state);
  state.keys = buildDefaultKeys(state);
  return state;
}