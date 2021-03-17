interface CommandRunnable<T> {
  (state: T): void;
}

class Command<T> {
  private _name: string;
  private _action: CommandRunnable<T>;
  constructor(name: string, action: CommandRunnable<T>) {
    this._name = name;
    this._action = action;
  }

  public get name(): string {
    return this._name;
  }

  public invoke(state: T): void {
    this._action(state);
  }
}

export class CommandService<T> {
  private commands: Map<string, Command<T>>;

  constructor() {
    this.commands = new Map<string, Command<T>>();
  }

  public createCommand(name: string, action: CommandRunnable<T>): void {
    this.commands.set(name, new Command(name, action));
  }

  public execute(name: string, state: T): void {
    if (this.commands.has(name)) {
      this.commands.get(name).invoke(state);
    } else {
      console.warn(`Attempting to invoke non-existent command ${name}`);
    }
  }
}
