import { Page } from "../core/menus/Page";
import { GlobalState } from "../content/State";
import { Score } from "../content/Score";

export class ScoresPage implements Page<GlobalState<unknown>> {
    load(base: HTMLElement, state: GlobalState<unknown>): void {
        const persistence = state.persistence.get(state);
        const { scores } = persistence;
        const header = document.createElement("h1");
        header.innerText = "High Scores";
        base.appendChild(header);

        if (state.router.transitionData !== undefined) {
            const { score } = state.router.transitionData;

            if (typeof score === "number") {
                const highScore =
                    scores.some((it) => Math.round(score) > it.score) || scores.length < 5;
                if (highScore) {
                    const hsContainer = document.createElement("div");
                    hsContainer.classList.add("container");
                    const text = document.createElement("p");
                    text.innerText = `You got a high score of ${score.toFixed(0)}! Enter a name.`;
                    hsContainer.appendChild(text);
                    const form = document.createElement("form");
                    const input = document.createElement("input");
                    input.type = "text";
                    form.appendChild(input);
                    const button = document.createElement("input");
                    button.type = "submit";
                    button.innerText = "Submit";
                    form.append(button);
                    form.onsubmit = (evt) => {
                        scores.push(
                            new Score({
                                name: input.value,
                                score: parseInt(score.toFixed(0)),
                            })
                        );
                        scores.sort((it) => it.score);
                        const newPersist = {
                            ...persistence,
                            scores: scores.slice(0, 4),
                        };
                        state.persistence.put(newPersist);
                        state.router.requestTransition("scores");
                    };
                    hsContainer.append(form);
                    base.append(hsContainer);
                }
            }
        }

        const scoreList = scores.sort();
        for (const score of scoreList) {
            const scoreElement = document.createElement("p");
            scoreElement.innerText = `${score.score} - ${score.name}`;
            base.appendChild(scoreElement);
        }

        const home = document.createElement("a");
        home.href = "#";
        home.addEventListener("click", () => {
            state.router.requestTransition("home");
        });
        home.innerText = "Back";
        base.appendChild(home);
    }

    init(globalState: GlobalState<unknown>): void {
        globalState.localState = undefined;
    }

    canTransition(_: string): boolean {
        return true;
    }

    cleanup(state: GlobalState<unknown>): void {
        return;
    }
}
