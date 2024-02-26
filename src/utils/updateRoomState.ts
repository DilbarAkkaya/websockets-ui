import { Status, IGame } from "../types/types";
import { checkShipKillShot } from "../utils/checkShipKillShot";
export function getAttackStatus(game: IGame, x: number, y: number): Status.Miss | Status.Killed | Status.Shot {
  const isAttack = game.previousAttacks.some(attack =>
    attack.x === x && attack.y === y
  );
  if (isAttack) {
    return Status.Miss;
  }
  const cellValue = (game.ships[y] as any[])[x];
  if (cellValue && (cellValue === Status.Medium || cellValue === Status.Large || cellValue === Status.Small)) {
    (game.ships[y] as any[])[x] = Status.Shot;
    const shipKillShot = checkShipKillShot(game.ships, x, y);
    return shipKillShot ? Status.Killed : Status.Shot;
  } else {
    return Status.Miss;
  }
}