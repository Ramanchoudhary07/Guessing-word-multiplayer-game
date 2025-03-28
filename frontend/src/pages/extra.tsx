${
    word.revealed
      ? word.team === "red"
        ? "bg-red-500 text-white"
        : word.team === "blue"
        ? "bg-blue-500 text-white"
        : word.team === "black"
        ? "bg-black text-white"
        : `bg-[url(/whiteCard.png)] text-white`
      : "bg-white"
  }