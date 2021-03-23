export class Score {
    name: string;
    score: number;
    constructor(partial: Partial<Score>) {
        Object.assign(this, partial);
    }
}
