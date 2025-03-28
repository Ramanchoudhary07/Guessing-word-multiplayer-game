import { WebSocketServer } from "ws";
import { RoomManager } from "./RoomManager";
import { User } from "./User";

const wss = new WebSocketServer({ port: 8080 });

const roomManager = new RoomManager();

wss.on("connection", (ws) => {
  ws.on("error", (err) => {
    console.error(`WebSocket error: ${err}`);
  });
  const user = new User(ws);
  roomManager.addUser(user);

  ws.on("disconnect", () => {
    roomManager.removeUser(user?.socket);
  });
});
