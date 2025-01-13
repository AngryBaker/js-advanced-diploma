/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  const bigIndex = boardSize - 1;
  const y = Math.floor(index / boardSize);
  const x = index % boardSize;

  if (0 < x && x < bigIndex && 0 < y && y < bigIndex) {
    return 'center';
  } else if ((x !== 0 && x !== bigIndex) || (y !== 0 && y !== bigIndex)){
    if (y === 0) {
      return "top";
    }
    if (y === bigIndex) {
      return "bottom";
    }
    if (x === 0) {
      return "left";
    }
    if (x === bigIndex) {
      return "right";
    }
  } else {
    if (x === 0 && y === 0) {
      return "top-left";
    }
    if (x === 0 && y !== 0) {
      return "bottom-left";
    }
    if (x !== 0 && y === 0) {
      return "top-right";
    }
    if (x !== 0 && y !== 0) {
      return "bottom-right";
    }
  }
  
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
