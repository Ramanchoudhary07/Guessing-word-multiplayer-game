import WebSocket from "ws";
import { Room } from "./Room";
import {
  CLUE_INPUT,
  JOIN_ROOM,
  NAME_ERROR,
  SET_NAME,
  UPDATE_GAME_STATE,
  UPDATE_TEAM_ROLE,
  WINNER,
} from "./messages";
import { User } from "./User";

export class RoomManager {
  public users: User[];
  private rooms: Room[];

  constructor() {
    this.users = [];
    this.rooms = [];
  }

  addUser(user: User) {
    this.users.push(user);
    this.addHandler(user);
    // user.socket.once("message", (data) => {
    //   const nicknameFromData = JSON.parse(data.toString()).nickname;
    //   if (nicknameFromData) {
    //     this.users.filter((user) => {
    //       if (user.nickname === nicknameFromData) {
    //         user.socket.send(
    //           JSON.stringify({
    //             type: "error",
    //             payload: { message: "Nickname already taken" },
    //           })
    //         );
    //         user.socket.close();
    //         return;
    //       }
    //       user.nickname = nicknameFromData;
    //     });
    //   }
    //   console.log(`${user.nickname} is connected`);
    // });
  }

  addHandler(user: User) {
    user.socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === SET_NAME) {
        const nicknameFromData = message.payload.nickname;
        if (nicknameFromData) {
          user.nickname = nicknameFromData;
        }
        console.log(`${user.nickname} is connected
        `);
      }

      if (message.type === JOIN_ROOM) {
        const room = this.rooms.find((room) => room.code === message.code);
        if (room) {
          room.addUser(user);
        } else {
          const newRoom = new Room(user, message.code, message.gameState);
          this.rooms.push(newRoom);
        }
      }

      if (message.type === UPDATE_GAME_STATE) {
        const room = this.rooms.find(
          (room) => room.code === message.payload.code
        );
        if (room) {
          room.updateState(
            user,
            message.payload.cardIndex,
            message.payload.redScore,
            message.payload.blueScore,
            message.payload.turn,
            message.payload.gameLog,
            message.payload.clueWord,
            message.payload.clueNumber
          );
        }
      }

      if (message.type === UPDATE_TEAM_ROLE) {
        const room = this.rooms.find(
          (room) => room.code === message.payload.code
        );
        if (room) {
          room.updateTeamAndRole(
            user,
            message.payload.team,
            message.payload.role
          );
        }
      }

      if (message.type === CLUE_INPUT) {
        const room = this.rooms.find(
          (room) => room.code === message.payload.code
        );
        if (room) {
          room.updateClueInput(
            user,
            message.payload.clueWord,
            message.payload.clueNumber,
            message.payload.gameLog
          );
        }
      }

      if (message.type === WINNER) {
        const room = this.rooms.find(
          (room) => room.code === message.payload.code
        );
        if (room) {
          room.updateWinner(user, message.payload.winner);
        }
      }
    });
  }

  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user.socket !== socket);
  }
}
