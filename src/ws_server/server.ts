import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { playerDB, roomDB } from './database/DB';
import { handlerReg } from '../handlers/regHandler';
import { handlerCreateRoom } from '../handlers/createRoomHandler';
import { TypesOfMessages } from '../types/types';
//import { sendUserRoomResponse } from '../handlers/sendUserRoomResponse';
dotenv.config();

const PORT = process.env.PORT || 8080;
const wsServer = new WebSocketServer({ port: Number(PORT) })

wsServer.on('listening', () => {
  console.log(`WS Server is starting on the ${PORT} `);
  console.log(`WebSocket server parameters: ${JSON.stringify(wsServer.options.port)}`);
})

wsServer.on('connection', (ws) => {
  const socketId = Math.floor((Math.random() * 1000000)).toString();
  console.log(`New WebSocket connection`);
  ws.on('message', (message) => {
    try {
      const messageString = message.toString('utf-8');
      const parsedMessage = JSON.parse(messageString);
      const parsedData = JSON.parse(parsedMessage.data);
      switch (parsedMessage.type) {
        case 'reg':
          const regResult = handlerReg(parsedData, socketId);
          console.log('registration', regResult);
          const regResponse = {
            type: regResult.type,
            data: JSON.stringify(regResult.data),
            id: regResult.id,
          }
          ws.send(JSON.stringify(regResponse));
          handlerCreateRoom(socketId);
          const roomResponse = {
            type: TypesOfMessages.UpdateRoom,
            data: JSON.stringify(roomDB),
            id: 0
          };
          ws.send(JSON.stringify(roomResponse));
          break;
        case 'create_room':
          const newRoom = handlerCreateRoom(socketId);
          const createRoomResponse = {
            type: TypesOfMessages.CreateRoom,
            data: newRoom,
            id: 0
          };
          ws.send(JSON.stringify(createRoomResponse));
          console.log(roomDB);
          break;
      }
    } catch (err) {
      console.error(`Parsing JSON error: ${err}`)
    }
  });

  ws.on('close', () => {
    console.log('Connection is closed');
    delete playerDB[socketId];
  });
});