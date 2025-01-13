import Character from "../Character";

export default class Bowman extends Character {
    constructor(level) {
        super(level, 'bowman');
        this.level = level;
    }
}