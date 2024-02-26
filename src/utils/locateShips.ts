import { IShip, TWODArray, Status } from "../types/types";
 export function locateShips(ships: IShip[]): TWODArray {
  const size = 10;
  const twoDArray: TWODArray = Array.from({ length: size }, () =>
    Array<Status>(size).fill(Status.Empty)
  );
  for (const ship of ships) {
    const { direction, type, position } = ship;
    const x: number = position.x;
    const y: number = position.y;
    if (x < 0 || x >= size || y < 0 || y >= size) {
      console.error(`Ship ${type} is out of field`);
      continue;
    }
    for (let i = 0; i < ship.length; i++) {
      let cellX: number = x;
      let cellY: number = y;
      if (direction) {
        cellY += i;
      } else {
        cellX += i;
      };
      if (cellX < 0 || cellX >= size || cellY < 0 || cellY >= size) {
        console.error(`Ship  ${type} is out of field`);
        continue;
      };
      if ((twoDArray[cellY] as any[])[cellX] !== Status.Empty) {
        console.error(`Ship ${type} is mixed wit other ship`);
        break;
      };
      (twoDArray[cellY] as any[])[cellX] = type;
    };
  };
  return twoDArray;
};