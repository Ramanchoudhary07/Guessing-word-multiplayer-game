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
  const { nickname, roomCode, setUsers, host } = useZustand();

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
          setWinner(data.payload.winner);
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
          setWinner(data.payload.winner);
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
        case "resetGame":
          setGameState(data.payload.gameState);
          setWinner((prev) => {
            prev = "";
            return prev;
          });
          setUserRole("");
          setUserTeam("");
          setClueInput("");
          setClueNumberInput(0);
          setSelectedCardNumber(1);
          setToggleCard(false);
          setTeamSelected(false);
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
  const [winner, setWinner] = useState<string>("");

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

  const handleCardClick = (index: number) => {
    if (userRole === "spymaster") return; // Spymasters can't reveal cards
    if (userTeam === "blue" && gameState.turn === "red") return;
    if (userTeam === "red" && gameState.turn === "blue") return;
    if (gameState.clueWord === "") return;

    if (gameState.words[selectedCard.index].team === "black") {
      const newWinner = userTeam === "blue" ? "red" : "blue";
      setWinner((prev) => {
        prev = newWinner;

        if (socket) {
          socket.send(
            JSON.stringify({
              type: "winner",
              payload: {
                code: roomCode,
                winner: newWinner,
              },
            })
          );
        }

        return prev;
      });
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
            setWinner((prev) => {
              prev = userTeam;
              if (socket) {
                socket.send(
                  JSON.stringify({
                    type: "winner",
                    payload: {
                      code: roomCode,
                      winner: userTeam,
                    },
                  })
                );
              }

              return prev;
            });
            return updatedGameState;
          }
          updatedGameState.blueScore = newScore;
        } else {
          const newScore = gameState.redScore - 1;
          if (newScore === 0) {
            setWinner((prev) => {
              prev = userTeam;
              if (socket) {
                socket.send(
                  JSON.stringify({
                    type: "winner",
                    payload: {
                      code: roomCode,
                      winner: userTeam,
                    },
                  })
                );
              }
              return prev;
            });
            return updatedGameState;
          }
          updatedGameState.redScore = newScore;
        }
      }

      setToggleCard(!toggleCard);
      setSelectedCardNumber(selectedCardNumber + 1);

      if (
        selectedCardNumber >= updatedGameState.clueNumber ||
        updatedGameState.words[selectedCard.index].team != userTeam
      ) {
        if (userTeam == "blue") {
          if (gameState.words[selectedCard.index].team == "red") {
            const newScore = updatedGameState.redScore - 1;
            if (newScore === 0) {
              setWinner((prev) => {
                prev = "red";
                if (socket) {
                  socket.send(
                    JSON.stringify({
                      type: "winner",
                      payload: {
                        code: roomCode,
                        winner: "red",
                      },
                    })
                  );
                }
                return prev;
              });
              return updatedGameState;
            }
            updatedGameState.redScore = newScore;
          }
        } else {
          if (gameState.words[selectedCard.index].team == "blue") {
            const newScore = updatedGameState.blueScore - 1;
            if (newScore === 0) {
              setWinner((prev) => {
                prev = "blue";
                if (socket) {
                  socket.send(
                    JSON.stringify({
                      type: "winner",
                      payload: {
                        code: roomCode,
                        winner: "blue",
                      },
                    })
                  );
                }
                return prev;
              });
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

  const handleResetGame = () => {
    setGameState((prev) => {
      const updatedGameState = { ...prev };
      updatedGameState.words = getWordsList();
      updatedGameState.redScore = 8;
      updatedGameState.blueScore = 9;
      updatedGameState.turn = "blue";
      updatedGameState.clueWord = "Clue";
      updatedGameState.clueNumber = 0;
      updatedGameState.gameLog = [];
      updatedGameState.redTeam.spymaster = "";
      updatedGameState.redTeam.operatives = [];
      updatedGameState.blueTeam.spymaster = "";
      updatedGameState.blueTeam.operatives = [];

      setWinner("");
      setUserRole("");
      setUserTeam("");
      setClueInput("");
      setClueNumberInput(0);
      setSelectedCardNumber(1);
      setToggleCard(false);
      setTeamSelected(false);

      if (socket) {
        socket.send(
          JSON.stringify({
            type: "resetGame",
            payload: {
              code: roomCode,
              gameState: updatedGameState,
            },
          })
        );
      }

      return updatedGameState;
    });
  };

  if (winner) {
    return (
      <div
        className="max-w-full h-full m-10 p-4 border-2 border-gray-800 rounded-lg text-white 
      flex items-center justify-center flex-col gap-4"
      >
        <div className="bg-white text-black rounded-lg text-2xl p-2">
          {winner} team is winner
        </div>
        {host ? (
          <div className="bg-[#FEE401] border rounded-lg p-2 text-black font-bold">
            <button onClick={handleResetGame}>Reset Game</button>
          </div>
        ) : (
          <div> wait for your host to reset the game </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* <Navbar /> */}
      <div className="max-w-full md:mx-6 p-4 text-xs md:text-sm  rounded-lg text-white">
        <div className="w-full flex justify-center">
          <span
            className={`text-center text-2xl  font-bold bg-white px-2 py-1 rounded-lg mb-2  text-black`}
          >
            It's{" "}
            <span
              className={`${
                gameState.turn === "red" ? `text-red-500` : `text-blue-500`
              }`}
            >
              {gameState.turn.toUpperCase()}
            </span>{" "}
            team turn
          </span>
        </div>
        <div
          className="grid grid-cols-3  md:grid-cols-[1fr_3fr_1fr] 
        grid-rows-[1fr_1fr] gap-2 md:gap-10"
        >
          {/* Red Team Panel */}
          <div
            className="flex flex-col gap-4 bg-[#8F2A1D] border-2 rounded-lg md:row-span-1 md:col-span-1
            col-span-1 row-span-1
            md:order-1 order-2"
          >
            <div className=" p-4">
              <div className="text-xl font-bold flex flex-row justify-between">
                <div>Red Team</div>
                <div className="text-4xl">{gameState.redScore}</div>
              </div>
              <h3 className="text-lg font-medium mt-2">Spymaster</h3>
              <div>-{gameState.redTeam.spymaster}</div>
              <div
                className={`${
                  userTeam != "" && userRole != "" ? "" : `bg-[#FEE401] border`
                } text-[#8F2A1D] font-bold  rounded-lg p-2 mt-1 `}
              >
                <button
                  disabled={teamSelected}
                  className={`w-full  ${
                    userTeam != "" && userRole != "" ? "hidden" : ""
                  }`}
                  onClick={() => toggleRole("red", "spymaster")}
                >
                  Red spymaster
                </button>
              </div>
              <h3 className="text-lg font-medium mt-2">{`Operatives(s)`}</h3>
              <div>
                -{" "}
                {gameState.redTeam.operatives.map((u, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <span>{u}</span>
                  </div>
                ))}
              </div>
              <div
                className={`${
                  userTeam != "" && userRole != "" ? "" : `bg-[#FEE401] border`
                }  text-[#8F2A1D] font-bold  rounded-lg p-2 mt-1`}
              >
                <button
                  disabled={teamSelected}
                  className={`w-full ${
                    userTeam != "" && userRole != "" ? "hidden" : ""
                  }`}
                  onClick={() => toggleRole("red", "operative")}
                >
                  Red operative
                </button>
              </div>
            </div>
          </div>
          {/* Code Name */}
          <div
            className="hidden border-2 rounded-lg p-4 md:flex flex-grow justify-center items-end font-bold text-2xl md:row-span-1 md:col-span-1
            col-span-1 row-span-1
            md:order-4 bg-[url(/blackman.png)] bg-cover bg-center"
          >
            <div className="bg-black p-1">CODE NAME</div>
          </div>
          {/* Center Game Board */}
          <div
            className="grid md:row-span-2 md:col-span-1
            col-span-3 row-span-2
            md:order-2 order-1"
          >
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
                <div className="grid grid-cols-5 gap-1 md:gap-4">
                  {gameState.words.map((word, index) => (
                    <button
                      key={index}
                      className={`text-black font-mono md:font-[Handlee] text-xs md:text-xs font-light md:font-extrabold leading-tight border-2 rounded-lg pb-2 md:pb-3 h-16 md:h-24 flex items-end justify-center
                  ${
                    word.revealed
                      ? word.team === "red"
                        ? "bg-[url(/redCard.png)]  "
                        : word.team === "blue"
                        ? "bg-[url(/blueCard.png)]  "
                        : word.team === "black"
                        ? "bg-[url(/blackCard.png)] text-white "
                        : `bg-[url(/whiteCard.png)]`
                      : "bg-[url(/whiteCard.png)] "
                  }  bg-cover bg-center`}
                      onClick={() => handleToggleCard(index)}
                    >
                      {word.word.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clue display area */}
            <div className="mt-4 rounded-lg p-2 text-center">
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
                <div className="mt-4 flex space-x-2 items-center text-white">
                  <input
                    type="text"
                    className="border-2 rounded-lg p-2 px-6 flex-grow bg-black"
                    placeholder="Enter your clue here"
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
          <div
            className="flex flex-col bg-[#3385A3] border-2 rounded-lg gap-4 md:row-span-1 md:col-span-1
            col-span-1 row-span-1
            md:order-3 order-4"
          >
            <div className=" p-4">
              <div className="text-xl font-bold flex flex-row justify-between">
                <div>Blue Team</div>
                <div className="text-4xl">{gameState.blueScore}</div>
              </div>
              <h3 className="text-lg font-medium mt-2">Spymaster</h3>
              <div>- {gameState.blueTeam.spymaster}</div>
              <div
                className={`${
                  userTeam != "" && userRole != "" ? "" : `bg-[#FEE401] border`
                }  rounded-lg  text-[#3385A3] font-bold  p-2 mt-1`}
              >
                <button
                  disabled={teamSelected}
                  className={`w-full ${
                    userTeam != "" && userRole != "" ? "hidden" : ""
                  }`}
                  onClick={() => toggleRole("blue", "spymaster")}
                >
                  Blue spymaster
                </button>
              </div>
              <h3 className="text-lg font-medium mt-2">{`Operatives(s)`}</h3>
              <div>
                -{" "}
                {gameState.blueTeam.operatives.map((u, index) => (
                  <div key={index} className="flex gap-2 p-1 flex-wrap">
                    <span>{u}</span>
                  </div>
                ))}
              </div>
              <div
                className={`${
                  userTeam != "" && userRole != "" ? "" : `bg-[#FEE401] border`
                } rounded-lg  text-[#3385A3] font-bold p-2 mt-1`}
              >
                <button
                  disabled={teamSelected}
                  className={`w-full ${
                    userTeam != "" && userRole != "" ? "hidden" : ""
                  }`}
                  onClick={() => toggleRole("blue", "operative")}
                >
                  Blue operative
                </button>
              </div>
            </div>
          </div>
          {/* Game Log */}
          <div
            className="border-2 rounded-lg p-3 bg-[#93B2C2] bg-[url(/logback.png)] font-semibold bg-cover bg-center text-black flex-shrink  md:row-span-1 md:col-span-1
            col-span-1 row-span-1
            md:order-5 order-3"
          >
            <h2 className="text-xl font-bold">Game Log</h2>
            <div className="mt-2 overflow-y-auto">
              {gameState.gameLog.map((log, index) => (
                <p key={index}>{log}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Game;
