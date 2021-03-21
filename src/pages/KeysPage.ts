import { Page } from "../core/menus/Page";
import { GlobalState } from "../content/State";
import { updateLanguageServiceSourceFile } from "../../node_modules/typescript/lib/typescript";
import { mapToCommands } from "../core/KeyManager";

interface KeyState {
    listeningEvent: string;
}

export class KeysPage implements Page<GlobalState<unknown>> {
    private state: GlobalState<KeyState>;

    constructor() {
        this.updateKey = this.updateKey.bind(this)
    }

    load(base: HTMLElement, state: GlobalState<KeyState>): void {
        const { eventMap } = state.persistence.get(state);
        const header = document.createElement('h1');
        header.innerText = 'Key Configuration';
        base.appendChild(header);

        const container = document.createElement('div');
        container.classList.add('btn-container');

        for (const key of Object.keys(eventMap)) {
            const btn = document.createElement('button');
            btn.id = key;
            btn.innerText = `${key.replace(/([a-z](?=[A-Z]))/g, '$1 ')} (${eventMap[key]})`; // CamelCase -> Camel Case
            btn.addEventListener('click', () => {
                this.setListeningEvent(state, key);
            });
            container.appendChild(btn);
        }

        base.append(container);
        const home = document.createElement('a');
        home.href = "#";
        home.addEventListener('click', () => {
            state.router.requestTransition('home');
        })
        home.innerText = "Back";
        base.appendChild(home);
    }

    init(globalState: GlobalState<unknown>): void {
        globalState.localState = {
            'listeningEvent': ''
        };
        this.state = globalState as GlobalState<KeyState>;
        document.addEventListener('keydown', this.updateKey);
    }

    canTransition(_: string): boolean {
        return true;
    }

    setListeningEvent(state: GlobalState<KeyState>, event: string): void {
        document.querySelectorAll('button').forEach(it => it.classList.remove('waiting'));
        state.localState.listeningEvent = event;
        const btn = document.getElementById(event);
        btn.classList.add('waiting');
        btn.innerText = "Waiting for keypress...";
    }

    cleanup() : void {
        document.removeEventListener('keydown', this.updateKey);
    }

    updateKey(event: KeyboardEvent) : void {
        const persistence = this.state.persistence.get(this.state);
        const { eventMap } = persistence;
        const { keys, commands, localState } = this.state;
        if (event.key == "Escape") {
            event.stopPropagation();
            if (localState.listeningEvent === "") {
                this.state.router.previous(this.state);
                return;
            }
            document.querySelectorAll('button').forEach(btn => {
                btn.innerText = `${btn.id.replace(/([a-z](?=[A-Z]))/g, '$1 ')} (${eventMap[btn.id]})`; // CamelCase -> Camel Case
                btn.classList.remove('waiting');
            })
            localState.listeningEvent = "";
            return;
        }
        if (localState.listeningEvent && localState.listeningEvent !== '') {
            event.preventDefault();
            if (keys.hasKey(event.key) && eventMap[localState.listeningEvent] !== event.key) {
                return;
            }
            const commandKey = localState.listeningEvent;
            const oldKey = eventMap[commandKey];
            this.state.keys.remove(oldKey);
            mapToCommands(keys, commands, localState.listeningEvent, event.key, this.state);
            eventMap[commandKey] = event.key;
            const btn = document.getElementById(commandKey);
            btn.innerText = `${commandKey.replace(/([a-z](?=[A-Z]))/g, '$1 ')} (${eventMap[commandKey]})`; // CamelCase -> Camel Case
            persistence.eventMap = eventMap;
            this.state.persistence.put(persistence);
            localState.listeningEvent = '';
            btn.classList.remove('waiting');
        }
    }

}