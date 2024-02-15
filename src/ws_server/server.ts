import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { playerDB } from './database/palyerDB';
dotenv.config();

const PORT = process.env.PORT || 8080;
const wsServer = new WebSocketServer({ port: Number(PORT) })
wsServer.on('listening', () => {
  console.log(`WS Server is starting on the ${PORT} `);
  console.log(`WebSocket server parameters: ${JSON.stringify(wsServer.options.port)}`);
})

wsServer.on('connection', (ws) => {
  console.log(`New WebSocket connection`);
  ws.on('message', (message) => {
    try {
      const messageString = message.toString('utf-8');
      const parsedMessage = JSON.parse(messageString);
      console.log(parsedMessage);
      const parsedData = JSON.parse(parsedMessage.data);
      console.log(parsedData);
      if (parsedMessage.type === 'reg') {
        const playerName = parsedData.name;
        const playerPassword = parsedData.password;
        const newPlayer = {
          name: playerName,
          password: playerPassword
        };
        playerDB[playerName] = newPlayer;
        console.log(`Player ${playerName} added to playerDB`);
        console.log(`Players in playerDB: ${JSON.stringify(playerDB)}`);
      }
    } catch(err) {
       console.error(`Parsing JSON error: ${err}`)
    }
  });

  ws.on('close', () => {
    console.log('Connection is closed');
    const playersNamesArray = Object.keys(playerDB);
    playersNamesArray.forEach((playerName) => {
      if (playerDB[playerName]?.ws === ws) {
        delete playerDB[playerName];
        console.log(`Player ${playerName} removed from playerDB`);
      }
    });
  });

});