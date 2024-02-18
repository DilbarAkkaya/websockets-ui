/* import { RoomData } from 'types/types';
import { roomDB, playerDB } from '../ws_server/server';

export const handlerCreateRoom = (id: number, userID: number) => {
  if (roomDB[id.toString()]) {
    console.log(`Room with ID ${id} already exists.`);
    return;
  }
  console.log('dkhksfjhgkjfhgkhfh')
  const player = playerDB[userID];
  const newRoom: RoomData = {
      roomID: id,
      roomUsers:
                    [
                        {
                            name: player?.name,
                            index: userID,
                        }
                    ],
  };
  console.log(newRoom, '1111111')
  roomDB[id.toString()] = newRoom;
  console.log(`Room created with index ${id}`);
return newRoom

}; */