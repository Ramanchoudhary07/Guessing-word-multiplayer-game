"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const RoomManager_1 = require("./RoomManager");
const User_1 = require("./User");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const roomManager = new RoomManager_1.RoomManager();
wss.on("connection", (ws) => {
    ws.on("error", (err) => {
        console.error(`WebSocket error: ${err}`);
    });
    const user = new User_1.User(ws);
    roomManager.addUser(user);
    ws.on("disconnect", () => {
        roomManager.removeUser(user === null || user === void 0 ? void 0 : user.socket);
    });
});
