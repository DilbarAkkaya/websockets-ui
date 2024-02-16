import { PlayerData, RoomData } from "../../types/types";

export const playerDB: { [userId: string]: PlayerData} = {};
export const roomDB: { [roomId: number]: RoomData } = {};