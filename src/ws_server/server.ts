import { WebSocket, WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { handlerReg } from '../handlers/regHandler';
//import { handlerCreateRoom } from '../handlers/createRoomHandler';
import { TypesOfMessages } from '../types/types';
dotenv.config();
import { PlayerData, RoomData } from "../types/types";

/* export const playerDB: { [userID: string]: PlayerData } = {};
export const roomDB: { [roomID: string]: RoomData } = {}; */

export const usersDB: PlayerData[] = [];
export const roomDB: RoomData[] = [];
const PORT = process.env.PORT || 8080;
const wsServer = new WebSocketServer({ port: Number(PORT) })

wsServer.on('listening', () => {
  console.log(`WS Server is starting on the ${PORT} `);
  console.log(`WebSocket server parameters: ${JSON.stringify(wsServer.options.port)}`);
})

wsServer.on('connection', (ws) => {
  const userID = generateUniq();
  const roomID = generateUniq();
  ws.on('message', (message) => {
    const messageString = message.toString('utf-8');
    const parsedMessage = JSON.parse(messageString);
    console.log('parsedMessage', parsedMessage)
    try {
      switch (parsedMessage.type) {
        case TypesOfMessages.Reg:
          const parsedData = JSON.parse(parsedMessage.data);
          console.log('parsedData', parsedData)
          const regResult = handlerReg(parsedData, userID);
          const regResponse = {
            type: TypesOfMessages.Reg,
            data: JSON.stringify(regResult),
            id: 0,
          }
          ws.send(JSON.stringify(regResponse));
          updateRoomState(ws)
          /*           const updateResponse = {
                      type: TypesOfMessages.UpdateRoom,
                      data: JSON.stringify(roomDB),
                      id: 0
                    };
                    console.log('updateResponse:', updateResponse);
                    wsServer.clients.forEach(client => {
                      if (client.readyState === ws.OPEN) {
                        client.send(JSON.stringify(updateResponse));
                      }
          
                    });
                    console.log('roomDB updated:', roomDB); */
          break;
        case TypesOfMessages.CreateRoom:
          try {
            if (!roomDB.find(room => room.roomID === roomID)) {
              const currentPlayer = usersDB.find(user => user.userID === userID);
              const newRoom: RoomData = {
                roomID: roomID,
                roomUsers: [{ name: currentPlayer?.name, index: userID }],
              };
              roomDB.push(newRoom);
              const createRoomResponse = {
                type: TypesOfMessages.CreateRoom,
                data: JSON.stringify(newRoom),
                id: 0
              };
              ws.send(JSON.stringify(createRoomResponse))
            } else {
              console.log(`Room with ID ${roomID} already exists.`);
            }
            updateRoomState(ws)
          } catch (err) {
            console.error('etooooooooooooooooooooo', err)
          }

          break;

        case TypesOfMessages.AddUserToRoom:
          console.log('parsedMessage', parsedMessage)
          const parsedDataFromAdd = JSON.parse(parsedMessage.data);
          console.log('parseddata', parsedDataFromAdd)
          const indexRoom = parsedDataFromAdd.indexRoom;

          console.log('indexroom', indexRoom)
          const room = roomDB[indexRoom];
          if (room) {
            const player = usersDB.find(user => user.userID === userID);
            if (player) {
              room.roomUsers.push({
                name: player.name,
                index: userID,
              });
              delete roomDB[indexRoom];
              const addUserResponse = {
                type: TypesOfMessages.CreateGame,
                data: JSON.stringify({
                  idGame: generateUniq(),
                  idPlayer: userID
                }),
                id: 0
              };
              ws.send(JSON.stringify(addUserResponse))
              /* wsServer.clients.forEach(client => {
                if (client.readyState === ws.OPEN) {
                  client.send(JSON.stringify(addUserResponse));
                }
              }); */
              console.log(`Player ${player.name} added to room ${indexRoom}`);
            } else {
              console.error(`Player with ID ${userID} does not exist.`);
            }
          } else {
            console.error(`Room with ID ${indexRoom} does not available.`);
          }
          updateRoomState(ws)
          break;
      }
    } catch (err) {
      console.error(`Parsing JSON error: ${err}`);
    }
  });

  ws.on('close', () => {
    console.log('Connection is closed');
  });
});

function generateUniq() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);
  const id = timestamp * 1000000 + randomNum;
  return id;
}

function updateRoomState(socket: WebSocket) {

  const onlyOnePlayerRooms = roomDB.filter(room => room.roomUsers.length === 1);

  const updatedRoomsData = onlyOnePlayerRooms.map(room => ({
    roomId: room.roomID,
    roomUsers: room.roomUsers.map(user => ({
      name: user.name,
      index: user.index
    }))
  }));


  console.log(onlyOnePlayerRooms)
  const updateRoomResponse = {
    type: TypesOfMessages.UpdateRoom,
    data: JSON.stringify(updatedRoomsData),
    id: 0
  };

  wsServer.clients.forEach(client => {
    if (client.readyState === socket.OPEN) {
      client.send(JSON.stringify(updateRoomResponse));
    }
  });
}
