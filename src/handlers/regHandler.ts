import { WebSocket } from "ws";
import { PlayerData, UserRegResponse } from "../types/types";
//import { playerDB } from '../ws_server/server';
import { usersDB } from "../ws_server/server";
export const handlerReg = (data: PlayerData, id: number, ws: WebSocket) => {
  /*   if (typeof id !== 'number' || isNaN(id)) {
      console.error('Invalid id:', id);
      return; 
    } */
  const playerName = data.name;
  const playerPassword = data.password;
  if (!playerName || !playerPassword) {
    const errorData: UserRegResponse = {
      name: playerName,
      index: id,
      error: true,
      errorText: "Name and password are required"
    };
    return errorData;
  }

  const user = usersDB.find(user => user.userID === id);
  if (user) {
    const errorData: UserRegResponse = {
      name: playerName,
      index: id,
      error: true,
      errorText: "UserID is already using"
    };
    return errorData;
  }


  const regData: UserRegResponse = {
    name: playerName,
    index: id,
    error: false,
    errorText: ""
  }
  const newPlayer = {
    userID: id,
    name: playerName,
    password: playerPassword, 
    ws: ws,
  };
usersDB.push(newPlayer)
  console.log(`Player id ${id} with name ${playerName} added to playerDB`);
  return regData;
};
