import wordsData from "./words_data.json";

const wordsDataList: Record<string, string> = wordsData;

const wordsArray = Object.keys(wordsDataList);

type Team = "red" | "blue";

interface WordCard {
  word: string;
  defintion: string;
  revealed: boolean;
  team: Team | "neutral" | "black";
}

const getRandomLists = () => {
  const shuffled = [...wordsArray].sort(() => Math.random() - 0.5);
  return {
    redList: shuffled.slice(0, 9),
    blueList: shuffled.slice(9, 17),
    neutralList: shuffled.slice(17, 24),
    blackList: shuffled.slice(24, 25),
  };
};

export const getWordsList = () => {
  const { redList, blueList, neutralList, blackList } = getRandomLists();
  const red: WordCard[] = [];
  const blue: WordCard[] = [];
  const neutral: WordCard[] = [];
  const black: WordCard[] = [];

  redList.map((ele) =>
    red.push({
      word: ele,
      defintion: wordsDataList[ele],
      team: "red",
      revealed: false,
    })
  );

  blueList.map((ele) =>
    blue.push({
      word: ele,
      defintion: wordsDataList[ele],
      team: "blue",
      revealed: false,
    })
  );

  blackList.map((ele) =>
    black.push({
      word: ele,
      defintion: wordsDataList[ele],
      team: "black",
      revealed: false,
    })
  );

  neutralList.map((ele) =>
    neutral.push({
      word: ele,
      defintion: wordsDataList[ele],
      team: "neutral",
      revealed: false,
    })
  );

  const words: WordCard[] = [...blue, ...red, ...black, ...neutral];

  const shuffledWords = [...words].sort(() => Math.random() - 0.5);

  return shuffledWords;
};
