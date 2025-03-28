import React from "react";

interface WordCardProps {
  index: number;
  word: string;
  definition: string;
  onClose: () => void;
  onSelect: (index: number) => void;
}

const WordCardPopup: React.FC<WordCardProps> = ({
  index,
  word,
  definition,
  onClose,
  onSelect,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-600 rounded-lg p-6 max-w-md w-full relative">
        {/* Close button (X) in top right corner */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Word and definition */}
        <h2 className="text-2xl font-bold mb-3">{word}</h2>
        <p className="text-gray-200 mb-6">{definition}</p>

        {/* Choose button */}
        <button
          onClick={() => onSelect(index)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-200"
        >
          Choose This Card
        </button>
      </div>
    </div>
  );
};

export default WordCardPopup;
