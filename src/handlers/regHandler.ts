import { PlayerData, RegistrationData, TypesOfMessages } from "../types/types";
import { playerDB } from '../ws_server/database/DB';
export const handlerReg = (data: PlayerData, socketId: string) => {
  const playerName = data.name;
  const playerPassword = data.password;
  const newPlayer = {
    name: playerName,
    password: playerPassword
  };
  playerDB[socketId] = newPlayer;
  console.log(`Player id ${socketId} with name ${playerName} added to playerDB`);
  const regData: RegistrationData = {
    type: TypesOfMessages.Reg,
    data: {
      name: playerName,
      index: Number(socketId),
      error: false,
      errorText: ""
    },
    id: 0
  };
  return regData;
};
