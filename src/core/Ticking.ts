export interface Ticking<T> {
    update(delta: number, state: T): void;
}

export default Ticking;
