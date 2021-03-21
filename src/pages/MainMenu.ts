import { Page } from "../core/menus/Page";
import { GlobalState } from "../content/State";

export class MainMenu implements Page<GlobalState<unknown>> {
    load(base: HTMLElement, state: GlobalState<unknown>): void {
        const img = document.createElement('img');
        img.src = 'assets/Lander.png';
        img.width = 250;
        base.appendChild(img);

        const header = document.createElement('h1');
        header.innerText = 'Lunar Lander';
        base.appendChild(header);

        const play = document.createElement('a');
        play.href = "#";
        play.addEventListener('click', () => {
            state.router.requestTransition('play', { level: 1 });
        })
        play.innerText = "Play";
        base.appendChild(play);

        const controls = document.createElement('a');
        controls.href = "#";
        controls.addEventListener('click', () => {
            state.router.requestTransition('controls');
        })
        controls.innerText = "Controls";
        base.appendChild(controls);

        const scores = document.createElement('a');
        scores.href = "#";
        scores.addEventListener('click', () => {
            state.router.requestTransition('scores');
        })
        scores.innerText = "High Scores";
        base.appendChild(scores);

        const credits = document.createElement('a');
        credits.href = "#";
        credits.addEventListener('click', () => {
            state.router.requestTransition('credits');
        })
        credits.innerText = "Credits";
        base.appendChild(credits);
    }

    init(globalState: GlobalState<unknown>): void {
        globalState.localState = null;
    }

    canTransition(_: string): boolean {
        return true;
    }

}