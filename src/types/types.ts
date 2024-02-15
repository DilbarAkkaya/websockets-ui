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
    UpdateWinners = 'update_winners'
}

export interface PlayerData {
  name: string;
  password: string;
}