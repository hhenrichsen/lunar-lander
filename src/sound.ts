export class SoundEffect {
    private el: HTMLAudioElement;
    private ready = false;
    private continue = false;
    private loop = false;
    private _playing = false;
    private cutoff = 0;
    constructor(source: string, cutoff?: number) {
        this.el = new Audio(source);
        this.el.addEventListener('load', () => {
            this.ready = true;
        });
        if (cutoff) {
            this.loop = true;
            this.cutoff = cutoff;
        }
    }

    play(): void {
        this.el.play();
        this.continue = true;
        this._playing = true;
        if (this.loop) {
            setTimeout(() => {if(!this.continue) return; this.el.currentTime = 0; this.playRec()}, this.cutoff * 1000);
        }
        else {
            setTimeout(() => this._playing = false, this.el.duration * 1000)
        }
    }

    playRec(): void {
        setTimeout(() => {if(!this.continue) return; this.el.currentTime = 0; this.playRec()}, this.cutoff * 1000);
    }

    stop(): void {
        this.el.pause();
        this.continue = false;
        this._playing = false;
        this.el.currentTime = 0;
    }

    public get playing(): boolean {
        return this._playing;
    }
}