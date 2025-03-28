"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(socket) {
        this.nickname = "";
        this.socket = socket;
        this.team = null;
        this.role = null;
        this.roomCode = null;
    }
}
exports.User = User;
