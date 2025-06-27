import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PromptCard } from "./types";
import CardQuestion from "./CardContent/CardQuestion";
import CardAnswer from "./CardContent/CardAnswer";
import AISuggestion from "./CardContent/AISuggestion";

interface CardContainerProps {
  currentCard: PromptCard;
  currentCardIndex: number;
  totalCards: number;
  textAccentColor: string;
  backgroundGradient: string;
  aiSuggestion: string;
  isGeneratingSuggestion: boolean;
  onAnswerChange: (value: string) => void;
  onGetAISuggestion: () => void;
}

const CardContainer: React.FC<CardContainerProps> = ({
  currentCard,
  currentCardIndex,
  totalCards,
  textAccentColor,
  backgroundGradient,
  aiSuggestion,
  isGeneratingSuggestion,
  onAnswerChange,
  onGetAISuggestion,
}) => {
  return (
    <motion.div
      key={currentCardIndex}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="relative w-full"
    >
      <Card 
        className={`relative w-full bg-gradient-to-br ${backgroundGradient} border-slate-700 shadow-lg transition-all duration-300 hover:shadow-xl`}
      >
        <div className="absolute top-4 right-4">
          <div className="bg-slate-800/60 rounded-full px-2 py-1 text-xs text-slate-300">
            Card {currentCardIndex + 1} of {totalCards}
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            <CardQuestion 
              card={currentCard}
              textAccentColor={textAccentColor}
            />
            
            <CardAnswer 
              card={currentCard}
              textAccentColor={textAccentColor}
              onAnswerChange={onAnswerChange}
            />
            
            <AISuggestion
              suggestion={aiSuggestion}
              example={currentCard.example}
              isGenerating={isGeneratingSuggestion}
              onGetSuggestion={onGetAISuggestion}
              textAccentColor={textAccentColor}
              card={currentCard}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CardContainer;
