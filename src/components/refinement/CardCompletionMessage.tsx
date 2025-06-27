
import React from 'react';
import { Sparkles } from 'lucide-react';

interface CardCompletionMessageProps {
  title: string;
  textAccentColor: string;
}

const CardCompletionMessage: React.FC<CardCompletionMessageProps> = ({ 
  title, 
  textAccentColor 
}) => {
  return (
    <div className="text-center p-8 space-y-4">
      <Sparkles className={`h-12 w-12 mx-auto ${textAccentColor}`} />
      <h3 className="text-xl font-semibold text-blue-200">
        No more cards left in the {title} deck
      </h3>
      <p className="text-slate-300">
        You can shuffle the deck to start over or try another creative technique.
      </p>
    </div>
  );
};

export default CardCompletionMessage;
