import { Page } from "./Page";

export interface Router<T> {
    pages: Record<string, Page<T>>;
    currentPage: Page<T>;
    transitionData: Record<string, unknown>;
    requestTransition(id: string, purge?: boolean, data?: Record<string, unknown>): void;
    previous(state: T): void;
}

export class SimpleRouter<T> implements Router<T> {
    private _currentPage = undefined as Page<T>;
    private _transitionData: Record<string, unknown> = {};
    private _pages: Record<string, Page<T>> = {};
    private _history: Array<string> = [];
    requestTransition: (id: string, purge: boolean, data?: Record<string, unknown>) => void;

    constructor(state: T) {
        this.requestTransition = this._requestTransition(state);
    }

    public addPage(id: string, page: Page<T>): void {
        if (!(id in this._pages)) {
            this._pages[id] = page;
        } else {
            console.warn(`Trying to register duplicate page ${id}!`);
        }
    }

    public get transitionData(): Record<string, unknown> {
        return this._transitionData;
    }

    public get pages(): Record<string, Page<T>> {
        return this._pages;
    }

    public get currentPage(): Page<T> {
        return this._currentPage;
    }

    private _requestTransition(state: T) {
        return function (id: string, purge = false, data?: Record<string, unknown>) {
            if (this._pages[id] === undefined) {
                return;
            }
            if (this._currentPage === undefined || this._currentPage.canTransition(id)) {
                if (purge) {
                    this._history = [];
                }
                this._history.push(id);
                this._currentPage = this.pages[id];
                this._transitionData = data;
                const el = document.getElementById("main");
                el.innerHTML = "";
                el.classList.forEach((it) => el.classList.remove(it));
                el.classList.add(id);
                this._currentPage.load(el, state);
                this._currentPage.init(state);
            }
        };
    }

    previous(state: T): void {
        const prev = this._history.slice(-2)[0];
        if (prev !== undefined) {
            this._currentPage.cleanup(state);
            this._history.splice(-2, 2);
            this.requestTransition(prev, false);
        }
    }
}
