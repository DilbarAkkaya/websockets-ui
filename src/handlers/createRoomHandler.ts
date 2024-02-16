import { roomDB } from "../ws_server/database/DB";
export const handlerCreateRoom = (socketId: number) => {
  if (roomDB[socketId]) {
    console.log(`Room with ID ${socketId} already exists.`);
    return;
  }
  const newRoom = {
      indexRoom: socketId,
      players: [socketId]
  };
  roomDB[socketId] = newRoom;
  console.log(`Room created with index ${socketId}`);
return newRoom

};