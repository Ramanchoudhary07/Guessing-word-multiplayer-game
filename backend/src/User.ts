import { WebSocket } from "ws";

export class User {
  public nickname: string;
  public socket: WebSocket;
  public team: string | null;
  public role: string | null;
  public roomCode: string | null;

  constructor(socket: WebSocket) {
    this.nickname = "";
    this.socket = socket;
    this.team = null;
    this.role = null;
    this.roomCode = null;
  }
}
