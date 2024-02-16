import { TypesOfMessages, UserRoomResponse } from "../types/types";

export const sendUserRoomResponse = (data: UserRoomResponse) =>{
  const response = {
    type: TypesOfMessages.Reg,
    data: data,
    id: 0
  }
  return response;
}