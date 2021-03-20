import { CommandService } from "./command";

interface Modifiers {
  alt: boolean;
  shift: boolean;
  ctrl: boolean;
}

interface KeyResponse {
  (pressed: boolean, timeDelta: number, modifiers: Modifiers): void;
}

class KeyHandler {
  private _wasPressed: boolean = false;
  private _lastPressed: number = Date.now();
  private _onStateChanged: Set<KeyResponse> = new Set();
  private _onKeyUp: Set<KeyResponse> = new Set();
  private _onKeyDown: Set<KeyResponse> = new Set();

  update(pressed: boolean, modifiers: Modifiers) {
    if (this._wasPressed != pressed) {
      // Init set
      let set;
      if (pressed) {
        set = this._onKeyDown;
      } else {
        set = this._onKeyUp;
      }

      // Time delta
      const now = Date.now();

      // Handlers
      for (let res of set) {
        res(pressed, now - this._lastPressed, modifiers);
      }
      for (let res of this._onStateChanged) {
        res(pressed, now - this._lastPressed, modifiers);
      }

      // Updates
      this._lastPressed = now;
      this._wasPressed = !this._wasPressed;
    }
  }

  addUp(action: KeyResponse) {
    this._onKeyUp.add(action);
  }
  addDown(action: KeyResponse) {
    this._onKeyDown.add(action);
  }
  addChanged(action: KeyResponse) {
    this._onStateChanged.add(action);
  }
}

export class KeyManager {
  private handlers: Map<string, KeyHandler>;
  private descriptions: Map<string, string>;
  public registerHandler(keyCode: string, description?: string) {
    if (!this.handlers.has(keyCode)) {
      this.handlers.set(keyCode, new KeyHandler());
      this.descriptions?.set(keyCode, description);
    } else {
      console.warn(`Key handler registered twice for keyCode ${keyCode}`);
    }
  }
  bindUp(keyCode: string, updateFn: KeyResponse) {
    this.handlers.get(keyCode).addUp(updateFn);
  }
  bindDown(keyCode: string, updateFn: KeyResponse) {
    this.handlers.get(keyCode).addDown(updateFn);
  }
  bindChanged(keyCode: string, updateFn: KeyResponse) {
    this.handlers.get(keyCode).addChanged(updateFn);
  }
  updateDown(event: KeyboardEvent) {
    if (this.handlers.has(event.key)) {
      event.preventDefault();
      const handler = this.handlers.get(event.key);
      handler.update(true, {
        alt: event.altKey,
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
      });
    }
  }

  updateUp(event: KeyboardEvent) {
    if (this.handlers.has(event.key)) {
      event.preventDefault();
      const handler = this.handlers.get(event.key);
      handler.update(false, {
        alt: event.altKey,
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
      });
    }
  }
  clear() {
    this.handlers = new Map();
  }

  remove(keycode: string) {
    this.handlers.delete(keycode);
  }

  constructor() {
    window.addEventListener("keydown", this.updateDown.bind(this));
    window.addEventListener("keyup", this.updateUp.bind(this));
    this.handlers = new Map<string, KeyHandler>();
  }
}

export function mapToCommands<T>(
  keyManager: KeyManager,
  commands: CommandService<T>,
  commandName: string,
  keyName: string,
  state: T
) {
  keyManager.registerHandler(keyName, commandName);
  if (commands.has(`begin${commandName}`)) {
    keyManager.bindDown(keyName, () =>
      commands.execute(`begin${commandName}`, state)
    );
  }
  if (commands.has(`end${commandName}`)) {
    keyManager.bindUp(keyName, () =>
      commands.execute(`end${commandName}`, state)
    );
  }
  if (commands.has(`toggle${commandName}`)) {
    keyManager.bindChanged(keyName, () =>
      commands.execute(`toggle${commandName}`, state)
    );
  }
}
