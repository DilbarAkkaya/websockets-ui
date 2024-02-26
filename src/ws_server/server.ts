import { WebSocket, WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { IAttack, IGame, Status, TypesOfMessages } from '../types/types';
import { locateShips } from '../utils/locateShips';
dotenv.config();
import { PlayerData, RoomData } from "../types/types";
import { generateUniq } from '../utils/generateUniq';
import { getAttackStatus } from '../utils/updateRoomState';

export const roomDB: RoomData[] = [];
export const gameDB: IGame[] = [];
const PORT = process.env.PORT || 8080;
const wsServer = new WebSocketServer({ port: Number(PORT) });
export const wsUserMap: Map<WebSocket, PlayerData> = new Map();
wsServer.on('connection', (ws) => {
  console.log(`WebSocket server parameters: PORT: ${JSON.stringify(wsServer.options.port)}`);
  ws.on('message', (message) => {
    const messageString = message.toString('utf-8');
    const parsedMessage = JSON.parse(messageString);
    try {
      switch (parsedMessage.type) {
        case TypesOfMessages.Reg:
          const parsedData = JSON.parse(parsedMessage.data);
          const isValid = [...wsUserMap.values()].some(item => item.name === parsedData.name);
          console.log([...wsUserMap.values()])
          console.log('parsedData', parsedData);
          const user = {
            name: parsedData.name,
            password: parsedData.password,
            userID: generateUniq(),
            ws: ws,
          }
          wsUserMap.set(ws, user);
          let obj = {}
          if (isValid) {
            obj = {
              name: user.name,
              index: user.userID,
              error: isValid,
              errorText: 'User already exists',
            }
          } else {
            obj = {
              name: user.name,
              index: user.userID,
              error: isValid,
              errorText: '',
            }
          }
          const regResponse = {
            type: TypesOfMessages.Reg,
            data: JSON.stringify(obj),
            id: 0,
          }
          ws.send(JSON.stringify(regResponse));
          updateRoomState(ws);
          break;
        case TypesOfMessages.CreateRoom:
          if (roomDB.some(room => room.roomUsers.some(user => user.index === wsUserMap.get(ws)?.userID))) {
            console.log(`Player with ID ${wsUserMap.get(ws)?.userID} is already in the room.`);
            return;
          }
          if (roomDB.some(room => room.roomUsers.length > 0)) {
            console.log(`Other player already open room, user with ID ${wsUserMap.get(ws)?.userID} cannot create a new one. Please, add yourself to room`);
            return;
          }
          const roomID = generateUniq();
          try {
            if (!roomDB.find(room => room.roomID === roomID)) {
              const currentPlayer = [...wsUserMap.values()].find(user => user.userID === wsUserMap.get(ws)?.userID);
              if (currentPlayer) {
                const newRoom: RoomData = {
                  roomID: roomID,
                  roomUsers: [{ name: currentPlayer.name, index: currentPlayer.userID }],
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
            updateRoomState(ws);
          } catch (err) {
            console.error(err);
          }
          break;
        case TypesOfMessages.AddUserToRoom:
          const parsedDataFromAdd = JSON.parse(parsedMessage.data);
          const indexRoom = parsedDataFromAdd.indexRoom;
          const roomChooseToAdd = roomDB.find(room => room.roomID === indexRoom);
          if (roomChooseToAdd) {
            const currentPlayer = [...wsUserMap.values()].find(user => user.ws === ws);
            const firstPlayer = [...wsUserMap.values()].find(user => user.userID === roomChooseToAdd.roomUsers[0]?.index);
            if (currentPlayer && firstPlayer) {
              const playerAlreadyInRoom = roomChooseToAdd.roomUsers.some(user => user.index === currentPlayer.userID);
              if (playerAlreadyInRoom) {
                console.error(`Player with ID ${currentPlayer.userID} is already in the room.`);
                return;
              }
              roomChooseToAdd.roomUsers.push({ name: currentPlayer.name, index: currentPlayer.userID });
              const idGame = generateUniq();
              const createGameResponse1 = {
                type: TypesOfMessages.CreateGame,
                data: JSON.stringify({
                  idGame: idGame,
                  idPlayer: currentPlayer.userID
                }),
                id: 0
              };
              const createGameResponse2 = {
                type: TypesOfMessages.CreateGame,
                data: JSON.stringify({
                  idGame: idGame,
                  idPlayer: firstPlayer.userID
                }),
                id: 0
              };
              currentPlayer.ws.send(JSON.stringify(createGameResponse1));
              firstPlayer.ws.send(JSON.stringify(createGameResponse2));
              roomDB.splice(roomDB.indexOf(roomChooseToAdd), 1);
              console.log(`Player ${currentPlayer.name} added to room ${indexRoom}`);
            } else {
              console.error(`Player with ID ${currentPlayer?.userID} does not exist.`);
            }
          } else {
            console.error(`Room with ID ${indexRoom} does not available.`);
          }
          updateRoomState(ws)
          break;
        case TypesOfMessages.AddShips:
          try {
            const parsedDataFromCreateGame = JSON.parse(parsedMessage.data);
            const shipsData = parsedDataFromCreateGame.ships;
            const gameID = parsedDataFromCreateGame.gameId;
            const playerIndex = parsedDataFromCreateGame.indexPlayer;
            const twoDArrayShips = locateShips(shipsData);
            const player = {
              gameId: gameID,
              ships: twoDArrayShips,
              indexPlayer: playerIndex,
              isCurrentPlayer: playerIndex,
              addTurn: playerIndex,
              previousAttacks: []
            };
            gameDB.push(player);
            if (gameDB.length === 2) {
              const turnData = {
                type: TypesOfMessages.Turn,
                data: JSON.stringify({
                  currentPlayer: playerIndex
                }),
                id: 0,
              };
              gameDB.forEach(item => {
                const startGameResponceFirst = {
                  type: TypesOfMessages.StartGame,
                  data: JSON.stringify({
                    currentPlayerIndex: item.indexPlayer,
                    ships: item.ships,
                  }),
                  id: 0,
                };
                let playerSocket: WebSocket | undefined;
                wsUserMap.forEach((playerData, socket) => {
                  if (playerData.userID === item.indexPlayer) {
                    playerSocket = socket;
                  };
                });
                playerSocket?.send(JSON.stringify(startGameResponceFirst));
                playerSocket?.send(JSON.stringify(turnData));
                playerSocket?.on('close', () => {
                  console.log(`Player ${item.indexPlayer} disconnected`);
                });
              });
            };
          } catch (err) {
            console.error('Error AddShips message:', err);
          };
          break;
        case TypesOfMessages.Attack:
          try {
            const parsedDataFromAttack: IAttack = JSON.parse(parsedMessage.data);
            let x = parsedDataFromAttack.x;
            let y = parsedDataFromAttack.y;
            const gameID = parsedDataFromAttack.gameId;
            const playerIndex = parsedDataFromAttack.indexPlayer;
            if (isNaN(x) || isNaN(y)) {
              x = Math.floor(Math.random() * 10);
              y = Math.floor(Math.random() * 10);
            };
            const game = gameDB.find(game => game.gameId === gameID);
            if (!game) {
              console.error(`Game with ID ${gameID} not found`);
              return;
            };
            const enemy = gameDB.find(game => game.isCurrentPlayer !== playerIndex);
            const isAttackWas = game.previousAttacks.some(attack =>
              attack.x === x && attack.y === y
            );
            if (isAttackWas) {
              console.error(`Attack at (${x}, ${y}) was already`);
              return;
            };
            const attackStatus = getAttackStatus(game, x, y);
            console.log(attackStatus, 'status');
            if (attackStatus == Status.Shot || attackStatus == Status.Killed) {
              game.addTurn = playerIndex;
            } else {
              if (enemy) {
                game.addTurn = enemy.indexPlayer;
              };
            };
            game.previousAttacks.push({ x, y });
            const attackFeedback = {
              type: TypesOfMessages.Attack,
              data: JSON.stringify({
                position: { x, y },
                currentPlayer: game.isCurrentPlayer,
                status: attackStatus,
              }),
              id: 0,
            };
            gameDB.forEach(item => {
              const playerSocketFromUserMap = Array.from(wsUserMap.entries()).find(entry => entry[1].userID === item.indexPlayer);
              const playerSocket = playerSocketFromUserMap ? playerSocketFromUserMap[0] : undefined;
              if (playerSocket) {
                playerSocket.send(JSON.stringify(attackFeedback));
              }
            });
            console.log("game.addTurn:", game.addTurn);
            const nextPlayerGame = gameDB.find(item => item.indexPlayer === game.addTurn);
            console.log("Nextplayergame:", nextPlayerGame);
            if (nextPlayerGame && attackStatus === Status.Miss) {
              const turnData = {
                type: TypesOfMessages.Turn,
                data: JSON.stringify({
                  currentPlayer: nextPlayerGame.addTurn
                }),
                id: 0,
              };
              gameDB.forEach(item => {
                const playerSocketFromUserMap = Array.from(wsUserMap.entries()).find(entry => entry[1].userID === item.indexPlayer);
                const playerSocket = playerSocketFromUserMap ? playerSocketFromUserMap[0] : undefined;
                if (playerSocket) {
                  console.log("Sending turn data to player:", item.indexPlayer);
                  playerSocket.send(JSON.stringify(turnData));
                } else {
                  console.error("Player socket not found.");
                };
              });
            } else {
              console.error("Next player game data not found.");
            };
          } catch (err) {
            console.error('Error Attack message:', err);
          };
          break;
      };
    } catch (err) {
      console.error(`Parsing JSON error: ${err}`);
    }
  });

  ws.on('close', () => {
    wsUserMap.delete(ws);
    console.log('Connection is closed');
  });
});



function updateRoomState(socket: WebSocket) {
  const onlyOnePlayerRooms = roomDB.filter(room => room.roomUsers.length === 1);
  const updatedRoomsData = onlyOnePlayerRooms.map(room => ({
    roomId: room.roomID,
    roomUsers: room.roomUsers.map(user => ({
      name: user.name,
      index: user.index
    }))
  }));
  const updateRoomResponse = {
    type: TypesOfMessages.UpdateRoom,
    data: JSON.stringify(updatedRoomsData),
    id: 0
  };

  wsServer.clients.forEach(client => {
    if (client.readyState === socket.OPEN) {
      client.send(JSON.stringify(updateRoomResponse));
    };
  });
};




