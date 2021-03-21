import { KeyManager, mapToCommands } from "../core/KeyManager";
import { GlobalState, PlayState } from "./State";

export function buildDefaultKeys(state: GlobalState<PlayState>): KeyManager {
  // Default Keybindings
  const keys = new KeyManager();
  mapToCommands(keys, state.commands, "Thrust", "ArrowUp", state);
  mapToCommands(keys, state.commands, "TurnLeft", "ArrowLeft", state);
  mapToCommands(keys, state.commands, "TurnRight", "ArrowRight", state);
  return keys;
}