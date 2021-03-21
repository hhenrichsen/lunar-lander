import { Page } from "../core/menus/Page";
import { GlobalState } from "../content/State";

export class CreditsPage implements Page<GlobalState<unknown>> {
    load(base: HTMLElement, state: GlobalState<unknown>): void {
        const img = document.createElement('img');
        img.src = 'assets/Lander.png';
        img.width = 250;
        base.appendChild(img);
        const author = document.createElement('p');
        author.innerText = "Lunar Lander Clone by Hunter Henrichsen"
        const font = document.createElement('p');
        font.innerText = "Montserrat Font from Google Fonts"
        base.appendChild(author);
        base.appendChild(font);
        const home = document.createElement('a');
        home.href = "#";
        home.addEventListener('click', () => {
            state.router.requestTransition('home');
        })
        home.innerText = "Back";
        base.appendChild(home);
    }

    init(globalState: GlobalState<unknown>): void {
        globalState.localState = null;
    }

    canTransition(_: string): boolean {
        return true;
    }

}