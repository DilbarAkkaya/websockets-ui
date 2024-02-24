//import { WebSocket } from "ws";

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
  AddUserToRoom = 'add_user_to_room',
  AddShips = 'add_ships'
}

export interface PlayerData {
  name: string;
  password: string;
  userID: number;
  ws: WebSocket;
}


export interface RoomData {
  roomID: number;
  roomUsers: {
    name: string;
    index: number;
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
  data: UserRegResponse;
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

export interface IPosition {
  x: number;
  y: number;
}
export enum TypesOfTypeShip {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Huge = 'huge',
}
export interface IShip {
  position: IPosition;
  direction: boolean;
  length: number;
  type: TypesOfTypeShip;
}
export interface AddShipsResponce {
  type: TypesOfMessages.AddShips;
  data: IGame;
  id: 0;
}

export interface ICurrentPlayer {
  currentPlayer: number;
}

export interface TurnResponse {
  type: TypesOfMessages.Turn;
  data: ICurrentPlayer
  id: 0;
}
export interface IGame {
  gameId: number;
  ships: IShip[];
  indexPlayer: number;
}

export interface IStartGame {
  ships: IShip[];
  currentPlayerIndex: number;
}
export interface StartGameResponce {
  type: TypesOfMessages.StartGame;
  data: IStartGame;
  id: 0;
}
export interface IAttack {
  gameID: number;
  x: IPosition;
  y: IPosition;
  indexPlayer: number;

}
export interface AttackResponce {
  type: TypesOfMessages.Attack;
  data: IAttack;
  id: 0;
}
export enum Status {
  Miss = 'miss',
  Killed = 'killed',
  Shot = 'shot',
}

export interface IAttackFeedback {
  positions: IPosition;
  currentPlayer: number;
  status: Status;
}