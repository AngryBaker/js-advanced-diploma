import Character from "../Character";

export default class Vampire extends Character {
    constructor(level) {
        super(level, 'vampire');
        this.level = level;
    }
}