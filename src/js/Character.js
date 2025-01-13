/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    if (new.target === Character) {
      throw new Error("Нельзя создавать персонажа этого класса")
    }
    if(type === 'daemon' || type === 'magician') {
      this.attack = 10; 
      this.defence = 40;
    } else if (type === 'bowman' || type === 'vampire') {
      this.attack = 25; 
      this.defence = 25;
    } else {
      this.attack = 40; 
      this.defence = 10;
    }
    this.level = level;
    this.health = 50;
    this.type = type;
    // TODO: выбросите исключение, если кто-то использует "new Character()"
    if (level > 1) {
      for (let i = 1; i < level; i++){
        this.lvlup();
      }
    }
  }

  lvlup(){
    this.attack = +Math.max(this.attack, this.attack * (80 + this.health) / 100).toFixed(3);
    this.defence = +Math.max(this.defence, this.defence * (80 + this.health) / 100).toFixed(3);
    this.health = +Math.min(this.health + 80, 100).toFixed(3);
    this.level += 1;
  }

  
}
