export default class GameState {
  static state = {};

  static from(object) {
    this.state = object;
  }
}
