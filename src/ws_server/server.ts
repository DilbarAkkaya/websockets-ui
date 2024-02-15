import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 8181;
console.log(typeof PORT)
const wsServer = new WebSocketServer({ port: Number(PORT) })
wsServer.on('listening', () => {
  console.log(`WS Server is starting on the ${PORT} `);
  console.log(`WebSocket server parameters: ${JSON.stringify(wsServer.options)}`);
})

wsServer.on('connection', (ws) => {
  console.log(`New WebSocket connection`);
  ws.on('message', (message) => {
    console.log(typeof(message));
  })
});