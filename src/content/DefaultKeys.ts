import { KeyManager, mapToCommands } from "../core/KeyManager";
import { GlobalState, PlayState } from "./State";

export function buildKeys(
    state: GlobalState<PlayState>,
    keyMap: Record<string, string>
): KeyManager {
    // Default Keybindings
    const keys = new KeyManager();
    for (const evt of Object.keys(keyMap)) {
        mapToCommands(keys, state.commands, evt, keyMap[evt], state);
    }
    return keys;
}
