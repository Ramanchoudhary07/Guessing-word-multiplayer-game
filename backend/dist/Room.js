"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const messages_1 = require("./messages");
class Room {
    constructor(user, code, gameState) {
        this.gameState = gameState;
        this.winner = "";
        this.code = code;
        user.roomCode = this.code;
        this.users = [user];
        user.socket.send(JSON.stringify({
            type: messages_1.CREATE_ROOM,
            payload: { code: this.code, user: user.nickname },
        }));
        // user.socket.send(JSON.stringify({ user: user.nickname }));
    }
    addUser(user) {
        this.users.push(user);
        user.socket.send(JSON.stringify({
            type: messages_1.JOIN_ROOM,
            payload: {
                gameState: this.gameState,
            },
        }));
    }
    updateState(user, cardIndex, redScore, blueScore, turn, gameLog) {
        this.gameState.words[cardIndex].revealed = true;
        this.gameState.redScore = redScore;
        this.gameState.blueScore = blueScore;
        this.gameState.turn = turn;
        this.gameState.gameLog = gameLog;
        this.users.map((u) => {
            if (u != user) {
                u.socket.send(JSON.stringify({
                    type: "updateGameState",
                    payload: {
                        cardIndex: cardIndex,
                        redScore: this.gameState.redScore,
                        blueScore: this.gameState.blueScore,
                        turn: this.gameState.turn,
                        gameLog: this.gameState.gameLog,
                    },
                }));
            }
        });
    }
    updateTeamAndRole(user, team, role) {
        if (team === "blue") {
            if (role === "spymaster") {
                this.gameState.blueTeam.spymaster = user.nickname;
            }
            else {
                this.gameState.blueTeam.operatives.push(user.nickname);
            }
        }
        else {
            if (role === "spymaster") {
                this.gameState.redTeam.spymaster = user.nickname;
            }
            else {
                this.gameState.redTeam.operatives.push(user.nickname);
            }
        }
        this.users.map((u) => {
            if (u != user) {
                u.socket.send(JSON.stringify({
                    type: "updateTeamAndRole",
                    payload: {
                        blueTeam: this.gameState.blueTeam,
                        redTeam: this.gameState.redTeam,
                    },
                }));
            }
        });
    }
    updateClueInput(user, clueWord, clueNumber, gameLog) {
        this.gameState.clueWord = clueWord;
        this.gameState.clueNumber = clueNumber;
        this.gameState.gameLog = gameLog;
        console.log("from room, clue input", this.gameState.gameLog, this.gameState.clueWord);
        this.users.map((u) => {
            if (u != user) {
                u.socket.send(JSON.stringify({
                    type: "clueInput",
                    payload: {
                        clueWord: this.gameState.clueWord,
                        clueNumber: this.gameState.clueNumber,
                        gameLog: this.gameState.gameLog,
                    },
                }));
            }
        });
    }
    updateWinner(user, winner) {
        this.winner = winner;
        this.users.map((u) => {
            if (u != user) {
                u.socket.send(JSON.stringify({
                    type: "winner",
                    payload: {
                        winner: this.winner,
                    },
                }));
            }
        });
    }
}
exports.Room = Room;
