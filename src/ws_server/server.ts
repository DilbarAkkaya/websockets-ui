import { WebSocket, WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { handlerReg } from '../handlers/regHandler';
import { TypesOfMessages } from '../types/types';
dotenv.config();
import { PlayerData, RoomData } from "../types/types";

export const usersDB: PlayerData[] = [];
export const roomDB: RoomData[] = [];
const PORT = process.env.PORT || 8080;
const wsServer = new WebSocketServer({ port: Number(PORT) })

wsServer.on('listening', () => {
  console.log(`WS Server is starting on the ${PORT} `);
  console.log(`WebSocket server parameters: ${JSON.stringify(wsServer.options.port)}`);
})
const wsUserMap: Map<WebSocket, number> = new Map();
wsServer.on('connection', (ws) => {
  const userID = generateUniq();
  wsUserMap.set(ws, userID);
 
  //const userID = generateUniq();

  ws.on('message', (message) => {
    const messageString = message.toString('utf-8');
    const parsedMessage = JSON.parse(messageString);
    const userID: number | undefined = wsUserMap.get(ws);
    if (!userID) {
      console.error('UserID not found for ws');
      return;
    }
    console.log('parsedMessage', parsedMessage)
    try {
      switch (parsedMessage.type) {
        case TypesOfMessages.Reg:
          const parsedData = JSON.parse(parsedMessage.data);
          console.log('parsedData', parsedData)
          const regResult = handlerReg(parsedData, userID, ws);
          const regResponse = {
            type: TypesOfMessages.Reg,
            data: JSON.stringify(regResult),
            id: 0,
          }
          ws.send(JSON.stringify(regResponse));
          updateRoomState(ws);
          break;
        case TypesOfMessages.CreateRoom:
          if (roomDB.some(room => room.roomUsers.some(user => user.index === userID))) {
            console.log(`Player with ID ${userID} is already in a room.`);
            return;
          }
          const roomID = generateUniq();
          try {
            if (!roomDB.find(room => room.roomID === roomID)) {
              const currentPlayer = usersDB.find(user => user.userID === userID);
              if (currentPlayer) {
                const newRoom: RoomData = {
                  roomID: roomID,
                  roomUsers: [{ name: currentPlayer.name, index: userID }],
                };
                roomDB.push(newRoom);
                const createRoomResponse = {
                  type: TypesOfMessages.CreateRoom,
                  data: JSON.stringify(newRoom),
                  id: 0
                };
                ws.send(JSON.stringify(createRoomResponse))
              }


            } else {
              console.log(`Room with ID ${roomID} already exists.`);
            }
            updateRoomState(ws)
          } catch (err) {
            console.error(err)
          }

          break;
          case TypesOfMessages.AddUserToRoom:
            const parsedDataFromAdd = JSON.parse(parsedMessage.data);
            console.log('parseddata', parsedDataFromAdd)
            const indexRoom = parsedDataFromAdd.indexRoom;
            console.log('indexroom', indexRoom)
            const roomChooseToAdd = roomDB.find(room => room.roomID === indexRoom);
            if (roomChooseToAdd) {
              const currentPlayer = usersDB.find(user => user.ws === ws);
              const firstPlayer = usersDB.find(user => user.userID === roomChooseToAdd.roomUsers[0]?.index);
              console.log(roomChooseToAdd.roomUsers)
              if (currentPlayer && firstPlayer) {
                const playerAlreadyInRoom = roomChooseToAdd.roomUsers.some(user => user.index === currentPlayer.userID);
                if (playerAlreadyInRoom) {
                  console.error(`Player with ID ${currentPlayer.userID} is already in the room.`);
                  return;
                }
                roomChooseToAdd.roomUsers.push({ name: currentPlayer.name, index: currentPlayer.userID });
                console.log(roomChooseToAdd.roomUsers)
                const idGame = generateUniq();

                const createGameResponse = {
                  type: "create_game",
                  data: {
                    idGame: idGame,
                    idPlayer: currentPlayer.userID
                  },
                  id: 0
                };
                currentPlayer.ws.send(JSON.stringify(createGameResponse));
                firstPlayer.ws.send(JSON.stringify(createGameResponse));
          
                roomDB.splice(roomDB.indexOf(roomChooseToAdd), 1);
                console.log(`Player ${currentPlayer.name} added to room ${indexRoom}`);
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
    wsUserMap.delete(ws);
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


  console.log(updatedRoomsData)
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
