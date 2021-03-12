import Ticking from './ticking';
import Position from './position';
import Drawable from './drawable';

export class ParticleContainer {

}

export class ParticleEmitter<T> implements Ticking<T> {
    private _rate: number;
    private _count: number;
    private _position: Position;
    p
    update(delta: number, state: T) {
    }
}

export class ParticleEffect<T> {
    private _center: Position;
    private _direction: Position;
    private _lifetime: number;
    private _elapsedLifetime: number;
    private _rotation: number;
    draw(position: Position, state: T) {}
}