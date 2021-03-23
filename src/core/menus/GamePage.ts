import { GlobalState } from "../../content/State";
import Vector2 from "../geometry/Vector2";
import Drawable from "../rendering/Drawable";
import { VirtualCoordinateSystem } from "../rendering/VirtualCoordinate";
import Ticking from "../Ticking";
import { Page } from "./Page";

export abstract class GamePage<T> implements Page<T> {
    protected canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D;

    protected vcs = new VirtualCoordinateSystem(0, 0);
    protected drawables = [] as Array<Drawable<T>>;
    protected ticking = [] as Array<Ticking<T>>;

    protected lastTime = 0;

    private screenRatio: Vector2;
    private worldSize: Vector2;

    protected setBounds(screenRatio: Vector2, worldSize: Vector2) {
        this.screenRatio = screenRatio;
        this.worldSize = worldSize;
    }

    load(element: HTMLElement, state: T): void {
        this.preLoad(element, state);
        const canvas = document.createElement("canvas");
        this.canvas = canvas;
        canvas.width = this.worldSize.x;
        canvas.height = this.worldSize.y;
        canvas.id = "canvas";

        element.appendChild(canvas);
        this.context = canvas.getContext("2d");
        this.postLoad(element, state);
    }

    protected preLoad(element: HTMLElement, state: T): void {
        return;
    }
    protected postLoad(element: HTMLElement, state: T): void {
        return;
    }

    init(state: T): void {
        this.preInit(state);
        this.drawables = [];
        this.ticking = [];
        this.postInit(state);

        this.lastTime = performance.now();
        requestAnimationFrame(this.loop(state as T));
        window.addEventListener("resize", () => this.resize());
        this.resize();
    }

    protected preInit(state: T): void {
        return;
    }
    protected postInit(state: T): void {
        return;
    }

    // Resize
    resize() {
        if (window.innerWidth / this.screenRatio.x < window.innerHeight / this.screenRatio.y) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = (window.innerWidth * this.screenRatio.y) / this.screenRatio.x;
        } else {
            this.canvas.width = (window.innerHeight * this.screenRatio.x) / this.screenRatio.y;
            this.canvas.height = window.innerHeight;
        }

        this.vcs = new VirtualCoordinateSystem(
            this.canvas.width / this.worldSize.x,
            this.canvas.height / this.worldSize.y
        );
    }

    abstract canTransition(nextPage: string): boolean;

    abstract loop(state: T): FrameRequestCallback;
}
