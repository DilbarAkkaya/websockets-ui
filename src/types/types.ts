//import { WebSocket } from "ws";

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
  userID?: number;
}


export interface RoomData {
  roomID: number;
  roomUsers: {
    name?: string;
    index?: number;
  }[];
}

export interface GameData {
  idGame: number;
  idPlayer: number;
}

export interface UserRegResponse {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}
export interface RegistrationData {
  type: TypesOfMessages.Reg;
  data:UserRegResponse;
  id: 0;
}
/* export interface RoomIndex {
  indexRoom: number;
}
export interface AddUser {
  type: TypesOfMessages.AddUserToRoom;
  data: RoomIndex;
  id: 0;
} */