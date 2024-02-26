import { gameDB } from "ws_server/server";
import { Status } from "types/types";
export function updateField(attackData: string) {
  try {
    const { position, currentPlayer, status } = JSON.parse(attackData);
    console.log('data from attack', status)
    const { x, y } = JSON.parse(position);
    const enemyField = gameDB.find(game => game.isCurrentPlayer !== currentPlayer);
    if (enemyField) {
      const twoDArrayEnemy = enemyField.ships;
      if (status === Status.Shot || status === Status.Killed) {
        (twoDArrayEnemy[y] as any[])[x] = Status.Shot;
      } else if (status === Status.Miss) {
        (twoDArrayEnemy[y] as any[])[x] = Status.Miss;
      }
    } else {
      console.error('Enemy field not found.');
    }
  } catch (err) {
    console.error('Error updating', err);
  }
};