import React, { useState, useEffect, useCallback } from 'react';
import { ProductIdea } from "../../types";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Sparkles } from 'lucide-react';
import CardDeck from './CardDeck';
import ExportSection from './ExportSection';
import { integratedCards } from './cardDecks/integratedCards';
import { generateTailoredPrompts } from '../../utils/refinementService';
import LoadingAnimation from '../LoadingAnimation';
import { toast } from 'sonner';
import { PromptCard } from './types';
import RefinementNotes from './RefinementNotes';

interface RefinementDecksProps {
  selectedIdeas: ProductIdea[];
  onExportRefinedIdeas: () => void;
  problemStatement: {
    opportunity: string;
    problem: string;
  };
}

const RefinementDecks: React.FC<RefinementDecksProps> = ({
  selectedIdeas,
  onExportRefinedIdeas,
  problemStatement
}) => {
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [savedDeck, setSavedDeck] = useState(false);
  const [cards, setCards] = useState<PromptCard[]>(integratedCards);
  const [hasError, setHasError] = useState(false);

  const generateWithTimeout = useCallback(async (deckType: 'scamper' | 'whatif' | 'kaizen'): Promise<PromptCard[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('http://localhost:3001/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: yourPrompt }),
      });

      const result = await Promise.race([
        generateTailoredPrompts(problemStatement, selectedIdeas[0], deckType),
        new Promise<PromptCard[]>((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout generating ${deckType} cards`)), 30000);
        })
      ]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      console.error(`Error generating ${deckType} cards:`, error);
      return [];
    }
  }, [problemStatement, selectedIdeas]);

  useEffect(() => {
    let isMounted = true;

    const generateCustomizedCards = async () => {
      if (!selectedIdeas.length || !problemStatement.problem || isGeneratingCards) {
        return;
      }

      setIsGeneratingCards(true);
      setHasError(false);

      try {
        // Generate cards with proper error handling and timeouts
        const generateCardsWithFallback = async (deckType: 'scamper' | 'whatif' | 'kaizen') => {
          try {
            const cards = await generateWithTimeout(deckType);
            return cards.length > 0 ? cards : [];
          } catch (error) {
            console.error(`Error generating ${deckType} cards:`, error);
            return [];
          }
        };

        // Generate all card types concurrently with a timeout
        const [scamperCards, whatifCards, kaizenCards] = await Promise.all([
          generateCardsWithFallback('scamper'),
          generateCardsWithFallback('whatif'),
          generateCardsWithFallback('kaizen')
        ]);

        if (!isMounted) return;

        const customCards = [...scamperCards, ...whatifCards, ...kaizenCards];

        if (customCards.length > 0) {
          const shuffleArray = (array: PromptCard[]) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
          };

          setCards(shuffleArray(customCards));
          toast.success('Generated personalized refinement cards');
        } else {
          // If no custom cards were generated, use default cards
          toast.info('Using default refinement cards');
          setCards(integratedCards);
        }
      } catch (error) {
        console.error("Error generating tailored cards:", error);
        setHasError(false); // Don't show error UI, just use default cards
        toast.info('Using default refinement cards');
        setCards(integratedCards);
      } finally {
        if (isMounted) {
          setIsGeneratingCards(false);
        }
      }
    };

    generateCustomizedCards();

    return () => {
      isMounted = false;
    };
  }, [selectedIdeas, problemStatement, generateWithTimeout]);

  const handleSaveAnswers = (updatedCards?: PromptCard[]) => {
    if (updatedCards) {
      setCards(updatedCards);
    }
    setSavedDeck(true);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsGeneratingCards(true);
    // This will trigger the useEffect to run again
    setCards(integratedCards);
  };

  if (isGeneratingCards) {
    return (
      <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-indigo-500/30 p-6 flex flex-col items-center justify-center min-h-[300px]">
        <LoadingAnimation message="Loading refinement cards..." />
        <p className="text-blue-200/60 text-sm mt-2">This may take a moment...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-indigo-500/30 p-6 animate-fade-in h-full">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-blue-300 mb-2">Refinement Deck</h3>
        <p className="text-blue-200">
          Draw cards from our integrated deck to help you refine your idea in different ways. 
          Each card has a different approach to help you think more deeply about your concept.
        </p>
      </div>

      <div className="space-y-6">
        <Tabs value="integrated" className="w-full">
          <TabsContent value="integrated">
            <CardDeck 
              title="Refinement Cards"
              icon={<Sparkles className="h-5 w-5 text-blue-400" />}
              cards={cards}
              accentColor="blue"
              onSaveAnswers={handleSaveAnswers}
            />
          </TabsContent>
        </Tabs>
        
        <RefinementNotes cards={cards} />

        <ExportSection 
          onExportRefinedIdeas={onExportRefinedIdeas}
          isExportDisabled={!savedDeck}
        />
      </div>
    </div>
  );
};

export default RefinementDecks;
