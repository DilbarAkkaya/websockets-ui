import { PlayerData, RoomData } from "../../types/types";

export const playerDB: { [socketID: string]: PlayerData} = {};
export const roomDB: { [socketID: number]: RoomData } = {};