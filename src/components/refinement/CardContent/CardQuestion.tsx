
import React from 'react';
import { MessageSquareQuote } from 'lucide-react';
import { PromptCard } from '../types';

interface CardQuestionProps {
  card: PromptCard;
  textAccentColor: string;
}

const CardQuestion: React.FC<CardQuestionProps> = ({ card, textAccentColor }) => {
  return (
    <div>
      <div className={`flex items-center ${textAccentColor}`}>
        <MessageSquareQuote className="h-5 w-5 mr-2" />
        <h3 className="font-medium">Prompt</h3>
      </div>
      <p className="text-lg font-medium text-white mt-2">
        {card.question}
      </p>
    </div>
  );
};

export default CardQuestion;
