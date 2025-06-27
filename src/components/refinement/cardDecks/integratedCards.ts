
import { PromptCard } from '../types';
import { scamperCards } from './scamperCards';
import { whatIfCards } from './whatIfCards';
import { kaizenCards } from './kaizenCards';

// Combine all cards and add a type property to each
const allCards: PromptCard[] = [
  ...scamperCards.map(card => ({ 
    ...card, 
    deckType: 'scamper' as const,
  })),
  ...whatIfCards.map(card => ({ 
    ...card, 
    deckType: 'whatif' as const,
  })),
  ...kaizenCards.map(card => ({ 
    ...card, 
    deckType: 'kaizen' as const,
  }))
];

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = (array: PromptCard[]): PromptCard[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Export shuffled combined cards
export const integratedCards = shuffleArray(allCards);
