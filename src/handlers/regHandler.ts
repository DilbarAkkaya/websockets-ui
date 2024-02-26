import { WebSocket } from "ws";
import { PlayerData, UserRegResponse } from "../types/types";
//import { playerDB } from '../ws_server/server';
import { usersDB } from "../ws_server/server";
export const handlerReg = (data: PlayerData, id: number, ws: WebSocket) => {
  /*   if (typeof id !== 'number' || isNaN(id)) {
      console.error('Invalid id:', id);
      return; 
    } */
          const playerName = data.name;
      const playerPassword = data.password;
    
    const isUserExist = usersDB.some(user => user.userID === id);
    if (isUserExist) {
      const errorData: UserRegResponse = {
        name: playerName,
        index: id,
        error: true,
        errorText: "UserID is already in use"
      };
      return errorData;
    }

      // Проверяем, что имя пользователя и пароль были переданы
      if (!playerName || !playerPassword) {
        const errorData: UserRegResponse = {
          name: playerName,
          index: id,
          error: true,
          errorText: "Name and password are required"
        };
        return errorData;
      }
    
      // Создаем объект нового игрока
      const newPlayer = {
        userID: id,
        name: playerName,
        password: playerPassword, 
        ws: ws,
      };
    
      // Добавляем нового игрока в базу данных
      usersDB.push(newPlayer);
    
      console.log(`Player id ${id} with name ${playerName} added to playerDB`);
    
      // Возвращаем данные об успешной регистрации
      const regData: UserRegResponse = {
        name: playerName,
        index: id,
        error: false,
        errorText: ""
      };
      return regData;
    };