import WordCardPopup from "@/components/WordCard";
import { getWordsList } from "@/helper/generateRandomWordList";
import { useSocket } from "@/hooks/useSocket";
import useZustand from "@/zustand/useStore";
import { useEffect, useState } from "react";

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

type SelectedCard = {
  index: number;
  word: string;
  defintion: string;
};

const Game = () => {
  const socket = useSocket();
  const { nickname, roomCode, setUsers } = useZustand();

  useEffect(() => {
    if (!socket) return;
    socket.send(JSON.stringify({ type: "set-name", payload: { nickname } }));
    socket.send(
      JSON.stringify({ type: "join-room", code: roomCode, gameState })
    );
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data.toString());
      console.log(data);

      switch (data.type) {
        //-----------------------------------------------------------------------------------
        case "create-room":
          const users = [data.payload.user];
          setUsers(users);
          break;
        //-----------------------------------------------------------------------------------
        case "join-room":
          console.log(data.payload.gameState);
          setGameState(data.payload.gameState);
          break;
        //-----------------------------------------------------------------------------------
        case "updateGameState":
          setGameState((prev) => {
            const newWords = [...prev.words];
            newWords[data.payload.cardIndex].revealed = true;

            return {
              ...prev,
              words: newWords,
              redScore: data.payload.redScore,
              blueScore: data.payload.blueScore,
              turn: data.payload.turn,
              gameLog: data.payload.gameLog,
              clueWord: data.payload.clueWord,
              clueNumber: data.payload.clueNumber,
            };
          });
          break;
        //-----------------------------------------------------------------------------------
        case "winner":
          SetWinner(data.payload.winner);
          break;
        //-----------------------------------------------------------------------------------
        case "updateTeamAndRole":
          setGameState((prev) => ({
            ...prev,
            blueTeam: {
              spymaster: data.payload.blueTeam.spymaster,
              operatives: data.payload.blueTeam.operatives,
            },
            redTeam: {
              spymaster: data.payload.redTeam.spymaster,
              operatives: data.payload.redTeam.operatives,
            },
          }));
          console.log(gameState);

          break;
        //-----------------------------------------------------------------------------------
        case "clueInput":
          setGameState((prev) => ({
            ...prev,
            clueWord: data.payload.clueWord,
            clueNumber: data.payload.clueNumber,
            gameLog: data.payload.gameLog,
          }));
          break;
        //-----------------------------------------------------------------------------------
      }
    };
  }, [socket]);

  const [gameState, setGameState] = useState<GameState>({
    redScore: 8,
    blueScore: 9,
    redTeam: {
      spymaster: "",
      operatives: [],
    },
    blueTeam: {
      spymaster: "",
      operatives: [],
    },
    turn: "blue",
    words: getWordsList(),
    clueWord: "Clue",
    clueNumber: 0,
    gameLog: [],
  });

  const [userRole, setUserRole] = useState<Role>("");
  const [userTeam, setUserTeam] = useState<Team>("");
  const [clueInput, setClueInput] = useState<string>("");
  const [clueNumberInput, setClueNumberInput] = useState<number>(0);
  const [teamSelected, setTeamSelected] = useState<boolean>(false);
  const [winner, SetWinner] = useState<string>("");

  const handleGiveClue = () => {
    if (clueInput.trim() === "" || clueNumberInput <= 0) return;

    setGameState((prev) => {
      const updatedGameState = {
        ...prev,
        clueWord: clueInput,
        clueNumber: clueNumberInput,
        gameLog: [
          ...prev.gameLog,
          `${userTeam} team clue: ${clueInput} - ${clueNumberInput}`,
        ],
      };

      if (socket) {
        socket.send(
          JSON.stringify({
            type: "clueInput",
            payload: {
              code: roomCode,
              clueWord: updatedGameState.clueWord,
              clueNumber: updatedGameState.clueNumber,
              gameLog: updatedGameState.gameLog,
            },
          })
        );
      }

      return updatedGameState;
    });

    setClueInput("");
    setClueNumberInput(0);
  };

  const [toggleCard, setToggleCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SelectedCard>({
    index: 0,
    word: "",
    defintion: "",
  });
  const [selectedCardNumber, setSelectedCardNumber] = useState<number>(1);

  const handleToggleCard = (index: number) => {
    const currCard = gameState.words[index];
    if (currCard.revealed) return;

    setSelectedCard({
      index: index,
      word: currCard.word,
      defintion: currCard.defintion,
    });
    setToggleCard(!toggleCard);
  };

  useEffect(() => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "winner",
          payload: {
            code: roomCode,
            winner,
          },
        })
      );
    }
  }, [winner]);

  const handleCardClick = (index: number) => {
    console.log(
      "from handleCardClick",
      userRole,
      userTeam,
      gameState.turn,
      gameState.clueWord
    );

    if (userRole === "spymaster") return; // Spymasters can't reveal cards
    if (userTeam === "blue" && gameState.turn === "red") return;
    if (userTeam === "red" && gameState.turn === "blue") return;
    if (gameState.clueWord === "") return;

    if (gameState.words[selectedCard.index].team === "black") {
      const newWinner = userTeam === "blue" ? "red" : "blue";
      SetWinner(newWinner);
      return;
    }

    setGameState((prev) => {
      const updatedGameState = { ...prev };
      const newWords = [...prev.words];
      newWords[index].revealed = true;

      const newGameLog = [
        ...prev.gameLog,
        `${userTeam} team selected "${newWords[index].word}"`,
      ];

      updatedGameState.words = newWords;
      updatedGameState.gameLog = newGameLog;

      if (gameState.words[selectedCard.index].team === userTeam) {
        if (userTeam === "blue") {
          const newScore = updatedGameState.blueScore - 1;
          if (newScore === 0) {
            SetWinner(userTeam);
            return updatedGameState;
          }
          updatedGameState.blueScore = newScore;
        } else {
          const newScore = gameState.redScore - 1;
          if (newScore === 0) {
            SetWinner(userTeam);
            return updatedGameState;
          }
          updatedGameState.redScore = newScore;
        }
      }

      setToggleCard(!toggleCard);
      setSelectedCardNumber(selectedCardNumber + 1);
      console.log("selectedCardNumber: ", selectedCardNumber);

      if (
        selectedCardNumber >= updatedGameState.clueNumber ||
        updatedGameState.words[selectedCard.index].team != userTeam
      ) {
        console.log("inside Turn change case");

        if (userTeam == "blue") {
          if (gameState.words[selectedCard.index].team == "red") {
            const newScore = updatedGameState.redScore - 1;
            if (newScore === 0) {
              SetWinner("red");
              return updatedGameState;
            }
            updatedGameState.redScore = newScore;
          }
        } else {
          if (gameState.words[selectedCard.index].team == "blue") {
            const newScore = updatedGameState.blueScore - 1;
            if (newScore === 0) {
              SetWinner("blue");
              return updatedGameState;
            }
            updatedGameState.blueScore = newScore;
          }
        }
        setSelectedCardNumber(1);
        setClueNumberInput(0);
        if (gameState.turn === "blue") {
          updatedGameState.turn = "red";
        } else {
          updatedGameState.turn = "blue";
        }
        updatedGameState.clueWord = "";
        updatedGameState.clueNumber = 0;
        setClueInput("");
      }

      if (socket) {
        socket.send(
          JSON.stringify({
            type: "updateGameState",
            payload: {
              code: roomCode,
              cardIndex: selectedCard.index,
              redScore: updatedGameState.redScore,
              blueScore: updatedGameState.blueScore,
              turn: updatedGameState.turn,
              gameLog: updatedGameState.gameLog,
              clueWord: updatedGameState.clueWord,
              clueNumber: updatedGameState.clueNumber,
            },
          })
        );
      }

      return updatedGameState;
    });
  };

  const toggleRole = (team: Team, role: Role) => {
    if (
      team === "blue" &&
      role === "spymaster" &&
      gameState.blueTeam.spymaster != ""
    ) {
      return;
    }
    if (
      team === "red" &&
      role === "spymaster" &&
      gameState.redTeam.spymaster != ""
    ) {
      return;
    }

    if (socket) {
      socket.send(
        JSON.stringify({
          type: "updateTeamAndRole",
          payload: {
            code: roomCode,
            team,
            role,
          },
        })
      );
    }

    setUserTeam(team);
    setUserRole(role);
    setGameState((prev) => {
      const updatedGameState = { ...prev };

      if (team === "blue") {
        if (role === "spymaster") {
          let updatedWords = [...updatedGameState.words];
          updatedWords = updatedWords.map((word) => ({
            ...word,
            revealed: true,
          }));
          updatedGameState.words = updatedWords;
          updatedGameState.blueTeam.spymaster = nickname; // Replace "user" with actual user ID or name
        } else {
          updatedGameState.blueTeam.operatives = [
            ...prev.blueTeam.operatives,
            nickname, // Replace with actual user ID or name
          ];
        }
      } else if (team === "red") {
        if (role === "spymaster") {
          let updatedWords = [...updatedGameState.words];
          updatedWords = updatedWords.map((word) => ({
            ...word,
            revealed: true,
          }));
          updatedGameState.words = updatedWords;
          updatedGameState.redTeam.spymaster = nickname; // Replace "user" with actual user ID or name
        } else {
          updatedGameState.redTeam.operatives = [
            ...prev.redTeam.operatives,
            nickname,
          ];
        }
      }

      return updatedGameState;
    });
    setTeamSelected(true);
  };

  if (winner) {
    return (
      <div
        className="max-w-7xl mx-auto p-4 border-2 border-gray-800 rounded-lg text-white 
      flex items-center justify-center"
      >
        <div className="bg-gray-800 text-2xl p-2">{winner} team is winner</div>;
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 border-2 border-gray-800 rounded-lg text-white">
      <div>its {gameState.turn} team turn</div>
      <div className="grid grid-cols-3 grid-rows-2 md:grid-cols-4 gap-4">
        {/* Red Team Panel */}
        <div className="flex flex-col gap-4">
          <div className="border-2 rounded-lg p-4">
            <h2 className="text-xl font-bold">Red Team {gameState.redScore}</h2>
            <h3 className="text-lg font-semibold mt-2">Spymaster</h3>
            <div className="border rounded-lg p-2 mt-1">
              <button
                disabled={teamSelected}
                className={`w-full ${
                  userTeam === "red" && userRole === "spymaster"
                    ? "bg-red-200 text-black"
                    : ""
                }`}
                onClick={() => toggleRole("red", "spymaster")}
              >
                Red spymaster
              </button>
              <div>{gameState.redTeam.spymaster}</div>
            </div>
            <h3 className="text-lg font-semibold mt-2">Operatives</h3>
            <div className="border rounded-lg p-2 mt-1">
              <button
                disabled={teamSelected}
                className={`w-full ${
                  userTeam === "red" && userRole === "operative"
                    ? "bg-red-200"
                    : ""
                }`}
                onClick={() => toggleRole("red", "operative")}
              >
                Red operative
              </button>
              <div>
                {gameState.redTeam.operatives.map((u, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <span>{u}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden border-2 rounded-lg p-4 md:flex flex-grow justify-center items-center font-bold text-2xl">
            CODE NAME
          </div>
        </div>

        {/* Center Game Board */}
        <div className="grid col-span-3 md:col-span-2">
          {/* Word grid */}

          <div className="w-full">
            {toggleCard ? (
              <>
                <div>
                  {toggleCard ? (
                    <WordCardPopup
                      index={selectedCard.index}
                      word={selectedCard.word}
                      definition={selectedCard.defintion}
                      onClose={() => handleToggleCard(selectedCard.index)}
                      onSelect={() => handleCardClick(selectedCard.index)}
                    />
                  ) : (
                    <div></div>
                  )}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                {gameState.words.map((word, index) => (
                  <button
                    key={index}
                    className={`text-black border-2 rounded-lg p-1 h-24 flex items-center justify-center
                  ${
                    word.revealed
                      ? word.team === "red"
                        ? "bg-red-500 text-white"
                        : word.team === "blue"
                        ? "bg-blue-500 text-white"
                        : word.team === "black"
                        ? "bg-black text-white"
                        : "bg-gray-600 text-white"
                      : "bg-white"
                  }`}
                    onClick={() => handleToggleCard(index)}
                  >
                    {word.word}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clue display area */}
          <div className="mt-4 border-2 rounded-lg p-2 text-center">
            <div className="flex gap-2 items-center justify-center">
              <div className="text-xl font-bold px-2 bg-white text-black rounded-md">
                {gameState.clueWord}
              </div>
              <div className="text-xl font-bold px-2 bg-white text-black rounded-md">
                {gameState.clueNumber > 0 ? `${gameState.clueNumber}` : ""}
              </div>
            </div>
          </div>

          {/* Clue input area - shown only to spymaster */}
          {gameState.clueWord != "" &&
            userRole === "spymaster" &&
            userTeam === gameState.turn && (
              <div className="mt-4 flex space-x-2 items-center">
                <input
                  type="text"
                  className="border-2 rounded-lg p-2 flex-grow bg-gray-900"
                  placeholder="Clue Word"
                  value={clueInput}
                  onChange={(e) => setClueInput(e.target.value)}
                />
                <input
                  type="number"
                  className="border-2 rounded-lg p-2 w-16 text-center bg-gray-900"
                  min="0"
                  max="9"
                  value={clueNumberInput}
                  onChange={(e) =>
                    setClueNumberInput(parseInt(e.target.value) || 0)
                  }
                />
                <button
                  className="border-2 rounded-lg p-2 bg-green-400 text-black"
                  onClick={handleGiveClue}
                >
                  Give Clue
                </button>
              </div>
            )}
        </div>
        {/* Blue Team Panel */}
        <div className="flex flex-col gap-4">
          <div className="border-2 rounded-lg p-4">
            <h2 className="text-xl font-bold">
              Blue Team {gameState.blueScore}
            </h2>
            <h3 className="text-lg font-semibold mt-2">Spymaster</h3>
            <div className="border rounded-lg p-2 mt-1">
              <button
                disabled={teamSelected}
                className={`w-full ${
                  userTeam === "blue" && userRole === "spymaster"
                    ? "bg-blue-200 text-black"
                    : ""
                }`}
                onClick={() => toggleRole("blue", "spymaster")}
              >
                blue spymaster
              </button>
              <div>{gameState.blueTeam.spymaster}</div>
            </div>
            <h3 className="text-lg font-semibold mt-2">Operatives</h3>
            <div className="border rounded-lg p-2 mt-1">
              <button
                disabled={teamSelected}
                className={`w-full ${
                  userTeam === "blue" && userRole === "operative"
                    ? "bg-blue-200"
                    : ""
                }`}
                onClick={() => toggleRole("blue", "operative")}
              >
                blue operative
              </button>
              <div>
                {gameState.blueTeam.operatives.map((u, index) => (
                  <div key={index} className="flex gap-2 p-1 flex-wrap">
                    <span>{u}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Game Log */}
          <div className="border-2 rounded-lg p-4 flex-grow">
            <h2 className="text-xl font-bold">Game Log</h2>
            <div className="mt-2 h-64 overflow-y-auto">
              {gameState.gameLog.map((log, index) => (
                <p key={index}>{log}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
