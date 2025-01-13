import Character from "../Character";

export default class Daemon extends Character {
    constructor(level) {
        super(level, 'daemon');
        this.level = level;

    }
}