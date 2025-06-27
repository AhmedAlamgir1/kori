import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PromptCard } from "../types";
import { generateAISuggestion } from "../../../utils/refinementService";

export function useCardDeck(cards: PromptCard[], onSaveAnswers: (cards?: PromptCard[]) => void) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [promptCards, setPromptCards] = useState<PromptCard[]>(cards);
  const [isComplete, setIsComplete] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const totalCards = promptCards.length;
  const currentCard = promptCards[currentCardIndex];
  
  const handleNextCard = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(prevIndex => prevIndex + 1);
      setAiSuggestion("");
      setIsFlipped(false);
    } else {
      toast.info("No more cards left in this deck.");
      setIsComplete(true);
    }
  };
  
  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prevIndex => prevIndex - 1);
      setAiSuggestion("");
      setIsFlipped(false);
    }
  };
  
  const handleShuffleDeck = () => {
    const shuffled = [...promptCards].sort(() => Math.random() - 0.5);
    setPromptCards(shuffled);
    setCurrentCardIndex(0);
    setAiSuggestion("");
    setIsFlipped(false);
    toast.success("Deck shuffled!");
  };
  
  const handleAnswerChange = (value: string) => {
    const updatedCards = promptCards.map((card, index) => {
      if (index === currentCardIndex) {
        return { ...card, answer: value };
      }
      return card;
    });
    
    setPromptCards(updatedCards);
    onSaveAnswers(updatedCards);
  };

  const handleFlipCard = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      // Instead of calling handleGetAISuggestion, we'll load the suggestion here
      if (!aiSuggestion && !isGeneratingSuggestion) {
        setIsGeneratingSuggestion(true);
        generateAISuggestion(currentCard.question, currentCard.deckType || "general")
          .then(suggestion => {
            setAiSuggestion(suggestion);
          })
          .catch(error => {
            console.error("Error generating AI suggestion:", error);
            toast.error("Failed to generate suggestion. Please try again.");
          })
          .finally(() => {
            setIsGeneratingSuggestion(false);
          });
      }
    } else {
      setIsFlipped(false);
    }
  };

  const handleGetAISuggestion = async () => {
    if (isGeneratingSuggestion) return;
    
    if (!aiSuggestion) {
      setIsGeneratingSuggestion(true);
      try {
        const suggestion = await generateAISuggestion(currentCard.question, currentCard.deckType || "general");
        setAiSuggestion(suggestion);
      } catch (error) {
        console.error("Error generating AI suggestion:", error);
        toast.error("Failed to generate suggestion. Please try again.");
      } finally {
        setIsGeneratingSuggestion(false);
      }
    }
  };
  
  return {
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
  };
}
