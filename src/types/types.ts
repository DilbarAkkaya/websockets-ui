import { WebSocket } from "ws";

export interface WebSocketMessage<T> {
  type: TypesOfMessages;
  data: T;
  id: number;
}

export enum TypesOfMessages {
  Reg = 'reg',
  CreateGame = 'create_game',
  StartGame = 'start_game',
  Turn = 'turn',
  Attack = 'attack',
  Finish = 'finish',
  UpdateRoom = 'update_room',
  UpdateWinners = 'update_winners',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room'
}

export interface PlayerData {
  name: string;
  password: string;
  ws?: WebSocket;
}

export interface RoomData {
  indexRoom: number;
  players: string[];
}

export interface GameData {
  idGame: number;
  idPlayer: number;
}

export interface UserRoomResponse {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}
export interface RegistrationData {
  type: TypesOfMessages.Reg;
  data:UserRoomResponse;
  id: 0,
}