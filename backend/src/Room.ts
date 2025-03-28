import { WebSocket } from "ws";
import { CREATE_ROOM, JOIN_ROOM } from "./messages";
import { User } from "./User";

type Team = "red" | "blue" | "";
type Role = "spymaster" | "operative" | "";
type WordCard = {
  word: string;
  defintion: string;
  revealed: boolean;
  team: Team | "neutral" | "black";
};

interface GameState {
  redScore: number;
  blueScore: number;
  redTeam: {
    spymaster: string;
    operatives: string[];
  };
  blueTeam: {
    spymaster: string;
    operatives: string[];
  };
  turn: Team;
  words: WordCard[];
  clueWord: string;
  clueNumber: number;
  gameLog: string[];
}

export class Room {
  private users: User[];
  public code: string;
  public gameState: GameState;
  private winner: string;

  constructor(user: User, code: string, gameState: GameState) {
    this.gameState = gameState;
    this.winner = "";
    this.code = code;
    user.roomCode = this.code;
    this.users = [user];
    user.socket.send(
      JSON.stringify({
        type: CREATE_ROOM,
        payload: { code: this.code, user: user.nickname },
      })
    );

    // user.socket.send(JSON.stringify({ user: user.nickname }));
  }

  addUser(user: User) {
    this.users.push(user);
    user.socket.send(
      JSON.stringify({
        type: JOIN_ROOM,
        payload: {
          gameState: this.gameState,
        },
      })
    );
  }

  updateState(
    user: User,
    cardIndex: number,
    redScore: number,
    blueScore: number,
    turn: Team,
    gameLog: string[],
    clueWord: string,
    clueNumber: number
  ) {
    this.gameState.words[cardIndex].revealed = true;
    this.gameState.redScore = redScore;
    this.gameState.blueScore = blueScore;
    this.gameState.turn = turn;
    this.gameState.gameLog = gameLog;
    this.gameState.clueWord = clueWord;
    this.gameState.clueNumber = clueNumber;
    this.users.map((u) => {
      if (u != user) {
        u.socket.send(
          JSON.stringify({
            type: "updateGameState",
            payload: {
              cardIndex: cardIndex,
              redScore: this.gameState.redScore,
              blueScore: this.gameState.blueScore,
              turn: this.gameState.turn,
              gameLog: this.gameState.gameLog,
              clueWord: this.gameState.clueWord,
              clueNumber: this.gameState.clueNumber,
            },
          })
        );
      }
    });
  }

  updateTeamAndRole(user: User, team: Team, role: Role) {
    if (team === "blue") {
      if (role === "spymaster") {
        this.gameState.blueTeam.spymaster = user.nickname;
      } else {
        this.gameState.blueTeam.operatives.push(user.nickname);
      }
    } else {
      if (role === "spymaster") {
        this.gameState.redTeam.spymaster = user.nickname;
      } else {
        this.gameState.redTeam.operatives.push(user.nickname);
      }
    }

    this.users.map((u) => {
      if (u != user) {
        u.socket.send(
          JSON.stringify({
            type: "updateTeamAndRole",
            payload: {
              blueTeam: this.gameState.blueTeam,
              redTeam: this.gameState.redTeam,
            },
          })
        );
      }
    });
  }

  updateClueInput(
    user: User,
    clueWord: string,
    clueNumber: number,
    gameLog: string[]
  ) {
    this.gameState.clueWord = clueWord;
    this.gameState.clueNumber = clueNumber;
    this.gameState.gameLog = gameLog;
    console.log(
      "from room, clue input",
      this.gameState.gameLog,
      this.gameState.clueWord
    );

    this.users.map((u) => {
      if (u != user) {
        u.socket.send(
          JSON.stringify({
            type: "clueInput",
            payload: {
              clueWord: this.gameState.clueWord,
              clueNumber: this.gameState.clueNumber,
              gameLog: this.gameState.gameLog,
            },
          })
        );
      }
    });
  }

  updateWinner(user: User, winner: string) {
    this.winner = winner;
    this.users.map((u) => {
      if (u != user) {
        u.socket.send(
          JSON.stringify({
            type: "winner",
            payload: {
              winner: this.winner,
            },
          })
        );
      }
    });
  }
}
