import {calcTileType} from '../utils';

test.each([
  [ 5, 8, "top"],
  [ 7, 8, "top-right"],
  [ 16, 8, "left"],
  [ 63, 8, "bottom-right"],
  [ 56, 8, "bottom-left"],
  [ 15, 8, "right"],
])("testing calcTileType func", (index, boardSize, expected) => {
  const result = calcTileType(index, boardSize);
  expect(result).toEqual(expected);
});