import themes from './themes';
import {generateTeam} from './generators';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';
import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';
import GameState from './GameState';
import cursors from './cursors';
import GameStateService from './GameStateService';


export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    //Context binding
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.onCellClick = this.onCellClick.bind(this);

  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes.prairie);
    this.generateTeams();
    this.cellEnterListenerAdder();
    this.cellLeaveListenerAdder();
    this.cellClickListenerAdder();
    this.newGameListenerAdder();
    this.saveGameListenerAdder();
    this.loadGameListenerAdder();
    GameState.from({yourstep : true, theme : 'prairie', level : 1, characters : GameController.posCharArr});
    
  }

  posCharArr = [];
  gameStateService = new GameStateService(localStorage);


  

  checkAttackAllowed(index, hero){
    let attackRange = 0;
    if (hero.type === 'swordsman' || hero.type === 'undead') {
      attackRange = 1;
    }
    if (hero.type === 'bowman' || hero.type === 'vampire') {
      attackRange = 2;
    }
    if (hero.type === 'magician' || hero.type === 'daemon') {
      attackRange = 4;
    }

    const xCoordTarget = index % 8;
    const yCoordTarget = Math.floor(index / 8);
    const heroPosition = this.findPositionByCharacter(hero);
    const xCoordHero = heroPosition % 8;
    const yCoordHero = Math.floor(heroPosition / 8);
    if (Math.abs(xCoordTarget - xCoordHero) <= attackRange &&  Math.abs(yCoordTarget - yCoordHero) <= attackRange) {
       return true;
    }

    return false;
  }

  checkMoveAllowed(index, hero){
    let moveRange = 0;
    if (hero.type === 'swordsman' || hero.type === 'undead') {
      moveRange = 4;
    }
    if (hero.type === 'bowman' || hero.type === 'vampire') {
      moveRange = 2;
    }
    if (hero.type === 'magician' || hero.type === 'daemon') {
      moveRange = 1;
    }

    const xCoordTarget = index % 8;
    const yCoordTarget = Math.floor(index / 8);
    const heroPosition = this.findPositionByCharacter(hero);
    const xCoordHero = heroPosition % 8;
    const yCoordHero = Math.floor(heroPosition / 8);
    if ((Math.abs(xCoordTarget - xCoordHero) <= moveRange &&  Math.abs(yCoordTarget - yCoordHero) <= moveRange) && (xCoordHero === xCoordTarget || yCoordHero === yCoordTarget || Math.abs(xCoordTarget - xCoordHero) === Math.abs(yCoordTarget - yCoordHero)) ) {
       return true;
    }

    return false;
  }
  
  generateTeams(){
    const goodTeam = generateTeam([Bowman, Swordsman, Magician], 1, 2);
    const evilTeam = generateTeam([Vampire, Undead, Daemon], 1, 2);
    const goodNumsSet = [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57];
    const evilNumsSet = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
    const charArr = [];
    function positionRandomizer(team, allowCells){
      team.characters.forEach(element => {
        const charCellNum = Math.floor(Math.random() * allowCells.length);
        const position = allowCells[charCellNum];
        const positionedChar = new PositionedCharacter(element, position)
        charArr.push(positionedChar);
        allowCells.splice(charCellNum, 1);
        GameController.posCharArr = charArr;
      });
    }

    positionRandomizer(goodTeam, goodNumsSet);
    positionRandomizer(evilTeam, evilNumsSet);
    this.gamePlay.redrawPositions(charArr);
  }
  // функция для нахождения ближайшей к врагу точки в которую может переместиться герой
  calculClosestPointToMove(target, hero){
    const availableCellsArr = this.gamePlay.cells.filter(cell => (this.checkMoveAllowed(this.gamePlay.cells.indexOf(cell), hero.character) && !cell.firstElementChild));
    const neededCell = availableCellsArr.sort((a, b) => this.calculDistanceBetweenHeroes({position: this.gamePlay.cells.indexOf(a)}, target) - this.calculDistanceBetweenHeroes({position: this.gamePlay.cells.indexOf(b)}, target))[0];
    return this.gamePlay.cells.indexOf(neededCell);
    
  }

  calculDistanceBetweenHeroes(hero1, hero2){
    const hero1Index = hero1.position;
    const hero2Index = hero2.position;
    const xCoordHero2 = hero2Index % 8;
    const yCoordHero2 = Math.floor(hero2Index / 8);
    const xCoordHero1 = hero1Index % 8;
    const yCoordHero1 = Math.floor(hero1Index / 8);
    function distance(x1, y1, x2, y2) {
      return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2));
    }
    const dist = distance(xCoordHero1, yCoordHero1, xCoordHero2, yCoordHero2);
    return dist;
  }

  evilTeamAction(){
    const evilTeamArr = GameController.posCharArr.filter(obj => ['vampire', 'undead', 'daemon'].includes(obj.character.type));
    const goodTeamArr = GameController.posCharArr.filter(obj => ['bowman', 'swordsman', 'magician'].includes(obj.character.type));
    if(evilTeamArr[0]){
      const optimalTargetToAttack = goodTeamArr.sort((a, b) => a.character.defence - b.character.defence)[0];
    const furtherVillain = evilTeamArr.sort((a, b) => this.calculDistanceBetweenHeroes(b, optimalTargetToAttack) - this.calculDistanceBetweenHeroes(a, optimalTargetToAttack))[0];
    if(this.checkAttackAllowed(optimalTargetToAttack.position, furtherVillain.character)){
      if (evilTeamArr[1] && this.checkAttackAllowed(optimalTargetToAttack.position, evilTeamArr[1].character)){
        //атака от сильнейшего если могут атаковать оба
        const dmg = furtherVillain.character.attack > evilTeamArr[1].character.attack ? furtherVillain.character.attack : evilTeamArr[1].character.attack;
        const damage = +Math.max(dmg - optimalTargetToAttack.character.defence, dmg * 0.1).toFixed(3);
        optimalTargetToAttack.character.health = +(optimalTargetToAttack.character.health - damage).toFixed(3);
        const damagePromise = this.gamePlay.showDamage(optimalTargetToAttack.position, damage);
        damagePromise
          .then(() => {
            this.deleteDeadUnit();
            this.gamePlay.redrawPositions(GameController.posCharArr);
          });
      } else if(evilTeamArr[1]) {
       // ближний подходит еще ближе если не может атаковать
       const bestPointIndexForClosest = this.calculClosestPointToMove(optimalTargetToAttack, evilTeamArr[1]);
       this.gamePlay.deselectCell(evilTeamArr[1].position);
       evilTeamArr[1].position = bestPointIndexForClosest;
       this.gamePlay.redrawPositions(GameController.posCharArr);
      } else {
        // атака от единственного
        const damage = +Math.max(furtherVillain.character.attack - optimalTargetToAttack.character.defence, furtherVillain.character.attack * 0.1).toFixed(3);
        optimalTargetToAttack.character.health = +(optimalTargetToAttack.character.health - damage).toFixed(3);
        const damagePromise = this.gamePlay.showDamage(optimalTargetToAttack.position, damage);
        damagePromise
          .then(() => {
            this.deleteDeadUnit();
            this.gamePlay.redrawPositions(GameController.posCharArr);
          });
      }
    } else {
      //реализация хода дальнего
      const bestPointIndex = this.calculClosestPointToMove(optimalTargetToAttack, furtherVillain);
      this.gamePlay.deselectCell(furtherVillain.position);
      furtherVillain.position = bestPointIndex;
      this.gamePlay.redrawPositions(GameController.posCharArr);
    }
    }
    
    
  
  }

  nextLvlCheker(){
    const evilHeroArr = GameController.posCharArr.filter(obj => ['vampire', 'undead', 'daemon'].includes(obj.character.type));
    if (evilHeroArr.length === 0){
      // повышение уровня всем живым героям
      GameController.posCharArr.forEach(obj => {
        obj.character.lvlup()
      }); 
      
      // смена темы
      if (GameState.state.theme === themes.prairie) {
        GameState.state.theme = themes.desert;
      } else if (GameState.state.theme === themes.desert) {
        GameState.state.theme = themes.arctic;
      } else if (GameState.state.theme === themes.arctic) {
        GameState.state.theme = themes.mountain;
      }
      this.gamePlay.drawUi(GameState.state.theme);

      GameState.state.level += 1;
      const curLvl = GameState.state.level;

      // создание новых врагов
      const evilTeam = generateTeam([Vampire, Undead, Daemon], curLvl, 2);
      const goodNumsSet = [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57];
      const evilNumsSet = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
      function positionRandomizer(team, allowCells){
        team.characters.forEach(element => {
          const charCellNum = Math.floor(Math.random() * allowCells.length);
          const position = allowCells[charCellNum];
          const positionedChar = new PositionedCharacter(element, position)
          GameController.posCharArr.push(positionedChar);
          allowCells.splice(charCellNum, 1);
        });
      }

      // перемещение выживших добряков на исходную
      GameController.posCharArr.forEach(obj => {
        const charCellNum = Math.floor(Math.random() * goodNumsSet.length);
        const position = goodNumsSet[charCellNum];
        goodNumsSet.splice(charCellNum, 1);
        obj.position = position;
      })

      positionRandomizer(evilTeam, evilNumsSet);
      this.gamePlay.redrawPositions(GameController.posCharArr);
    }

  }

  deleteDeadUnit(){
    const deadHeroArr = GameController.posCharArr.filter(obj => obj.character.health <= 0);
    if (deadHeroArr[0]){
      this.gamePlay.deselectCell(deadHeroArr[0].position);
    }
    GameController.posCharArr = GameController.posCharArr.filter(obj => obj.character.health > 0);
  }

  cellEnterListenerAdder(){
    this.gamePlay.addCellEnterListener(this.onCellEnter);
  }
  cellLeaveListenerAdder(){
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
  }
  cellClickListenerAdder(){
    this.gamePlay.addCellClickListener(this.onCellClick);
  }

  newGameListenerAdder(){
    this.gamePlay.addNewGameListener(() => {
      location.reload();
    });
  }

  saveGameListenerAdder(){
    this.gamePlay.addSaveGameListener(() => {
      // const gameStateService = new GameStateService(localStorage);
      this.gameStateService.save(GameState.state);
    });
  }

  loadGameListenerAdder(){
    this.gamePlay.addLoadGameListener(() => {
      
      try {
        const data = this.gameStateService.load();
        this.gamePlay.drawUi(data.theme);
        GameController.posCharArr = data.characters;
        this.gamePlay.redrawPositions(GameController.posCharArr);
        
      } catch (e) {
        this.gamePlay.showError("Не удалось загрзить сохранение" , e);
      }
    });
  }

  findCharacterByPosition(position, posCharArr) {
    const foundObject = posCharArr.find(obj => obj.position === position);
    return foundObject ? foundObject.character : null;
  }
  

  findPositionByCharacter(character) {
    const foundObject = GameController.posCharArr.find(obj => obj.character === character);
    return foundObject ? foundObject.position : null;
  }

  tagTemplater(strings, lvl, attack, def, hp){
    const str0 = strings[0];
    const str1 = strings[1];
    const str2 = strings[2];
    const str3 = strings[3];
    return `${str0}${lvl}${str1}${attack}${str2}${def}${str3}${hp}`;
  }




  onCellClick(index) {
    
    //реализация перемещения и атаки
    const selectedCell = document.getElementsByClassName("selected selected-yellow")[0];
    if(selectedCell){
      const selectedCellIndex = this.gamePlay.cells.indexOf(selectedCell);
      const selectedChar = this.findCharacterByPosition(selectedCellIndex, GameController.posCharArr);
      const allowMove = this.checkMoveAllowed(index, selectedChar);
      
      //выделение другого своего героя
      const curentChar = this.findCharacterByPosition(index, GameController.posCharArr);
      if (this.gamePlay.cells[index].firstElementChild && ['bowman', 'swordsman', 'magician'].includes(curentChar.type)){
        this.gamePlay.deselectCell(selectedCellIndex);
        this.gamePlay.selectCell(index);
      }

      // реализация атаки
      const allowAttack = this.checkAttackAllowed(index, selectedChar);
      if (this.gamePlay.cells[index].firstElementChild && allowAttack ) {
        const foundObject = GameController.posCharArr.find(obj => obj.position === index);
        const attackedHero = foundObject.character;
        if(attackedHero.type !== 'bowman' && attackedHero.type !== 'swordsman' && attackedHero.type !== 'magician'){
          const damage = +Math.max(selectedChar.attack - attackedHero.defence, selectedChar.attack * 0.1).toFixed(3);
          attackedHero.health = +(attackedHero.health - damage).toFixed(3);
          const damagePromise = this.gamePlay.showDamage(index, damage);
          this.gamePlay.deselectCell(selectedCellIndex);
          damagePromise
            .then(() => {
              this.deleteDeadUnit();
              this.gamePlay.redrawPositions(GameController.posCharArr);
              this.evilTeamAction();
              this.nextLvlCheker();  
            });  
        }
      }
      // перемещениe
      if (!this.gamePlay.cells[index].firstElementChild && allowMove) {
        const foundObject = GameController.posCharArr.find(obj => obj.position === selectedCellIndex);       
        foundObject.position = index;
        this.gamePlay.deselectCell(selectedCellIndex);
        this.gamePlay.deselectCell(index);
        this.gamePlay.redrawPositions(GameController.posCharArr);
        this.gamePlay.deselectCell(selectedCellIndex);
        this.gamePlay.deselectCell(index);
        this.evilTeamAction();
      }

      

    } else if (this.gamePlay.cells[index].firstElementChild) {
      // выделение героя
      const curentChar = this.findCharacterByPosition(index, GameController.posCharArr);
      if (['bowman', 'swordsman', 'magician'].includes(curentChar.type)) {
        this.gamePlay.selectCell(index);
      } else if (!selectedCell){
          GamePlay.showError("Это не ваш персонаж");
        
      }
    }

  }

  onCellEnter(index) {
    const selectedCell = document.getElementsByClassName("selected selected-yellow")[0];
    if(selectedCell){
      const selectedCellIndex = this.gamePlay.cells.indexOf(selectedCell);
      const selectedChar = this.findCharacterByPosition(selectedCellIndex, GameController.posCharArr);
      const curentChar = this.findCharacterByPosition(index, GameController.posCharArr);
      
      //подсветка клетки для хода
      const allowMove = this.checkMoveAllowed(index, selectedChar);
      if(allowMove && (!this.gamePlay.cells[index].firstElementChild)){
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, "green");
      } else if (index !== selectedCellIndex){
        this.gamePlay.setCursor(cursors.notallowed);
      }
      // смена курсора для союзного юнита
      if(curentChar) {
        if(['bowman', 'swordsman', 'magician'].includes(curentChar.type) && curentChar !== selectedChar){
          this.gamePlay.setCursor(cursors.pointer);
        }
      }
      // смена курсора для вражеского юнита
      if(curentChar) {
        const allowAttack = this.checkAttackAllowed(index, selectedChar);
        if((curentChar.type !== 'bowman' && curentChar.type !== 'swordsman' && curentChar.type !== 'magician') && curentChar !== selectedChar ){
          if(allowAttack){
            this.gamePlay.setCursor(cursors.crosshair);
            this.gamePlay.selectCell(index, "red");
          } else {
            this.gamePlay.setCursor(cursors.notallowed);
          }
        }
      }

    }
    // Добавление информации о герое
    if (this.gamePlay.cells[index].firstElementChild) {
      const curentChar = this.findCharacterByPosition(index, GameController.posCharArr);
      const info = this.tagTemplater`🎖${curentChar.level} ⚔${curentChar.attack} 🛡${curentChar.defence} ❤${curentChar.health}`;
      this.gamePlay.showCellTooltip(info, index);
      
    }
  }

  onCellLeave(index) {
    if (!this.gamePlay.cells[index].firstElementChild) {
      this.gamePlay.deselectCell(index);
    }
    if (this.gamePlay.cells[index].firstElementChild) {
      this.gamePlay.hideCellTooltip(index);
      const curentChar = this.findCharacterByPosition(index, GameController.posCharArr);
      if (!['bowman', 'swordsman', 'magician'].includes(curentChar.type)){
        this.gamePlay.deselectCell(index);
      }
    }
    this.gamePlay.setCursor(cursors.auto);
  }
}
