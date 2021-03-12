export class Color {
    private _r: number = 0;
    private _g: number = 0;
    private _b: number = 0;

    public constructor(partial: Partial<Color>) {
        Object.assign(this, partial);
    }
}