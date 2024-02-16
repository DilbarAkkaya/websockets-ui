import { roomDB } from "../ws_server/database/DB";
export const handlerCreateRoom = (socketId: string) => {
  const newRoom = {
      indexRoom: Number(socketId),
      players: [socketId]
  };
  roomDB[Number(socketId)] = newRoom;
  console.log(`Room created with index ${socketId}`);
return newRoom

};