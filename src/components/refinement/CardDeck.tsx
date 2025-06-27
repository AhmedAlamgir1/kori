import React from "react";
import { AnimatePresence } from "framer-motion";
import { PromptCard } from "./types";
import CardHeader from "./CardHeader";
import CardNavigation from "./CardNavigation";
import CardCompletionMessage from "./CardCompletionMessage";
import CardContainer from "./CardContainer";
import { useCardDeck } from "./hooks/useCardDeck";
import { getCardStyling } from "./utils/CardStyling";

interface CardDeckProps {
  title: string;
  icon: React.ReactNode;
  cards: PromptCard[];
  accentColor: string;
  onSaveAnswers: (cards?: PromptCard[]) => void;
}

const CardDeck: React.FC<CardDeckProps> = ({ 
  title, 
  icon, 
  cards, 
  accentColor,
  onSaveAnswers
}) => {
  const {
    currentCardIndex,
    totalCards,
    currentCard,
    isComplete,
    aiSuggestion,
    isGeneratingSuggestion,
    isFlipped,
    handleNextCard,
    handlePrevCard,
    handleShuffleDeck,
    handleAnswerChange,
    handleGetAISuggestion,
    handleFlipCard
  } = useCardDeck(cards, onSaveAnswers);
  
  const { background: gradientClass, text: textAccentClass } = getCardStyling(
    currentCard?.deckType
  );
  
  if (isComplete) {
    return <CardCompletionMessage title={title} textAccentColor={textAccentClass} />;
  }
  
  return (
    <div className="space-y-6">
      <CardHeader
        title={title}
        icon={icon}
        currentCardIndex={currentCardIndex}
        totalCards={totalCards}
        onShuffleDeck={handleShuffleDeck}
      />
      
      <div className="relative min-h-[320px]">
        <AnimatePresence mode="wait">
          <CardContainer
            currentCard={currentCard}
            currentCardIndex={currentCardIndex}
            totalCards={totalCards}
            textAccentColor={textAccentClass}
            backgroundGradient={gradientClass}
            aiSuggestion={aiSuggestion}
            isGeneratingSuggestion={isGeneratingSuggestion}
            onAnswerChange={handleAnswerChange}
            onGetAISuggestion={handleGetAISuggestion}
            isFlipped={isFlipped}
            onFlipCard={handleFlipCard}
          />
        </AnimatePresence>
      </div>
      
      <CardNavigation
        currentCardIndex={currentCardIndex}
        totalCards={totalCards}
        accentColor={currentCard?.deckType || accentColor}
        onPrevCard={handlePrevCard}
        onNextCard={handleNextCard}
      />
    </div>
  );
};

export default CardDeck;
