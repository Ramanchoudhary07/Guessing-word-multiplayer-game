"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const Room_1 = require("./Room");
const messages_1 = require("./messages");
class RoomManager {
    constructor() {
        this.users = [];
        this.rooms = [];
    }
    addUser(user) {
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
    addHandler(user) {
        user.socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === messages_1.SET_NAME) {
                const nicknameFromData = message.payload.nickname;
                if (nicknameFromData) {
                    user.nickname = nicknameFromData;
                }
                console.log(`${user.nickname} is connected
        `);
            }
            if (message.type === messages_1.JOIN_ROOM) {
                const room = this.rooms.find((room) => room.code === message.code);
                if (room) {
                    room.addUser(user);
                }
                else {
                    const newRoom = new Room_1.Room(user, message.code, message.gameState);
                    this.rooms.push(newRoom);
                }
            }
            if (message.type === messages_1.UPDATE_GAME_STATE) {
                const room = this.rooms.find((room) => room.code === message.payload.code);
                if (room) {
                    room.updateState(user, message.payload.cardIndex, message.payload.redScore, message.payload.blueScore, message.payload.turn, message.payload.gameLog);
                }
            }
            if (message.type === messages_1.UPDATE_TEAM_ROLE) {
                const room = this.rooms.find((room) => room.code === message.payload.code);
                if (room) {
                    room.updateTeamAndRole(user, message.payload.team, message.payload.role);
                }
            }
            if (message.type === messages_1.CLUE_INPUT) {
                const room = this.rooms.find((room) => room.code === message.payload.code);
                if (room) {
                    room.updateClueInput(user, message.payload.clueWord, message.payload.clueNumber, message.payload.gameLog);
                }
            }
            if (message.type === messages_1.WINNER) {
                const room = this.rooms.find((room) => room.code === message.payload.code);
                if (room) {
                    room.updateWinner(user, message.payload.winner);
                }
            }
        });
    }
    removeUser(socket) {
        this.users = this.users.filter((user) => user.socket !== socket);
    }
}
exports.RoomManager = RoomManager;
