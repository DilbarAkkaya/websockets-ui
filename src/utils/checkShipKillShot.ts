import { Status, TWODArray } from "../types/types";
export function checkShipKillShot(twoDArrayShips: TWODArray, x: number, y: number): boolean {
  const cellValue = (twoDArrayShips[y] as any[])[x];
  if (cellValue !== Status.Large && cellValue !== Status.Medium && cellValue !== Status.Small) {
    return false;
  };
  for (let i = 0; i < twoDArrayShips.length; i++) {
    for (let j = 0; j < (twoDArrayShips[i] as any[]).length; j++) {
      if ((twoDArrayShips[i] as any[])[j] === cellValue) {
        return false;
      };
    };
  };
  return true;
};