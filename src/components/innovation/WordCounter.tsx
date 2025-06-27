
import React from "react";

interface WordCounterProps {
  wordCount: number;
  minWords: number;
}

const WordCounter: React.FC<WordCounterProps> = ({ wordCount, minWords }) => {
  return (
    <span className={`text-xs ${
      wordCount >= minWords 
        ? 'text-green-500' 
        : (wordCount > 0 ? 'text-amber-400' : 'text-slate-400')
    }`}>
      {wordCount} words {wordCount < minWords && wordCount > 0 && `(${minWords - wordCount} more needed)`}
    </span>
  );
};

export default WordCounter;
