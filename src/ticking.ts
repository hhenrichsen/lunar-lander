export interface Ticking<T> {
    update(delta: number, state: T);
}

export default Ticking;